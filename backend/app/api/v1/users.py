from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession, get_current_user
from app.models.platform import Country
from app.models.progress import CourseEnrollment, VideoCompletion
from app.models.reward import RewardStatus
from app.models.reward import Reward as RewardLedger
from app.models.user import Wallet
from app.schemas.auth import MeOut
from app.schemas.user import (
    DashboardSummaryOut,
    ProfileOut,
    ProfileUpdateIn,
    WalletIn,
    WalletOut,
)
from app.services import audit_service

router = APIRouter(prefix="/users", tags=["users"])

MAX_WALLETS_PER_USER = 5


@router.get("/me", response_model=MeOut)
def me(user: CurrentUser) -> MeOut:
    return MeOut.model_validate(user)


@router.patch("/me", response_model=ProfileOut)
def update_profile(data: ProfileUpdateIn, user: CurrentUser, db: DbSession) -> ProfileOut:
    profile = user.profile
    if profile is None:
        from app.models.user import UserProfile

        profile = UserProfile(user_id=user.id)
        db.add(profile)
    updates = data.model_dump(exclude_unset=True)
    if "locale" in updates and updates["locale"]:
        from app.core.config import get_settings

        if updates["locale"] not in get_settings().supported_locales:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "unsupported_locale", "message": "Locale not supported."},
            )
    if "country_code" in updates and updates["country_code"]:
        country = db.get(Country, updates["country_code"].upper())
        if country is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "unknown_country", "message": "Unknown country code."},
            )
        updates["country_code"] = updates["country_code"].upper()
    for field, value in updates.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return ProfileOut.model_validate(profile)


def _sum_rewards(db, user_id, statuses: list[RewardStatus]) -> str:
    total = db.scalar(
        select(func.coalesce(func.sum(RewardLedger.amount), 0)).where(
            RewardLedger.user_id == user_id, RewardLedger.status.in_(statuses)
        )
    )
    return str(total)


@router.get("/me/dashboard", response_model=DashboardSummaryOut)
def dashboard(user: CurrentUser, db: DbSession) -> DashboardSummaryOut:
    lessons_completed = db.scalar(
        select(func.count()).where(VideoCompletion.user_id == user.id)
    )
    courses_completed = db.scalar(
        select(func.count()).where(
            CourseEnrollment.user_id == user.id, CourseEnrollment.completed_at.is_not(None)
        )
    )
    primary_wallet = db.scalar(select(Wallet).where(Wallet.user_id == user.id, Wallet.is_primary.is_(True)))
    return DashboardSummaryOut(
        total_earned=_sum_rewards(db, user.id, [s for s in RewardStatus]),
        available=_sum_rewards(db, user.id, [RewardStatus.AVAILABLE]),
        pending=_sum_rewards(db, user.id, [RewardStatus.PENDING, RewardStatus.APPROVED]),
        claimed=_sum_rewards(db, user.id, [RewardStatus.CLAIMED]),
        lessons_completed=lessons_completed or 0,
        courses_completed=courses_completed or 0,
        wallet_address=primary_wallet.address if primary_wallet else None,
    )


@router.get("/me/wallets", response_model=list[WalletOut])
def list_wallets(user: CurrentUser) -> list[WalletOut]:
    return [WalletOut.model_validate(w) for w in user.wallets]


@router.post("/me/wallets", response_model=WalletOut, status_code=status.HTTP_201_CREATED)
def link_wallet(data: WalletIn, user: CurrentUser, db: DbSession) -> WalletOut:
    existing_count = len(user.wallets)
    if existing_count >= MAX_WALLETS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "wallet_limit_reached", "message": "Maximum wallets linked."},
        )
    wallet = Wallet(user_id=user.id, address=data.address, is_primary=data.is_primary or existing_count == 0)
    db.add(wallet)
    audit_service.log(
        db, "user.wallet.linked", actor=user, entity_type="wallet",
        entity_id=data.address[:8], data={"chain": "solana"},
    )
    db.refresh(wallet)
    return WalletOut.model_validate(wallet)
