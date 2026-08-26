from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import JSONType, Base, StrEnum, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ContentStatus, Difficulty, VideoFormat, VideoProvider

video_categories = Table(
    "video_categories",
    Base.metadata,
    Column("video_id", ForeignKey("videos.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
)

course_videos = Table(
    "course_videos",
    Base.metadata,
    Column("course_id", ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True),
    Column("video_id", ForeignKey("videos.id", ondelete="CASCADE"), primary_key=True),
    Column("position", Integer, nullable=False, default=0),
    UniqueConstraint("course_id", "position", name="uq_course_position"),
)


class Category(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    parent_id: Mapped[UUID | None] = mapped_column(ForeignKey("categories.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Video(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "videos"

    expert_id: Mapped[UUID | None] = mapped_column(ForeignKey("experts.id"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    provider: Mapped[VideoProvider] = mapped_column(StrEnum(VideoProvider), nullable=False)
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    provider_video_id: Mapped[str | None] = mapped_column(String(100), index=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(StrEnum(Difficulty), default=Difficulty.BEGINNER, nullable=False)
    format: Mapped[VideoFormat] = mapped_column(StrEnum(VideoFormat), default=VideoFormat.LONG, nullable=False)
    status: Mapped[ContentStatus] = mapped_column(
        StrEnum(ContentStatus), default=ContentStatus.DRAFT, nullable=False
    )
    required_watch_percentage: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    reward_amount: Mapped[Decimal | None] = mapped_column(Numeric(24, 9))
    learning_objectives: Mapped[list] = mapped_column(JSONType, default=list)
    tags: Mapped[list] = mapped_column(JSONType, default=list)
    views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reviewed_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    review_note: Mapped[str | None] = mapped_column(String(1000))

    categories: Mapped[list[Category]] = relationship(secondary=video_categories)


class Course(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    expert_id: Mapped[UUID | None] = mapped_column(ForeignKey("experts.id"))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(StrEnum(Difficulty), default=Difficulty.BEGINNER, nullable=False)
    status: Mapped[ContentStatus] = mapped_column(
        StrEnum(ContentStatus), default=ContentStatus.DRAFT, nullable=False
    )
    reward_bonus_amount: Mapped[Decimal | None] = mapped_column(Numeric(24, 9))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    videos: Mapped[list[Video]] = relationship(secondary=course_videos)
