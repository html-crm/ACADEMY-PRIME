import re
import unicodedata
from uuid import uuid4

from app.models.enums import VideoProvider

YOUTUBE_PATTERNS = [
    r"(?:youtube\.com/watch\?(?:.*&)?v=)([\w-]{11})",
    r"(?:youtu\.be/)([\w-]{11})",
    r"(?:youtube\.com/embed/)([\w-]{11})",
    r"(?:youtube\.com/shorts/)([\w-]{11})",
    r"(?:youtube\.com/live/)([\w-]{11})",
]

INSTAGRAM_PATTERNS = [
    r"instagram\.com/(?:p|reel|reels|tv)/([\w-]+)",
]

VIMEO_PATTERN = r"vimeo\.com/(\d+)"


def detect_provider(url: str) -> tuple[VideoProvider, str | None]:
    url = url.strip()
    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return VideoProvider.YOUTUBE, match.group(1)
    for pattern in INSTAGRAM_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return VideoProvider.INSTAGRAM, match.group(1)
    match = re.search(VIMEO_PATTERN, url)
    if match:
        return VideoProvider.VIMEO, match.group(1)
    raise ValueError("unsupported_video_url")


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", normalized).strip().lower()
    slug = re.sub(r"[\s_-]+", "-", cleaned)[:180]
    return f"{slug}-{uuid4().hex[:8]}" if slug else uuid4().hex


YOUTUBE_EMBEDDABLE_HINT = (
    "Videos must allow embedding. Check: Share > Embed is available on the YouTube video."
)


def extract_youtube_thumbnail(provider_video_id: str | None) -> str | None:
    if provider_video_id and len(provider_video_id) == 11:
        return f"https://i.ytimg.com/vi/{provider_video_id}/hqdefault.jpg"
    return None
