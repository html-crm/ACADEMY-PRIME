from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ExpertStatus


class ExpertApplyIn(BaseModel):
    display_name: str = Field(min_length=2, max_length=80)
    headline: str | None = Field(default=None, max_length=160)
    bio: str | None = Field(default=None, max_length=2000)
    links: list[str] = Field(default_factory=list, max_length=10)


class ExpertUpdateIn(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=80)
    headline: str | None = Field(default=None, max_length=160)
    bio: str | None = Field(default=None, max_length=2000)
    links: list[str] | None = Field(default=None, max_length=10)


class ExpertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: ExpertStatus
    display_name: str
    headline: str | None
    bio: str | None
    links: list
    reviewed_at: datetime | None
    review_note: str | None
    created_at: datetime
