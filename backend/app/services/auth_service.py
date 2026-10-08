import random
from datetime import datetime, timedelta, timezone
from jwt import PyJWTError
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.enums import AccountStatus
from app.models.user import RefreshToken, User, UserProfile


class AuthError(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})


def register_user(db: Session, email: str, username: str, password: str, locale: str) -> User:
    settings = get_settings()
    if locale not in settings.supported_locales:
        locale = settings.DEFAULT_LOCALE
    normalized_email = email.strip().lower()
    if db.scalar(select(User).where(User.email == normalized_email)) is not None:
        raise AuthError("email_already_registered", "This email is already registered.", 409)
    if db.scalar(select(User).where(User.username == username.lower())) is not None:
        raise AuthError("username_taken", "This username is already taken.", 409)
    user = User(
        email=normalized_email,
        username=username.lower(),
        password_hash=hash_password(password),
        locale=locale,
    )
    user.profile = UserProfile(display_name=username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email.strip().lower()))
    if user is None or not verify_password(password, user.password_hash):
        raise AuthError("invalid_credentials", "Incorrect email or password.")
    if user.status == AccountStatus.BANNED:
        raise AuthError("account_banned", "This account has been banned.", 403)
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return user


def issue_token_pair(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(str(user.id))
    refresh_token, jti, expires_at = create_refresh_token(str(user.id))
    db.add(RefreshToken(user_id=user.id, jti=jti, expires_at=expires_at))
    db.commit()
    return access_token, refresh_token


def rotate_refresh_token(db: Session, raw_refresh_token: str) -> tuple[str, str]:
    try:
        payload = decode_token(raw_refresh_token)
    except PyJWTError as exc:
        raise AuthError("invalid_token", "Invalid refresh token.") from exc
    if payload.get("type") != "refresh":
        raise AuthError("invalid_token", "Invalid token type.")
    jti = payload.get("jti")
    row = db.scalar(select(RefreshToken).where(RefreshToken.jti == jti))
    if row is None:
        raise AuthError("invalid_token", "Refresh token not recognized.")
    now = datetime.now(timezone.utc)

    if row.revoked_at is not None:
        _revoke_all_sessions(db, row.user_id, reason="reuse_detected")
        raise AuthError(
            "token_reuse_detected",
            "Refresh token reuse detected. All sessions have been revoked.",
            401,
        )
    if row.expires_at.replace(tzinfo=timezone.utc) < now:
        raise AuthError("token_expired", "Refresh token expired.")

    user = db.get(User, row.user_id)
    if user is None or user.status == AccountStatus.BANNED:
        raise AuthError("invalid_token", "Account unavailable.", 403)

    new_access = create_access_token(str(user.id))
    new_refresh, new_jti, new_expires = create_refresh_token(str(user.id))
    row.revoked_at = now
    row.replaced_by_jti = new_jti
    db.add(RefreshToken(user_id=user.id, jti=new_jti, expires_at=new_expires))
    db.commit()
    return new_access, new_refresh


def revoke_session(db: Session, raw_refresh_token: str) -> None:
    try:
        payload = decode_token(raw_refresh_token)
    except PyJWTError:
        return
    row = db.scalar(select(RefreshToken).where(RefreshToken.jti == payload.get("jti")))
    if row is not None and row.revoked_at is None:
        row.revoked_at = datetime.now(timezone.utc)
        db.commit()


def revoke_all_sessions(db: Session, user_id) -> None:
    _revoke_all_sessions(db, user_id, reason="admin_action")


def _revoke_all_sessions(db: Session, user_id, reason: str) -> None:
    rows = db.scalars(
        select(RefreshToken).where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
    ).all()
    now = datetime.now(timezone.utc)
    for row in rows:
        row.revoked_at = now
    db.commit()


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.password_hash):
        raise AuthError("invalid_password", "Current password is incorrect.")
    user.password_hash = hash_password(new_password)
    db.commit()


def create_captcha() -> tuple[str, str]:
    import jwt as pyjwt

    from app.core.config import get_settings

    a = random.randint(2, 9)
    b = random.randint(2, 9)
    answer = str(a + b)
    now = datetime.now(timezone.utc)
    token = pyjwt.encode(
        {
            "type": "captcha",
            "q": f"{a} + {b} = ?",
            "a": answer,
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=10)).timestamp()),
        },
        get_settings().SECRET_KEY,
        algorithm="HS256",
    )
    return token, f"{a} + {b} = ?"


def verify_captcha(db: Session, token: str, answer: str, *_args, **_kwargs) -> None:
    import jwt as pyjwt

    from app.core.config import get_settings

    if not token or not answer:
        raise AuthError("captcha_required", "Please complete the human verification.", 422)
    try:
        payload = pyjwt.decode(token, get_settings().SECRET_KEY, algorithms=["HS256"])
    except Exception as exc:
        raise AuthError("captcha_invalid", "Human verification expired. Please try again.", 422) from exc
    if payload.get("type") != "captcha":
        raise AuthError("captcha_invalid", "Invalid human verification.", 422)
    if str(payload.get("a")) != str(answer).strip():
        raise AuthError("captcha_wrong", "Incorrect answer to the human verification question.", 422)
