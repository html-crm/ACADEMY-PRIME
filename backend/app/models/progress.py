from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import JSONType, Base, StrEnum, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import VerificationLevel


class VideoProgress(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "video_progress"
    __table_args__ = (UniqueConstraint("user_id", "video_id", name="uq_progress_user_video"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    last_position_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_position_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    accumulated_watch_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    heartbeat_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provider_ended_seen: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    first_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class VideoCompletion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "video_completions"
    __table_args__ = (UniqueConstraint("user_id", "video_id", name="uq_completion_user_video"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id", ondelete="CASCADE"), nullable=False)
    verification_level: Mapped[VerificationLevel] = mapped_column(StrEnum(VerificationLevel), nullable=False)
    required_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    evidence: Mapped[dict] = mapped_column(JSONType, default=dict)


class CourseEnrollment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "course_enrollments"
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_enrollment_user_course"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
