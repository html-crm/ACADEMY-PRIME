from uuid import UUID

from pydantic import BaseModel, Field


class HeartbeatIn(BaseModel):
    video_id: UUID
    position_seconds: float = Field(ge=0, le=86400 * 4)
    state: str = Field(default="playing", pattern="^(playing|paused)$")
    ended: bool = False


class HeartbeatOut(BaseModel):
    accepted: bool
    max_position_seconds: int
    required_percentage: str
    current_percentage: str
    completed: bool
    reward_issued: bool
