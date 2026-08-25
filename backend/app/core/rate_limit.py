import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class SlidingWindowLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def reset(self) -> None:
        self._hits.clear()

    def check(self, key: str, limit: int, window_seconds: float = 60.0) -> None:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > window_seconds:
            hits.popleft()
        if len(hits) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"code": "rate_limited", "message": "Too many requests. Try again later."},
            )
        hits.append(now)


_auth_limiter = SlidingWindowLimiter()


async def rate_limit_auth(request: Request) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    client_ip = request.client.host if request.client else "unknown"
    _auth_limiter.check(f"auth:{client_ip}", settings.RATE_LIMIT_AUTH_PER_MINUTE)
