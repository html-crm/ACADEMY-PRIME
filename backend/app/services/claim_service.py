import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ClaimStatus, RewardStatus
from app.models.reward import Reward as RewardLedger
from app.models.reward import RewardClaim
from app.models.user import User, Wallet
from app.services import audit_service
from app.services.reward_service import get_reward_settings


def primary_wallet(db: Session, user: User) -> Wallet | None:
    rows = list(
        db.scalars(
            select(Wallet)
            .where(Wallet.user_id == user.id)
            .order_by(Wallet.is_primary.desc(), Wallet.created_at)
        )
    )
    return rows[0] if rows else None


def _claims_today(db: Session, user_id) -> int:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return int(
        db.scalar(
            select(func.count()).select_from(RewardClaim).where(
                RewardClaim.user_id == user_id,
                RewardClaim.created_at >= start,
            )
        )
        or 0
    )


def request_claim(db: Session, user: User) -> tuple[list[RewardClaim], Decimal, Wallet]:
    wallet = primary_wallet(db, user)
    if wallet is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "no_wallet", "message": "Link a Solana wallet before claiming."},
        )

    settings = get_reward_settings(db)
    if settings.daily_claim_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "claims_disabled", "message": "Claims are currently disabled."},
        )
    if _claims_today(db, user.id) >= settings.daily_claim_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "daily_limit_reached",
                "message": f"Daily claim limit is {settings.daily_claim_limit}.",
            },
        )

    min_age = timedelta(days=settings.min_account_age_days)
    if datetime.now(timezone.utc) - _as_utc(user.created_at) < min_age:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "account_too_young",
                "message": f"Account must be at least {settings.min_account_age_days} day(s) old.",
            },
        )

    available = list(
        db.scalars(
            select(RewardLedger)
            .where(
                RewardLedger.user_id == user.id,
                RewardLedger.status == RewardStatus.AVAILABLE,
                RewardLedger.amount > 0,
            )
            .order_by(RewardLedger.created_at)
        )
    )
    if not available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "nothing_to_claim", "message": "No claimable rewards yet."},
        )

    total = sum((Decimal(str(r.amount)) for r in available), Decimal("0"))
    claims: list[RewardClaim] = []
    now = datetime.now(timezone.utc)
    for reward in available:
        reward.status = RewardStatus.CLAIMED
        reward.claimed_at = now
        claim = RewardClaim(
            user_id=user.id,
            reward_id=reward.id,
            wallet_address=wallet.address,
            amount=reward.amount,
            status=ClaimStatus.REQUESTED,
        )
        db.add(claim)
        claims.append(claim)

    db.flush()
    audit_service.log(
        db,
        "reward.claim.requested",
        actor=user,
        entity_type="reward_claim_batch",
        entity_id=str(uuid.uuid4()),
        data={"count": len(claims), "total": str(total), "wallet": wallet.address[:8]},
    )
    return claims, total, wallet


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value
