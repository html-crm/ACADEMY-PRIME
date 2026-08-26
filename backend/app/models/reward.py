from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, StrEnum, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ClaimStatus, EarningStatus, RewardEntryType, RewardStatus


class Reward(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rewards"
    __table_args__ = (
        UniqueConstraint("source_type", "source_id", "user_id", name="uq_reward_source_user"),
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    entry_type: Mapped[RewardEntryType] = mapped_column(StrEnum(RewardEntryType), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[UUID] = mapped_column(nullable=False)
    video_id: Mapped[UUID | None] = mapped_column(ForeignKey("videos.id"))
    course_id: Mapped[UUID | None] = mapped_column(ForeignKey("courses.id"))
    completion_id: Mapped[UUID | None] = mapped_column(ForeignKey("video_completions.id"))
    amount: Mapped[Decimal] = mapped_column(Numeric(24, 9), default=0, nullable=False)
    token_mint: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    token_decimals: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    status: Mapped[RewardStatus] = mapped_column(
        StrEnum(RewardStatus), default=RewardStatus.PENDING, nullable=False
    )
    tx_signature: Mapped[str | None] = mapped_column(String(128))
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class RewardClaim(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reward_claims"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_id: Mapped[UUID] = mapped_column(ForeignKey("rewards.id", ondelete="RESTRICT"), unique=True, nullable=False)
    wallet_address: Mapped[str] = mapped_column(String(64), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(24, 9), nullable=False)
    status: Mapped[ClaimStatus] = mapped_column(StrEnum(ClaimStatus), default=ClaimStatus.REQUESTED, nullable=False)
    tx_signature: Mapped[str | None] = mapped_column(String(128))
    error: Mapped[str | None] = mapped_column(String(500))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ExpertEarning(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "expert_earnings"

    expert_id: Mapped[UUID] = mapped_column(ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    entry_type: Mapped[RewardEntryType] = mapped_column(StrEnum(RewardEntryType), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source_id: Mapped[UUID] = mapped_column(nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(24, 9), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="token", nullable=False)
    status: Mapped[EarningStatus] = mapped_column(StrEnum(EarningStatus), default=EarningStatus.PENDING, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class RewardSettings(TimestampMixin, Base):
    __tablename__ = "reward_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    default_video_reward: Mapped[Decimal] = mapped_column(Numeric(24, 9), default=Decimal("0.001"), nullable=False)
    course_bonus_reward: Mapped[Decimal] = mapped_column(Numeric(24, 9), default=0, nullable=False)
    default_watch_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("85"), nullable=False)
    daily_claim_limit: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    min_account_age_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    expert_per_video_reward: Mapped[Decimal | None] = mapped_column(Numeric(24, 9))
    expert_model: Mapped[str | None] = mapped_column(String(20))
    updated_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))


class BlockchainTransaction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "blockchain_transactions"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    claim_id: Mapped[UUID | None] = mapped_column(ForeignKey("reward_claims.id"))
    network: Mapped[str] = mapped_column(String(20), nullable=False)
    signature: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    mint: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(24, 9), default=0, nullable=False)
    status: Mapped[ClaimStatus] = mapped_column(StrEnum(ClaimStatus), default=ClaimStatus.SUBMITTED, nullable=False)
    slot: Mapped[int | None] = mapped_column(Integer)
    block_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
