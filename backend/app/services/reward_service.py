from decimal import Decimal
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.content import Video
from app.models.enums import RewardEntryType, RewardStatus
from app.models.progress import VideoCompletion
from app.models.reward import Reward as RewardLedger
from app.models.reward import RewardSettings


def get_reward_settings(db: Session) -> RewardSettings:
    row = db.get(RewardSettings, 1)
    if row is None:
        row = RewardSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


def effective_video_reward(db: Session, video: Video) -> Decimal:
    if video.reward_amount is not None:
        return video.reward_amount
    settings = get_reward_settings(db)
    return settings.default_video_reward


def issue_completion_reward(
    db: Session,
    user_id: UUID,
    completion: VideoCompletion,
    video: Video,
) -> RewardLedger | None:
    amount = effective_video_reward(db, video)
    if amount <= 0:
        return None
    settings = get_settings()
    entry = RewardLedger(
        user_id=user_id,
        entry_type=RewardEntryType.VIDEO_COMPLETION,
        source_type="video_completion",
        source_id=completion.id,
        video_id=video.id,
        completion_id=completion.id,
        amount=amount,
        token_mint=settings.TOKEN_MINT,
        token_decimals=settings.TOKEN_DECIMALS,
        status=RewardStatus.AVAILABLE,
    )
    db.add(entry)
    try:
        db.commit()
        db.refresh(entry)
        return entry
    except IntegrityError:
        db.rollback()
        return None
