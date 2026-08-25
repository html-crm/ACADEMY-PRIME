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
