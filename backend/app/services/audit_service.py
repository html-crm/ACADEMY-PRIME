from fastapi import Request
from sqlalchemy.orm import Session

from app.models.platform import AuditLog
from app.models.user import User


def log(
    db: Session,
    action: str,
    actor: User | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    data: dict | None = None,
    request: Request | None = None,
) -> None:
    ip = None
    user_agent = None
    if request is not None:
        if request.client:
            ip = request.client.host
        user_agent = request.headers.get("user-agent", "")[:255]
    db.add(
        AuditLog(
            actor_id=actor.id if actor else None,
            actor_role=actor.role.value if actor else "system",
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            ip_address=ip,
            user_agent=user_agent,
            data=data or {},
        )
    )
    db.commit()
