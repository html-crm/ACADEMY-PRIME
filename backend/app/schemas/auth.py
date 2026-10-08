from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import AccountStatus, UserRole


class RegisterIn(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=32, pattern=r"^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=8, max_length=128)
    locale: str = Field(default="en", pattern=r"^[a-z]{2}(-[A-Za-z]{2})?$")
    captcha_token: str = ""
    captcha_answer: str = Field(default="", max_length=16)


class CaptchaOut(BaseModel):
    token: str
    question: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class RefreshIn(BaseModel):
    refresh_token: str


class ChangePasswordIn(BaseModel):
    current_password: str = Field(max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    role: UserRole
    is_vip: bool = False
    status: AccountStatus
    locale: str
    country_code: str | None = None
    created_at: datetime
