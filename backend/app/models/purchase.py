from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VideoPurchase(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "video_purchases"
    __table_args__ = (UniqueConstraint("user_id", "video_id", name="uq_purchase_user_video"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(24, 9), nullable=False)
    wallet_address: Mapped[str] = mapped_column(String(64), nullable=False)
    receiver_address: Mapped[str] = mapped_column(String(64), nullable=False)
    tx_signature: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    network: Mapped[str] = mapped_column(String(30), default="devnet", nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
