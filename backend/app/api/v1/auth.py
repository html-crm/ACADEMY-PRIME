from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.deps import CurrentUser, DbSession
from app.core.rate_limit import rate_limit_auth
from app.models.enums import AccountStatus
from app.schemas.auth import ChangePasswordIn, LoginIn, MeOut, RefreshIn, RegisterIn, TokenPair
from app.services import audit_service, auth_service, notification_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterIn,
    request: Request,
    db: DbSession,
    _rl: None = Depends(rate_limit_auth),
) -> TokenPair:
    user = auth_service.register_user(db, data.email, data.username, data.password, data.locale)
    notification_service.notify(db, user.id, "notification.account.created")
    audit_service.log(db, "auth.register", actor=user, entity_type="user", entity_id=str(user.id), request=request)
    access_token, refresh_token = auth_service.issue_token_pair(db, user)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenPair)
def login(
    data: LoginIn,
    request: Request,
    db: DbSession,
    _rl: None = Depends(rate_limit_auth),
) -> TokenPair:
    user = auth_service.authenticate(db, data.email, data.password)
    if user.status == AccountStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "account_suspended", "message": "This account is suspended."},
        )
    audit_service.log(db, "auth.login", actor=user, entity_type="user", entity_id=str(user.id), request=request)
    access_token, refresh_token = auth_service.issue_token_pair(db, user)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshIn, db: DbSession, _rl: None = Depends(rate_limit_auth)) -> TokenPair:
    access_token, refresh_token = auth_service.rotate_refresh_token(db, data.refresh_token)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshIn, db: DbSession, user: CurrentUser) -> None:
    auth_service.revoke_session(db, data.refresh_token)


@router.get("/me", response_model=MeOut)
def me(user: CurrentUser) -> MeOut:
    return MeOut.model_validate(user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: ChangePasswordIn,
    request: Request,
    db: DbSession,
    user: CurrentUser,
) -> None:
    auth_service.change_password(db, user, data.current_password, data.new_password)
    audit_service.log(db, "auth.change_password", actor=user, entity_type="user", entity_id=str(user.id), request=request)
