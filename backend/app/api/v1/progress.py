from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.core.rate_limit import rate_limit_heartbeat
from app.models.content import Video
from app.models.enums import ContentStatus, VerificationLevel
from app.models.progress import VideoCompletion, VideoProgress
from app.models.reward import RewardSettings
from app.models.user import User
from app.schemas.common import Page
from app.schemas.progress import HeartbeatIn, HeartbeatOut
from app.services import notification_service
from app.services.reward_service import get_reward_settings, issue_completion_reward

router = APIRouter(prefix="/progress", tags=["progress"])

SEEK_TOLERANCE_SECONDS = 5.0
MAX_HEARTBEAT_GAP_SECONDS = 120.0
ACCUMULATED_TIME_FACTOR = 0.8
FIRST_BEAT_MAX_CREDIT = 10.0
MIN_REQUIRED_PERCENTAGE = Decimal("90")


def _effective_required_percentage(video: Video, settings_row: RewardSettings) -> Decimal:
    return max(
        (video.required_watch_percentage if video.required_watch_percentage is not None else settings_row.default_watch_percentage),
        MIN_REQUIRED_PERCENTAGE,
    )


def _as_utc(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


class CompletionResult:
    __slots__ = ("completed", "completion", "required")

    def __init__(self, completed: bool, completion: VideoCompletion | None, required: float):
        self.completed = completed
        self.completion = completion
        self.required = required


@router.post("/heartbeat", response_model=HeartbeatOut)
def heartbeat(data: HeartbeatIn, user: CurrentUser, db: DbSession) -> HeartbeatOut:
    rate_limit_heartbeat(str(user.id))

    if user.risk_score >= get_settings().RISK_SCORE_REWARD_THRESHOLD:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail={"code": "high_risk_account", "message": "Account flagged. Contact support."},
        )

    video = db.get(Video, data.video_id)
    if video is None or video.status != ContentStatus.PUBLISHED:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "video_not_found", "message": "Video not available."},
        )
    if not video.duration_seconds or video.duration_seconds <= 0:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "code": "duration_unknown",
                "message": "This video cannot be tracked until its duration is set.",
            },
        )

    settings_row: RewardSettings = get_reward_settings(db)
    required = float(_effective_required_percentage(video, settings_row))

    now = datetime.now(timezone.utc)
    row = db.scalar(
        select(VideoProgress).where(
            VideoProgress.user_id == user.id, VideoProgress.video_id == video.id
        )
    )
    if row is None:
        row = VideoProgress(user_id=user.id, video_id=video.id, first_seen_at=now)
        db.add(row)
        db.flush()
        elapsed = 0.0
    else:
        elapsed = min(max((now - _as_utc(row.updated_at)).total_seconds(), 0.0), MAX_HEARTBEAT_GAP_SECONDS)

    position = int(min(max(data.position_seconds, 0), video.duration_seconds))
    delta = max(0, position - row.last_position_seconds)

    if data.state == "paused":
        credited = 0.0
    elif row.heartbeat_count == 0:
        credited = min(float(delta), FIRST_BEAT_MAX_CREDIT)
    elif delta > elapsed + SEEK_TOLERANCE_SECONDS:
        user.risk_score = min(user.risk_score + 1, 100)
        credited = min(delta, max(elapsed, 0.0))
    else:
        credited = float(delta)

    row.last_position_seconds = position
    row.max_position_seconds = max(row.max_position_seconds, position)
    row.accumulated_watch_seconds = int(row.accumulated_watch_seconds + credited)
    row.heartbeat_count += 1
    if data.ended:
        row.provider_ended_seen = True

    existing_completion = db.scalar(
        select(VideoCompletion).where(
            VideoCompletion.user_id == user.id, VideoCompletion.video_id == video.id
        )
    )

    completed = False
    reward_issued = False
    if existing_completion is None:
        ratio_ok = (row.max_position_seconds / video.duration_seconds) * 100 >= required
        time_ok = row.accumulated_watch_seconds >= (
            video.duration_seconds * required / 100 * ACCUMULATED_TIME_FACTOR
        )
        provider_ok = (
            row.provider_ended_seen if video.provider.value == "youtube" else True
        )
        if ratio_ok and time_ok and provider_ok:
            verification_level = (
                VerificationLevel.PROVIDER_ENDED
                if video.provider.value == "youtube" and row.provider_ended_seen
                else VerificationLevel.HEARTBEAT_ONLY
            )
            completion = VideoCompletion(
                user_id=user.id,
                video_id=video.id,
                verification_level=verification_level,
                required_percentage=Decimal(f"{required:.2f}"),
                evidence={
                    "max_position_seconds": row.max_position_seconds,
                    "accumulated_watch_seconds": row.accumulated_watch_seconds,
                    "duration_seconds": video.duration_seconds,
                    "heartbeats": row.heartbeat_count,
                    "provider_ended": row.provider_ended_seen,
                },
            )
            db.add(completion)
            try:
                db.flush()
            except Exception:
                db.rollback()
                completion = db.scalar(
                    select(VideoCompletion).where(
                        VideoCompletion.user_id == user.id,
                        VideoCompletion.video_id == video.id,
                    )
                )
            if completion is not None:
                if user.risk_score < get_settings().RISK_SCORE_REWARD_THRESHOLD:
                    entry = issue_completion_reward(db, user.id, completion, video)
                else:
                    entry = None
                if entry is not None:
                    reward_issued = True
                    notification_service.notify(
                        db,
                        user.id,
                        "notification.reward.available",
                        {"amount": str(entry.amount), "video_title": video.title},
                    )
                completed = True
    else:
        completed = True

    current_percentage = f"{min(100.0, row.max_position_seconds / video.duration_seconds * 100):.1f}"

    db.commit()
    return HeartbeatOut(
        accepted=True,
        max_position_seconds=row.max_position_seconds,
        required_percentage=f"{required:.1f}",
        current_percentage=current_percentage,
        completed=completed,
        reward_issued=reward_issued,
    )


@router.get("/my", response_model=Page[dict])
def my_progress(
    user: CurrentUser,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
) -> Page[dict]:
    base = select(VideoProgress).where(VideoProgress.user_id == user.id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    rows = db.scalars(
        base.order_by(VideoProgress.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).all()

    items = []
    for row in rows:
        video = db.get(Video, row.video_id)
        completion = db.scalar(
            select(VideoCompletion).where(
                VideoCompletion.user_id == user.id, VideoCompletion.video_id == row.video_id
            )
        )
        percentage = (
            min(100.0, row.max_position_seconds / video.duration_seconds * 100)
            if video and video.duration_seconds
            else 0.0
        )
        items.append(
            {
                "video_id": str(row.video_id),
                "title": video.title if video else "",
                "thumbnail_url": video.thumbnail_url if video else None,
                "last_position_seconds": row.last_position_seconds,
                "percentage": f"{percentage:.1f}",
                "completed": completion is not None,
                "updated_at": row.updated_at.isoformat(),
            }
        )
    return Page(items=items, total=total, page=page, page_size=page_size)
