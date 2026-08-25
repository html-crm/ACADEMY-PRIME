from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "default_locale": settings.DEFAULT_LOCALE,
        "supported_locales": settings.supported_locales,
        "solana_network": settings.SOLANA_NETWORK,
        "token_mint_configured": bool(settings.TOKEN_MINT),
    }
