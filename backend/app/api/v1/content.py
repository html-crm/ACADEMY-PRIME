from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, or_, select
from sqlalchemy.orm import joinedload

from app.core.deps import DbSession
from app.models.content import Category, Course, Video, course_videos
from app.models.enums import ContentStatus
from app.models.reward import RewardSettings
from app.schemas.common import Page

router = APIRouter(prefix="/content", tags=["content"])


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    parent_id: UUID | None


class VideoPublicOut(BaseModel):
    id: UUID
    title: str
    slug: str
    description: str | None
    provider: str
    provider_video_id: str | None
    source_url: str | None = None
    thumbnail_url: str | None
    duration_seconds: int | None
    language: str
    difficulty: str
    format: str
    documentary: bool
    effective_reward: str
    required_watch_percentage: str


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: DbSession) -> list[CategoryOut]:
    rows = db.scalars(select(Category).where(Category.is_active.is_(True)).order_by(Category.sort_order)).all()
    return [CategoryOut.model_validate(r) for r in rows]


def _effective_reward(video: Video, settings_row: RewardSettings | None) -> str:
    if video.reward_amount is not None:
        return str(video.reward_amount)
    if settings_row is not None:
        return str(settings_row.default_video_reward)
    return "0"


def _get_reward_settings(db) -> RewardSettings | None:
    return db.get(RewardSettings, 1)


MIN_REQUIRED_PERCENTAGE = Decimal("90")


def _effective_required_percentage(video: Video, settings_row: RewardSettings | None) -> str:
    value = (
        video.required_watch_percentage
        if video.required_watch_percentage is not None
        else (settings_row.default_watch_percentage if settings_row else Decimal("90"))
    )
    return f"{max(value, MIN_REQUIRED_PERCENTAGE):.1f}"


def _public_video(video: Video, settings_row: RewardSettings | None, include_source: bool = False) -> VideoPublicOut:
    return VideoPublicOut(
        id=video.id,
        title=video.title,
        slug=video.slug,
        description=video.description,
        provider=video.provider.value,
        provider_video_id=video.provider_video_id,
        source_url=video.source_url if include_source else None,
        thumbnail_url=video.thumbnail_url,
        duration_seconds=video.duration_seconds,
        language=video.language,
        difficulty=video.difficulty.value,
        format=video.format.value,
        documentary=video.documentary,
        effective_reward=_effective_reward(video, settings_row),
        required_watch_percentage=_effective_required_percentage(video, settings_row),
    )


@router.get("/videos", response_model=Page[VideoPublicOut])
def list_videos(
    db: DbSession,
    q: str | None = Query(default=None, max_length=100),
    difficulty: str | None = Query(default=None),
    language: str | None = Query(default=None),
    format: str | None = Query(default=None),
    documentary: bool | None = Query(default=None),
    category_id: UUID | None = Query(default=None),
    exclude_in_course: bool = Query(default=False),
    sort: str = Query(default="newest", pattern="^(newest|popular|reward)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
) -> Page[VideoPublicOut]:
    base = select(Video).where(Video.status == ContentStatus.PUBLISHED)
    count_query = select(func.count()).select_from(Video).where(Video.status == ContentStatus.PUBLISHED)
    if q:
        pattern = f"%{q}%"
        condition = or_(Video.title.ilike(pattern), Video.description.ilike(pattern))
        base = base.where(condition)
        count_query = count_query.where(condition)
    if difficulty:
        base = base.where(Video.difficulty == difficulty)
        count_query = count_query.where(Video.difficulty == difficulty)
    if language:
        base = base.where(Video.language == language)
        count_query = count_query.where(Video.language == language)
    if format:
        base = base.where(Video.format == format)
        count_query = count_query.where(Video.format == format)
    if documentary is not None:
        base = base.where(Video.documentary.is_(documentary))
        count_query = count_query.where(Video.documentary.is_(documentary))
    if exclude_in_course:
        course_video_ids = select(course_videos.c.video_id)
        base = base.where(Video.id.notin_(course_video_ids))
        count_query = count_query.where(Video.id.notin_(course_video_ids))
    total = db.scalar(count_query) or 0
    order_by = {
        "newest": Video.published_at.desc(),
        "popular": Video.views_count.desc(),
        "reward": Video.reward_amount.desc().nullslast(),
    }[sort]
    rows = db.scalars(base.order_by(order_by).offset((page - 1) * page_size).limit(page_size)).all()
    settings_row = _get_reward_settings(db)
    items = [_public_video(v, settings_row) for v in rows]
    return Page(items=items, total=total, page=page, page_size=page_size)


@router.get("/videos/{video_id}", response_model=VideoPublicOut)
def get_video(video_id: UUID, db: DbSession) -> VideoPublicOut:
    video = db.get(Video, video_id)
    if video is None or video.status != ContentStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "video_not_found", "message": "Video not available."},
        )
    return _public_video(video, _get_reward_settings(db), include_source=True)


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    description: str | None
    thumbnail_url: str | None
    language: str
    difficulty: str
    video_count: int
    total_duration: int


@router.get("/courses", response_model=Page[CourseOut])
def list_courses(
    db: DbSession,
    q: str | None = Query(default=None, max_length=100),
    difficulty: str | None = Query(default=None),
    sort: str = Query(default="newest", pattern="^(newest|popular|reward)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=200),
) -> Page[CourseOut]:
    base = (
        select(
            Course,
            func.count(Video.id).label("video_count"),
            func.coalesce(func.sum(Video.duration_seconds), 0).label("total_duration"),
        )
        .join(course_videos, Course.id == course_videos.c.course_id, isouter=True)
        .join(Video, Video.id == course_videos.c.video_id, isouter=True)
        .where(Course.status == ContentStatus.PUBLISHED)
        .group_by(Course.id)
    )
    count_query = select(func.count()).select_from(Course).where(Course.status == ContentStatus.PUBLISHED)
    if q:
        pattern = f"%{q}%"
        condition = or_(Course.title.ilike(pattern), Course.description.ilike(pattern))
        base = base.where(condition)
        count_query = count_query.where(condition)
    if difficulty:
        base = base.where(Course.difficulty == difficulty)
        count_query = count_query.where(Course.difficulty == difficulty)
    total = db.scalar(count_query) or 0
    order_by = {
        "newest": Course.published_at.desc(),
        "popular": func.count(Video.id).desc(),
        "reward": Course.reward_bonus_amount.desc().nullslast(),
    }[sort]
    rows = db.scalars(base.order_by(order_by).offset((page - 1) * page_size).limit(page_size)).all()
    items = [
        CourseOut(
            id=r[0].id,
            title=r[0].title,
            slug=r[0].slug,
            description=r[0].description,
            thumbnail_url=r[0].thumbnail_url,
            language=r[0].language,
            difficulty=r[0].difficulty.value,
            video_count=r[1],
            total_duration=r[2],
        )
        for r in rows
    ]
    return Page(items=items, total=total, page=page, page_size=page_size)
