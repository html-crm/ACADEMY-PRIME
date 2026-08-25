from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select

from app.core.deps import CurrentUser, DbSession, RequireAdmin
from app.models.content import Video
from app.models.enums import AccountStatus, ContentStatus, ExpertStatus, RewardStatus, UserRole
from app.models.expert import Expert
from app.models.platform import AuditLog, Country, PlatformSetting
from app.models.reward import RewardSettings
from app.models.reward import Reward as RewardLedger
from app.models.user import User
from app.schemas.admin import (
    AdminExpertOut,
    AdminExpertReviewIn,
    AuditLogOut,
    CountryOut,
    CountryUpsertIn,
    PlatformSettingIn,
    PlatformSettingOut,
    RewardSettingsIn,
    RewardSettingsOut,
    StatsOut,
    UserAdminOut,
    UserStatusIn,
)
from app.services import audit_service, notification_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[])


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    admin: RequireAdmin,
    db: DbSession,
    q: str | None = Query(default=None, max_length=100),
    status_filter: AccountStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> list[UserAdminOut]:
    query = select(User)
    if q:
        pattern = f"%{q}%"
        query = query.where(or_(User.email.ilike(pattern), User.username.ilike(pattern)))
    if status_filter:
        query = query.where(User.status == status_filter)
    rows = db.scalars(query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return [UserAdminOut.model_validate(u) for u in rows]


@router.get("/users/{user_id}", response_model=UserAdminOut)
def get_user(user_id: UUID, admin: RequireAdmin, db: DbSession) -> UserAdminOut:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"code": "user_not_found", "message": "User not found."})
    return UserAdminOut.model_validate(user)


@router.patch("/users/{user_id}/status", response_model=UserAdminOut)
def set_user_status(
    user_id: UUID,
    data: UserStatusIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> UserAdminOut:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"code": "user_not_found", "message": "User not found."})
    if target.role == UserRole.ADMIN:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"code": "cannot_modify_admin", "message": "Admin accounts cannot be modified here."},
        )
    if data.status == AccountStatus.BANNED:
        from app.services.auth_service import revoke_all_sessions

        revoke_all_sessions(db, target.id)
    target.status = data.status
    db.commit()
    notification_service.notify(
        db, target.id, f"notification.account.{data.status.value}"
    )
    audit_service.log(
        db, f"admin.user.{data.status.value}", actor=admin, entity_type="user",
        entity_id=str(target.id), request=request,
    )
    return UserAdminOut.model_validate(target)


@router.get("/experts", response_model=list[AdminExpertOut])
def list_experts(
    admin: RequireAdmin,
    db: DbSession,
    status_filter: ExpertStatus | None = Query(default=None, alias="status"),
) -> list[AdminExpertOut]:
    query = select(Expert)
    if status_filter:
        query = query.where(Expert.status == status_filter)
    rows = db.scalars(query.order_by(Expert.created_at.asc())).all()
    return [AdminExpertOut.model_validate(e) for e in rows]


@router.patch("/experts/{expert_id}/review", response_model=AdminExpertOut)
def review_expert(
    expert_id: UUID,
    data: AdminExpertReviewIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> AdminExpertOut:
    expert = db.get(Expert, expert_id)
    if expert is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail={"code": "expert_not_found", "message": "Expert not found."})
    if data.status == ExpertStatus.PENDING:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"code": "invalid_transition", "message": "Experts cannot be moved back to pending."},
        )
    expert.status = data.status
    expert.reviewed_by = admin.id
    expert.reviewed_at = datetime.now(timezone.utc)
    expert.review_note = data.note
    if data.status == ExpertStatus.APPROVED:
        expert.user.role = UserRole.EXPERT
    db.commit()
    notification_service.notify(db, expert.user_id, f"notification.expert.review.{data.status.value}")
    audit_service.log(
        db, f"admin.expert.{data.status.value}", actor=admin, entity_type="expert",
        entity_id=str(expert.id), data={"note": data.note}, request=request,
    )
    return AdminExpertOut.model_validate(expert)


def _ensure_reward_settings(db) -> RewardSettings:
    row = db.get(RewardSettings, 1)
    if row is None:
        row = RewardSettings(id=1)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/settings/rewards", response_model=RewardSettingsOut)
def get_reward_settings(admin: RequireAdmin, db: DbSession) -> RewardSettingsOut:
    return RewardSettingsOut.model_validate(_ensure_reward_settings(db))


@router.put("/settings/rewards", response_model=RewardSettingsOut)
def update_reward_settings(
    data: RewardSettingsIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> RewardSettingsOut:
    row = _ensure_reward_settings(db)
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(row, field, value)
    row.updated_by = admin.id
    db.commit()
    db.refresh(row)
    audit_service.log(
        db, "admin.reward_settings.updated", actor=admin, entity_type="reward_settings",
        entity_id="1", data={"fields": list(updates.keys())}, request=request,
    )
    return RewardSettingsOut.model_validate(row)


@router.get("/settings/platform", response_model=list[PlatformSettingOut])
def list_platform_settings(admin: RequireAdmin, db: DbSession) -> list[PlatformSettingOut]:
    rows = db.scalars(select(PlatformSetting).order_by(PlatformSetting.key)).all()
    return [PlatformSettingOut.model_validate(r) for r in rows]


@router.put("/settings/platform/{key}", response_model=PlatformSettingOut)
def upsert_platform_setting(
    key: str,
    data: PlatformSettingIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> PlatformSettingOut:
    key = key.strip().lower()
    if len(key) > 100 or not all(c.isalnum() or c in "._-" for c in key):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_key", "message": "Setting keys may contain letters, digits, dots, dashes, underscores."},
        )
    row = db.get(PlatformSetting, key)
    if row is None:
        row = PlatformSetting(key=key, value=data.value, description=data.description, updated_by=admin.id)
        db.add(row)
    else:
        row.value = data.value
        if data.description is not None:
            row.description = data.description
        row.updated_by = admin.id
    db.commit()
    db.refresh(row)
    audit_service.log(
        db, "admin.platform_setting.upserted", actor=admin, entity_type="platform_setting",
        entity_id=key, request=request,
    )
    return PlatformSettingOut.model_validate(row)


@router.get("/countries", response_model=list[CountryOut])
def list_countries(admin: RequireAdmin, db: DbSession) -> list[CountryOut]:
    rows = db.scalars(select(Country).order_by(Country.code)).all()
    return [CountryOut.model_validate(c) for c in rows]


@router.put("/countries/{code}", response_model=CountryOut)
def upsert_country(
    code: str,
    data: CountryUpsertIn,
    request: Request,
    admin: RequireAdmin,
    db: DbSession,
) -> CountryOut:
    code = code.strip().upper()
    if len(code) != 2 or not code.isalpha():
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_country_code", "message": "Use a 2-letter ISO 3166-1 alpha-2 code."},
        )
    country = db.get(Country, code)
    if country is None:
        country = Country(code=code, name=data.name, is_supported=data.is_supported, rewards_enabled=data.rewards_enabled)
        db.add(country)
    else:
        country.name = data.name
        country.is_supported = data.is_supported
        country.rewards_enabled = data.rewards_enabled
    db.commit()
    db.refresh(country)
    audit_service.log(
        db, "admin.country.upserted", actor=admin, entity_type="country", entity_id=code, request=request
    )
    return CountryOut.model_validate(country)


@router.get("/stats", response_model=StatsOut)
def stats(admin: RequireAdmin, db: DbSession) -> StatsOut:
    def count(stmt) -> int:
        return db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    users_total = count(select(User))
    users_active = count(select(User).where(User.status == AccountStatus.ACTIVE))
    experts_total = count(select(Expert).where(Expert.status == ExpertStatus.APPROVED))
    experts_pending = count(select(Expert).where(Expert.status == ExpertStatus.PENDING))
    videos_total = count(select(Video))
    videos_published = count(select(Video).where(Video.status == ContentStatus.PUBLISHED))
    rewards_total = count(select(RewardLedger))
    rewards_available = count(select(RewardLedger).where(RewardLedger.status == RewardStatus.AVAILABLE))
    rewards_claimed = count(select(RewardLedger).where(RewardLedger.status == RewardStatus.CLAIMED))

    def token_sum(*statuses: RewardStatus) -> Decimal:
        total = db.scalar(
            select(func.coalesce(func.sum(RewardLedger.amount), 0)).where(
                RewardLedger.status.in_([s for s in statuses])
            )
        )
        return Decimal(str(total or 0))

    tokens_pending = token_sum(RewardStatus.AVAILABLE)
    tokens_claimed = token_sum(RewardStatus.CLAIMED)
    return StatsOut(
        users_total=users_total,
        users_active=users_active,
        experts_total=experts_total,
        experts_pending=experts_pending,
        videos_total=videos_total,
        videos_published=videos_published,
        rewards_total=rewards_total,
        rewards_available=rewards_available,
        rewards_claimed=rewards_claimed,
        tokens_pending=tokens_pending,
        tokens_claimed=tokens_claimed,
        tokens_issued=tokens_pending + tokens_claimed,
    )


@router.get("/audit-logs", response_model=list[AuditLogOut])
def list_audit_logs(
    admin: RequireAdmin,
    db: DbSession,
    action: str | None = Query(default=None, max_length=100),
    entity_type: str | None = Query(default=None, max_length=50),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
) -> list[AuditLogOut]:
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    rows = db.scalars(query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return [AuditLogOut.model_validate(r) for r in rows]
