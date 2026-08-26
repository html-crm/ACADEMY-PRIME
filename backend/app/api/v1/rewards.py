from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.models.reward import Reward as RewardLedger
from app.models.reward import RewardClaim
from app.schemas.common import Page, paginate
from app.schemas.reward import ClaimOut, ClaimRequestOut, RewardOut
from app.services.claim_service import request_claim

router = APIRouter(prefix="/users/me/rewards", tags=["rewards"])


def _reward_out(entry: RewardLedger) -> RewardOut:
    return RewardOut(
        id=entry.id,
        entry_type=entry.entry_type.value,
        source_type=entry.source_type,
        video_id=entry.video_id,
        amount=str(entry.amount),
        token_mint=entry.token_mint,
        status=entry.status.value,
        claimed_at=entry.claimed_at,
        created_at=entry.created_at,
    )


def _claim_out(claim: RewardClaim) -> ClaimOut:
    return ClaimOut(
        id=claim.id,
        wallet_address=claim.wallet_address,
        amount=str(claim.amount),
        status=claim.status.value,
        tx_signature=claim.tx_signature,
        created_at=claim.created_at,
    )


@router.get("", response_model=Page[RewardOut])
def list_rewards(
    user: CurrentUser,
    db: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[RewardOut]:
    total = int(
        db.scalar(select(func.count()).select_from(RewardLedger).where(RewardLedger.user_id == user.id)) or 0
    )
    entries = list(
        db.scalars(
            select(RewardLedger)
            .where(RewardLedger.user_id == user.id)
            .order_by(RewardLedger.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    )
    return paginate([_reward_out(e) for e in entries], total, page, page_size)


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(user: CurrentUser, db: DbSession) -> list[ClaimOut]:
    claims = list(
        db.scalars(
            select(RewardClaim)
            .where(RewardClaim.user_id == user.id)
            .order_by(RewardClaim.created_at.desc())
            .limit(50)
        )
    )
    return [_claim_out(c) for c in claims]


@router.post("/claims", response_model=ClaimRequestOut)
def create_claim(user: CurrentUser, db: DbSession) -> ClaimRequestOut:
    claims, total, wallet = request_claim(db, user)
    db.commit()
    for claim in claims:
        db.refresh(claim)
    return ClaimRequestOut(
        claims=[_claim_out(c) for c in claims],
        total_amount=str(total),
        wallet_address=wallet.address,
    )
