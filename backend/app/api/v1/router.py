from fastapi import APIRouter

from app.api.v1 import (
    admin,
    admin_content,
    auth,
    content,
    expert_videos,
    experts,
    health,
    leaderboard,
    notifications,
    partners,
    progress,
    rewards,
    users,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(rewards.router)
api_router.include_router(experts.router)
api_router.include_router(expert_videos.router)
api_router.include_router(progress.router)
api_router.include_router(leaderboard.router)
api_router.include_router(notifications.router)
api_router.include_router(content.router)
api_router.include_router(partners.public)
api_router.include_router(admin.router)
api_router.include_router(admin_content.router)
api_router.include_router(partners.admin_api)
