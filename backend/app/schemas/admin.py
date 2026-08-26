from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AccountStatus, ExpertStatus, UserRole


class UserAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    role: UserRole
    status: AccountStatus
    country_code: str | None
    locale: str
    risk_score: int
    last_login_at: datetime | None
    created_at: datetime


class UserStatusIn(BaseModel):
    status: AccountStatus


class AdminExpertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    status: ExpertStatus
    display_name: str
    headline: str | None
    bio: str | None
    links: list
    review_note: str | None
    created_at: datetime


class AdminExpertReviewIn(BaseModel):
    status: ExpertStatus
    note: str | None = Field(default=None, max_length=1000)


class RewardSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    default_video_reward: Decimal
    course_bonus_reward: Decimal
    default_watch_percentage: Decimal
    daily_claim_limit: int
    min_account_age_days: int
    expert_per_video_reward: Decimal | None
    expert_model: str | None
    updated_at: datetime


class RewardSettingsIn(BaseModel):
    default_video_reward: Decimal = Field(ge=0, default=Decimal("0"))
    course_bonus_reward: Decimal = Field(ge=0, default=Decimal("0"))
    default_watch_percentage: Decimal = Field(ge=1, le=100)
    daily_claim_limit: int = Field(ge=0, le=1000)
    min_account_age_days: int = Field(ge=0, le=365)
    expert_per_video_reward: Decimal | None = Field(default=None, ge=0)
    expert_model: str | None = Field(default=None, pattern=r"^(fixed|performance)$")


class PlatformSettingIn(BaseModel):
    value: dict[str, Any]
    description: str | None = Field(default=None, max_length=255)


class PlatformSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    value: dict[str, Any]
    description: str | None
    updated_at: datetime


class CountryUpsertIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    is_supported: bool = False
    rewards_enabled: bool = False


class CountryOut(CountryUpsertIn):
    model_config = ConfigDict(from_attributes=True)

    code: str


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    actor_id: UUID | None
    actor_role: str | None
    action: str
    entity_type: str | None
    entity_id: str | None
    ip_address: str | None
    created_at: datetime


class StatsOut(BaseModel):
    users_total: int
    users_active: int
    experts_total: int
    experts_pending: int
    videos_total: int
    videos_published: int
    rewards_total: int
    rewards_available: int
    rewards_claimed: int
    tokens_pending: Decimal
    tokens_claimed: Decimal
    tokens_issued: Decimal
