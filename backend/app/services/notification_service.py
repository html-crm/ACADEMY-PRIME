from uuid import UUID

from sqlalchemy.orm import Session

from app.models.platform import Notification


def notify(db: Session, user_id: UUID, type_: str, data: dict | None = None) -> Notification:
    notification = Notification(user_id=user_id, type=type_, data=data or {})
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
