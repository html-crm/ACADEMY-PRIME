from datetime import datetime
from decimal import Decimal
from re import sub as _resub
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _strip_html(v: str) -> str:
    return _resub(r"<[^>]+>", "", v).strip()


class ProfileUpdateIn(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=80)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: str | None = Field(default=None, max_length=500)
    locale: str | None = Field(default=None, pattern=r"^[a-z]{2}(-[A-Za-z]{2})?$")
    country_code: str | None = Field(default=None, min_length=2, max_length=2)

    @field_validator("display_name", "bio")
    @classmethod
    def sanitize_html(cls, v: str | None) -> str | None:
        return _strip_html(v) if v is not None else v


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    display_name: str | None
    bio: str | None
    avatar_url: str | None


class WalletIn(BaseModel):
    address: str = Field(pattern=r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
    is_primary: bool = False


class WalletOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    chain: str
    address: str
    is_primary: bool
    verified_at: datetime | None
    created_at: datetime


class BalanceSummaryOut(BaseModel):
    total_earned: str
    available: str
    pending: str
    claimed: str


class DashboardSummaryOut(BalanceSummaryOut):
    lessons_completed: int
    courses_completed: int
    wallet_address: str | None
