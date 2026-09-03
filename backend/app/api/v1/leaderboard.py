from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError
from sqlalchemy import Numeric, cast, func, select
from sqlalchemy.orm import Session

from app.core.deps import DbSession
from app.core.security import decode_token
from app.models.enums import AccountStatus, RewardStatus, UserRole
from app.models.reward import Reward
from app.models.user import User, UserProfile
from app.schemas.reward import LeaderboardEntry, LeaderboardMeOut, LeaderboardOut

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# Earned money is recorded once a reward leaves the "pending" state and is
# credited to the user (available to claim or already claimed). Reversals,
# failures and cancellations are excluded.
_EARNED_STATUSES = (
    RewardStatus.APPROVED,
    RewardStatus.AVAILABLE,
    RewardStatus.CLAIMED,
)


def _current_user_id(db: Session, bearer: HTTPAuthorizationCredentials | None) -> UUID | None:
    """Resolve the authenticated user id if a valid token is supplied, else None.

    Used so the leaderboard can highlight the caller without requiring auth.
    """
    if bearer is None:
        return None
    try:
        payload = decode_token(bearer.credentials)
    except PyJWTError:
        return None
    if payload.get("type") != "access":
        return None
    try:
        user_id = UUID(str(payload.get("sub")))
    except (ValueError, TypeError, AttributeError):
        return None
    if db.get(User, user_id) is None:
        return None
    return user_id


def _aggregate_rows(db: Session) -> list[tuple[UUID, Decimal, int, str]]:
    """Return (user_id, total_earned, earned_count, username) ordered by earnings.

    Excludes admin/flagged accounts so the ranking reflects real learners.
    """
    rows = db.execute(
        select(
            Reward.user_id,
            func.coalesce(func.sum(Reward.amount), cast(0, Numeric(24, 9))).label("total_earned"),
            func.count().label("earned_count"),
            User.username,
        )
        .join(User, User.id == Reward.user_id)
        .where(
            Reward.status.in_(list(_EARNED_STATUSES)),
            User.role != UserRole.ADMIN,
            User.status == AccountStatus.ACTIVE,
        )
        .group_by(Reward.user_id, User.username)
        .order_by(
            func.sum(Reward.amount).desc(),
            func.count().desc(),
            User.username.asc(),
        )
    ).all()
    return [(r[0], r[1], r[2], r[3]) for r in rows]


@router.get("", response_model=LeaderboardOut)
def get_leaderboard(
    db: DbSession,
    limit: int = Query(default=50, ge=1, le=100),
    bearer: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> LeaderboardOut:
    rows = _aggregate_rows(db)
    me_id = _current_user_id(db, bearer)
    me_key = str(me_id) if me_id else None

    usernames = {str(u[0]): u[3] for u in rows}
    user_ids = [u[0] for u in rows]
    profiles: dict[str, tuple[str | None, str | None]] = {}
    if user_ids:
        prof_rows = db.execute(
            select(UserProfile.user_id, UserProfile.display_name, UserProfile.avatar_url).where(
                UserProfile.user_id.in_(user_ids)
            )
        ).all()
        profiles = {str(p[0]): (p[1], p[2]) for p in prof_rows}

    items: list[LeaderboardEntry] = []
    for idx, (user_id, total, count, _username) in enumerate(rows[:limit], start=1):
        user_key = str(user_id)
        display_name, avatar_url = profiles.get(user_key, (None, None))
        items.append(
            LeaderboardEntry(
                rank=idx,
                username=usernames[user_key],
                display_name=display_name,
                avatar_url=avatar_url,
                total_earned=str(total),
                earned_count=int(count),
                is_you=(user_key == me_key),
            )
        )

    return LeaderboardOut(
        items=items,
        total_ranked=len(rows),
        generated_at=datetime.now(timezone.utc),
    )


@router.get("/me", response_model=LeaderboardMeOut)
def get_my_standing(
    db: DbSession,
    bearer: HTTPAuthorizationCredentials | None = Depends(HTTPBearer(auto_error=False)),
) -> LeaderboardMeOut:
    me_id = _current_user_id(db, bearer)
    if me_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "not_authenticated", "message": "Authentication required."},
        )

    rows = _aggregate_rows(db)
    me_key = str(me_id)
    user = db.get(User, me_id)

    rank = None
    total = Decimal("0")
    count = 0
    for idx, (user_id, t, c, _u) in enumerate(rows, start=1):
        if str(user_id) == me_key:
            rank = idx
            total = t
            count = c
            break

    profile = db.execute(
        select(UserProfile).where(UserProfile.user_id == me_id)
    ).scalar_one_or_none()

    return LeaderboardMeOut(
        rank=rank,
        username=user.username if user else None,
        display_name=profile.display_name if profile else None,
        avatar_url=profile.avatar_url if profile else None,
        total_earned=str(total),
        earned_count=int(count),
    )
