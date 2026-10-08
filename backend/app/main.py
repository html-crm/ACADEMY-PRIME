from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    is_prod = settings.ENVIRONMENT == "production"
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="ACADEMIC PRIME — Learn-to-Earn crypto education platform API.",
        docs_url=None if is_prod else "/docs",
        openapi_url=None if is_prod else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1024)
    app.include_router(api_router, prefix="/api/v1")

    @app.middleware("http")
    async def cache_public_content(request, call_next):
        response = await call_next(request)
        # Public catalog GETs (videos/courses/partners/categories) are identical
        # for every visitor. Let browsers + edge caches serve them for 5 minutes
        # to spare the origin (and make repeated page loads near-instant).
        # Skip anything that carries user credentials.
        path = request.url.path
        if (
            request.method.upper() == "GET"
            and path.startswith("/api/v1/content/")
            and "authorization" not in request.headers
        ):
            response.headers["Cache-Control"] = "public, max-age=300, s-maxage=300"
        return response

    @app.get("/", include_in_schema=False)
    def root() -> dict:
        return {"name": settings.APP_NAME, "docs": "/docs"}

    return app


app = create_app()
