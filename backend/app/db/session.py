from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

_settings = get_settings()

if _settings.TURSO_DATABASE_URL:
    engine = create_engine(
        _settings.sqlalchemy_database_url,
        pool_pre_ping=True,
        connect_args={"auth_token": _settings.TURSO_AUTH_TOKEN},
    )
else:
    connect_args = {}
    if _settings.DATABASE_URL.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    engine = create_engine(_settings.DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()