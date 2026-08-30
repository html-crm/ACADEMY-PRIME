from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RewardOut(BaseModel):
    id: UUID
    entry_type: str
    source_type: str
    video_id: UUID | None
    amount: str
    token_mint: str
    status: str
    claimed_at: datetime | None
    created_at: datetime


class ClaimOut(BaseModel):
    id: UUID
    wallet_address: str
    amount: str
    status: str
    tx_signature: str | None
    created_at: datetime


class ClaimRequestOut(BaseModel):
    claims: list[ClaimOut]
    total_amount: str
    wallet_address: str


class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    display_name: str | None
    avatar_url: str | None
    total_earned: str
    earned_count: int
    is_you: bool = False


class LeaderboardOut(BaseModel):
    items: list[LeaderboardEntry]
    total_ranked: int
    generated_at: datetime


class LeaderboardMeOut(BaseModel):
    rank: int | None
    username: str | None
    display_name: str | None
    avatar_url: str | None
    total_earned: str
    earned_count: int
