from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import JSONType, Base, StrEnum, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ExpertStatus
from app.models.user import User


class Expert(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "experts"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    status: Mapped[ExpertStatus] = mapped_column(StrEnum(ExpertStatus), default=ExpertStatus.PENDING, nullable=False)
    display_name: Mapped[str] = mapped_column(String(80), nullable=False)
    headline: Mapped[str | None] = mapped_column(String(160))
    bio: Mapped[str | None] = mapped_column(String(2000))
    links: Mapped[list] = mapped_column(JSONType, default=list)
    reviewed_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id", use_alter=True))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_note: Mapped[str | None] = mapped_column(String(1000))

    user: Mapped[User] = relationship(back_populates="expert", foreign_keys=[user_id])
