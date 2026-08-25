from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.models.platform import Notification
from app.schemas.common import Page
from app.schemas.notification import MarkReadIn, NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=Page[NotificationOut])
def list_notifications(
    user: CurrentUser,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[NotificationOut]:
    base = select(Notification).where(Notification.user_id == user.id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    rows = db.scalars(
        base.order_by(Notification.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return Page(
        items=[NotificationOut.model_validate(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("/read", status_code=200)
def mark_read(data: MarkReadIn, user: CurrentUser, db: DbSession) -> dict:
    now = datetime.now(timezone.utc)
    result = db.execute(
        select(Notification).where(
            Notification.user_id == user.id,
            Notification.id.in_(data.ids),
            Notification.is_read.is_(False),
        )
    )
    count = 0
    for notification in result.scalars():
        notification.is_read = True
        notification.read_at = now
        count += 1
    db.commit()
    return {"marked_read": count}
