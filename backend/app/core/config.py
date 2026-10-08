from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ACADEMIC PRIME"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    SECRET_KEY: str = "dev-only-change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    RISK_SCORE_REWARD_THRESHOLD: int = 50

    DATABASE_URL: str = "sqlite:///./academic_prime.db"
    TURSO_DATABASE_URL: str = ""
    TURSO_AUTH_TOKEN: str = ""

    CORS_ORIGINS: str = "http://localhost:3000,https://www.academy-prime.site,https://academy-prime.site"

    DEFAULT_LOCALE: str = "en"
    SUPPORTED_LOCALES: str = "en,ar"

    SOLANA_NETWORK: str = "devnet"
    SOLANA_RPC_URL: str = "https://api.devnet.solana.com"
    TOKEN_MINT: str = ""

    TOKEN_DECIMALS: int = 6
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10

    PAYMENT_RECEIVER_WALLET: str = "93Z7kjy5ZHMqsAXikkavYzTuMiiistTpkNUSuaPKs74x"
    PAYMENT_CURRENCY: str = "ACAD-P"
    MIN_PAYMENT_CONFIRMATIONS: int = 1

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def cors_origin_regex(self) -> str:
        return r"https://.*\.vercel\.app"

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.TURSO_DATABASE_URL:
            host = self.TURSO_DATABASE_URL
            if host.startswith("libsql://"):
                host = host[len("libsql://") :]
            return f"sqlite+libsql://{host}?secure=true"
        return self.DATABASE_URL

    @property
    def supported_locales(self) -> list[str]:
        return [l.strip() for l in self.SUPPORTED_LOCALES.split(",") if l.strip()]


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    if s.ENVIRONMENT != "development" and s.SECRET_KEY == "dev-only-change-me-in-production":
        raise RuntimeError("SECRET_KEY must be set to a secure value in production!")
    return s
