from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import NotificationChannel


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    data: dict[str, Any]
    channel: NotificationChannel
    is_read: bool
    read_at: datetime | None
    created_at: datetime


class MarkReadIn(BaseModel):
    ids: list[UUID]
