import re
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from app.core.deps import DbSession, RequireAdmin, require_roles
from app.models.content import Category, Video, Course, course_videos
from app.models.enums import ContentStatus, UserRole, VideoFormat, Difficulty
from app.services import audit_service, notification_service, video_service

router = APIRouter(
    prefix="/admin",
    tags=["admin-content"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


class VideoReviewIn(BaseModel):
    action: Literal["approve", "reject", "publish", "suspend", "unpublish", "delete"]
    note: str | None = Field(default=None, max_length=1000)


class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    parent_id: UUID | None = None
    is_active: bool = True
    sort_order: int = 0


@router.get("/videos", response_model=list[dict])
def list_videos_admin(
    admin: RequireAdmin,
    db: DbSession,
    status_filter: ContentStatus | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None, max_length=100),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> list[dict]:
    query = select(Video)
    if status_filter:
        query = query.where(Video.status == status_filter)
    if q:
        query = query.where(Video.title.ilike(f"%{q}%"))
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        query.order_by(Video.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return [
        {
            "id": str(v.id),
            "title": v.title,
            "provider": v.provider.value,
            "provider_video_id": v.provider_video_id,
            "duration_seconds": v.duration_seconds,
            "language": v.language,
            "difficulty": v.difficulty.value,
            "format": v.format.value,
            "status": v.status.value,
            "expert_id": str(v.expert_id) if v.expert_id else None,
            "reward_amount": str(v.reward_amount) if v.reward_amount else None,
            "created_at": v.created_at.isoformat(),
        }
        for v in rows
    ]


def _video_owner_user_id(db, video: Video):
    if video.expert_id is None:
        return None
    from app.models.expert import Expert

    expert = db.get(Expert, video.expert_id)
    return expert.user_id if expert else None


@router.patch("/videos/{video_id}/review", response_model=dict)
def review_video(
    video_id: UUID,
    data: VideoReviewIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> dict:
    video = db.get(Video, video_id)
    if video is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "video_not_found", "message": "Video not found."},
        )

    transitions = {
        "approve": (
            ContentStatus.APPROVED,
            [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW, ContentStatus.REJECTED],
        ),
        "reject": (
            ContentStatus.REJECTED,
            [ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW, ContentStatus.APPROVED],
        ),
        "publish": (ContentStatus.PUBLISHED, [ContentStatus.APPROVED, ContentStatus.SUSPENDED]),
        "suspend": (ContentStatus.SUSPENDED, [ContentStatus.PUBLISHED, ContentStatus.APPROVED]),
        "unpublish": (ContentStatus.APPROVED, [ContentStatus.PUBLISHED]),
    }

    if data.action == "delete":
        if video.status == ContentStatus.PUBLISHED:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail={"code": "unpublish_first", "message": "Unpublish before deleting."},
            )
        db.delete(video)
        db.commit()
        audit_service.log(db, "admin.video.deleted", actor=admin, entity_type="video", entity_id=str(video_id), request=request)
        return {"id": str(video_id), "status": "deleted"}

    target_status, allowed_from = transitions[data.action]
    if video.status not in allowed_from:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "code": "invalid_transition",
                "message": f"Cannot {data.action} a video in status '{video.status.value}'.",
            },
        )
    if target_status == ContentStatus.PUBLISHED and (not video.duration_seconds or video.duration_seconds <= 0):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "code": "duration_required",
                "message": "Set duration_seconds before publishing so watch verification works.",
            },
        )

    video.status = target_status
    video.reviewed_by = admin.id
    video.review_note = data.note
    if target_status == ContentStatus.PUBLISHED:
        video.published_at = datetime.now(timezone.utc)

    owner_user_id = _video_owner_user_id(db, video)
    db.commit()
    if owner_user_id:
        notification_service.notify(
            db,
            owner_user_id,
            f"notification.video.review.{target_status.value}",
            {"title": video.title},
        )
    audit_service.log(
        db,
        f"admin.video.{data.action}",
        actor=admin,
        entity_type="video",
        entity_id=str(video.id),
        data={"note": data.note},
        request=request,
    )
    return {"id": str(video.id), "status": video.status.value}


@router.post("/categories", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryIn, request: Request, admin: RequireAdmin, db: DbSession) -> dict:
    slug_base = data.name.strip().lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug_base)[:100] or "category"
    existing = db.scalar(select(Category).where(Category.slug == slug))
    if existing is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"code": "category_exists", "message": "A category with this slug already exists."},
        )
    category = Category(
        name=data.name.strip(),
        slug=slug,
        parent_id=data.parent_id,
        is_active=data.is_active,
        sort_order=data.sort_order,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    audit_service.log(
        db, "admin.category.created", actor=admin, entity_type="category", entity_id=str(category.id), request=request
    )
    return {"id": str(category.id), "name": category.name, "slug": category.slug}


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: UUID, request: Request, admin: RequireAdmin, db: DbSession) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"code": "not_found", "message": "Category not found."})
    db.delete(category)
    db.commit()
    audit_service.log(
        db, "admin.category.deleted", actor=admin, entity_type="category", entity_id=str(category_id), request=request
    )


class AdminVideoIn(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    source_url: str = Field(min_length=10, max_length=500)
    duration_seconds: int = Field(gt=0, le=86400 * 4)
    language: str = Field(default="en", pattern=r"^[a-z]{2}(-[A-Za-z]{2})?$")
    difficulty: Difficulty = Difficulty.BEGINNER
    format: VideoFormat = VideoFormat.LONG
    tags: list[str] = Field(default_factory=list, max_length=20)
    course_id: UUID | None = None


@router.post("/videos", response_model=dict, status_code=status.HTTP_201_CREATED)
def admin_create_video(
    data: AdminVideoIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> dict:
    try:
        provider, provider_video_id = video_service.detect_provider(data.source_url)
    except ValueError:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "unsupported_video_url", "message": "Use a supported YouTube, Instagram or Vimeo URL."},
        )
    from app.models.expert import Expert
    from app.models.user import User

    user = db.scalar(select(User).where(User.role == "admin"))
    expert = db.scalars(select(Expert).where(Expert.user_id == user.id)).first() if user else None
    expert_id = expert.id if expert else None

    if data.course_id is not None:
        course = db.get(Course, data.course_id)
        if course is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail={"code": "course_not_found", "message": "Course not found."},
            )

    video = Video(
        expert_id=expert_id,
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
        status=ContentStatus.PUBLISHED,
        published_at=datetime.now(timezone.utc),
    )
    db.add(video)
    db.flush()

    if data.course_id is not None:
        max_pos = db.scalar(
            select(func.coalesce(func.max(course_videos.c.position), 0)).where(
                course_videos.c.course_id == data.course_id
            )
        )
        db.execute(
            course_videos.insert().values(
                course_id=data.course_id, video_id=video.id, position=max_pos + 1
            )
        )

    db.commit()
    db.refresh(video)
    audit_service.log(db, "admin.video.created", actor=admin, entity_type="video", entity_id=str(video.id), request=request)
    return {"id": str(video.id), "title": video.title, "status": video.status.value}
