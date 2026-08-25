from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.models.content import Video
from app.models.enums import (
    ContentStatus,
    Difficulty,
    EarningStatus,
    ExpertStatus,
    RewardStatus,
    UserRole,
    VideoFormat,
)
from app.models.expert import Expert
from app.models.progress import VideoCompletion
from app.models.reward import ExpertEarning, Reward as RewardLedger
from app.services import audit_service, video_service

router = APIRouter(prefix="/experts", tags=["expert-videos"])

SHORT_MAX_SECONDS = 60


class VideoSubmitIn(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    source_url: str = Field(min_length=10, max_length=500)
    duration_seconds: int = Field(gt=0, le=86400 * 4)
    language: str = Field(default="en", pattern=r"^[a-z]{2}(-[A-Za-z]{2})?$")
    difficulty: Difficulty = Difficulty.BEGINNER
    format: VideoFormat = VideoFormat.LONG
    tags: list[str] = Field(default_factory=list, max_length=20)
    learning_objectives: list[str] = Field(default_factory=list, max_length=20)
    as_draft: bool = False


class VideoSubmitOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str | None
    status: str
    provider: str
    source_url: str
    provider_video_id: str | None
    thumbnail_url: str | None
    duration_seconds: int | None
    difficulty: str
    format: str
    language: str
    tags: list[str]


def _admin_expert(user: CurrentUser, db: DbSession) -> Expert:
    """Admins publish directly: get-or-create an approved expert profile."""
    expert = db.scalars(select(Expert).where(Expert.user_id == user.id)).first()
    if expert is None:
        expert = Expert(user_id=user.id, display_name=user.username, status=ExpertStatus.APPROVED)
        db.add(expert)
        db.commit()
    elif expert.status != ExpertStatus.APPROVED:
        expert.status = ExpertStatus.APPROVED
        db.commit()
    return expert


def _require_approved_expert(user: CurrentUser, db: DbSession) -> Expert:
    # Column-level select: immune to identity-map staleness in long sessions.
    if user.role == UserRole.ADMIN:
        return _admin_expert(user, db)
    expert_id = db.scalar(select(Expert.id).where(Expert.user_id == user.id, Expert.status == ExpertStatus.APPROVED))
    if expert_id is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            detail={"code": "not_approved_expert", "message": "Only approved experts can submit videos."},
        )
    expert = db.get(Expert, expert_id)
    return expert


def _require_own_video(user: CurrentUser, db: DbSession, video_id) -> Video:
    from uuid import UUID

    try:
        pk = UUID(str(video_id))
    except ValueError:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "video_not_found", "message": "Video not found among your posts."},
        )
    stmt = select(Expert.id).where(Expert.user_id == user.id)
    if user.role != UserRole.ADMIN:
        stmt = stmt.where(Expert.status == ExpertStatus.APPROVED)
    own_expert_id = db.scalar(stmt)
    video = db.get(Video, pk)
    if video is None or own_expert_id is None or video.expert_id != own_expert_id:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "video_not_found", "message": "Video not found among your posts."},
        )
    return video


def _validate_duration(format_: VideoFormat, duration_seconds: int) -> None:
    if format_ == VideoFormat.SHORT and duration_seconds > SHORT_MAX_SECONDS:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "short_too_long",
                "message": f"Short videos must be {SHORT_MAX_SECONDS} seconds or less.",
            },
        )


@router.post("/videos", response_model=VideoSubmitOut, status_code=status.HTTP_201_CREATED)
def submit_video(data: VideoSubmitIn, request: Request, user: CurrentUser, db: DbSession) -> VideoSubmitOut:
    _require_approved_expert(user, db)
    _validate_duration(data.format, data.duration_seconds)
    try:
        provider, provider_video_id = video_service.detect_provider(data.source_url)
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "unsupported_video_url",
                "message": "Use a supported YouTube, Instagram or Vimeo URL.",
            },
        )
    video = Video(
        expert_id=user.expert.id if user.expert else None,
        title=data.title.strip(),
        slug=video_service.slugify(data.title),
        description=data.description,
        provider=provider,
        source_url=data.source_url.strip(),
        provider_video_id=provider_video_id,
        thumbnail_url=video_service.extract_youtube_thumbnail(provider_video_id),
        duration_seconds=data.duration_seconds,
        language=data.language,
        difficulty=data.difficulty,
        format=data.format,
        tags=data.tags,
        learning_objectives=data.learning_objectives,
        status=ContentStatus.DRAFT if data.as_draft else ContentStatus.SUBMITTED,
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    audit_service.log(
        db, "expert.video.submitted", actor=user, entity_type="video", entity_id=str(video.id), request=request
    )
    return _video_out(video)


@router.get("/me/videos", response_model=list[VideoSubmitOut])
def my_videos(user: CurrentUser, db: DbSession) -> list[VideoSubmitOut]:
    _require_approved_expert(user, db)
    rows = db.scalars(select(Video).where(Video.expert_id == user.expert.id).order_by(Video.created_at.desc())).all()
    return [_video_out(v) for v in rows]


class VideoUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    source_url: str | None = Field(default=None, min_length=8, max_length=500)
    duration_seconds: int | None = Field(default=None, gt=0, le=86400 * 4)
    difficulty: Difficulty | None = None
    format: VideoFormat | None = None
    language: str | None = Field(default=None, min_length=2, max_length=5)
    tags: list[str] | None = Field(default=None, max_length=20)


class ExpertEarningsOut(BaseModel):
    videos_total: int
    videos_published: int
    completions: int
    learner_rewards_issued: str
    earnings_pending: str
    earnings_paid: str


def _video_out(v: Video) -> VideoSubmitOut:
    return VideoSubmitOut(
        id=str(v.id),
        title=v.title,
        slug=v.slug,
        description=v.description,
        status=v.status.value,
        provider=v.provider.value,
        source_url=v.source_url,
        provider_video_id=v.provider_video_id,
        thumbnail_url=v.thumbnail_url,
        duration_seconds=v.duration_seconds,
        difficulty=v.difficulty.value,
        format=v.format.value,
        language=v.language,
        tags=v.tags or [],
    )


@router.patch("/videos/{video_id}", response_model=VideoSubmitOut)
def update_video(
    video_id: str,
    data: VideoUpdateIn,
    request: Request,
    user: CurrentUser,
    db: DbSession,
) -> VideoSubmitOut:
    _require_approved_expert(user, db)
    video = _require_own_video(user, db, video_id)

    if data.duration_seconds is not None or data.format is not None:
        new_format = data.format or video.format
        new_duration = data.duration_seconds or video.duration_seconds
        _validate_duration(new_format, new_duration)

    if data.title is not None:
        video.title = data.title.strip()
        video.slug = f"{video_service.slugify(video.title)}-{str(video.id)[:8]}"
    if data.description is not None:
        video.description = data.description
    if data.source_url is not None:
        provider, provider_video_id = video_service.detect_provider(data.source_url)
        if provider is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "unsupported_video_url", "message": "Use a supported YouTube, Instagram or Vimeo URL."},
            )
        video.source_url = data.source_url.strip()
        video.provider = provider
        video.provider_video_id = provider_video_id
        if provider.value == "youtube":
            video.thumbnail_url = video_service.extract_youtube_thumbnail(provider_video_id)
    if data.duration_seconds is not None:
        video.duration_seconds = data.duration_seconds
    if data.difficulty is not None:
        video.difficulty = data.difficulty
    if data.language is not None:
        video.language = data.language
    if data.tags is not None:
        video.tags = data.tags

    # Any content edit sends the post back through admin review,
    # except drafts which keep their draft state.
    if data.format is not None and data.format != video.format:
        video.format = data.format
    if video.status != ContentStatus.DRAFT:
        video.status = ContentStatus.SUBMITTED

    db.commit()
    db.refresh(video)
    audit_service.log(
        db, "expert.video.updated", actor=user, entity_type="video", entity_id=str(video.id), request=request
    )
    return _video_out(video)


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: str,
    request: Request,
    user: CurrentUser,
    db: DbSession,
) -> None:
    _require_approved_expert(user, db)
    video = _require_own_video(user, db, video_id)
    if video.status == ContentStatus.PUBLISHED:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "code": "published_video",
                "message": "Ask an admin to unpublish this lesson before deleting it.",
            },
        )
    db.delete(video)
    db.commit()
    audit_service.log(
        db, "expert.video.deleted", actor=user, entity_type="video", entity_id=str(video.id), request=request
    )


@router.get("/me/earnings", response_model=ExpertEarningsOut)
def my_earnings(user: CurrentUser, db: DbSession) -> ExpertEarningsOut:
    expert = _require_approved_expert(user, db)
    expert_videos = list(db.scalars(select(Video.id).where(Video.expert_id == expert.id)))
    videos_total = len(expert_videos)
    videos_published = int(
        db.scalar(
            select(func.count()).select_from(Video).where(
                Video.expert_id == expert.id,
                Video.status == ContentStatus.PUBLISHED,
            )
        )
        or 0
    )
    completions = 0
    learner_rewards = Decimal("0")
    earnings_pending = Decimal("0")
    earnings_paid = Decimal("0")

    if expert_videos:
        completions = int(
            db.scalar(
                select(func.count()).select_from(VideoCompletion).where(
                    VideoCompletion.video_id.in_(expert_videos)
                )
            )
            or 0
        )
        # Rewards issued to learners from this expert's videos.
        learner_rewards = Decimal(
            str(
                db.scalar(
                    select(func.coalesce(func.sum(RewardLedger.amount), 0)).where(
                        RewardLedger.video_id.in_(expert_videos),
                        RewardLedger.status.in_([RewardStatus.AVAILABLE, RewardStatus.CLAIMED]),
                    )
                )
                or 0
            )
        )

    earning_rows = db.scalars(select(ExpertEarning).where(ExpertEarning.expert_id == expert.id)).all()
    for row in earning_rows:
        if row.status == EarningStatus.PAID:
            earnings_paid += Decimal(str(row.amount))
        else:
            earnings_pending += Decimal(str(row.amount))

    return ExpertEarningsOut(
        videos_total=videos_total,
        videos_published=videos_published,
        completions=completions,
        learner_rewards_issued=str(learner_rewards),
        earnings_pending=str(earnings_pending),
        earnings_paid=str(earnings_paid),
    )
