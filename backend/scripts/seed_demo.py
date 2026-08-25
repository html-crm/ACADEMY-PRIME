import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from decimal import Decimal

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.content import Category, Video
from app.models.enums import ContentStatus, Difficulty, VideoFormat, VideoProvider
from app.models.expert import Expert
from app.models.reward import RewardSettings
from app.models.user import User, UserProfile

DEMO_VIDEOS = [
    {
        "title": "But how does bitcoin actually work?",
        "url": "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
        "video_id": "bBC-nXj3Ng4",
        "duration": 1500,
        "description": (
            "A famous deep-dive into how Bitcoin works under the hood: "
            "ledgers, signatures, proof-of-work and the blockchain. "
            "Duration is stored slightly below the real length so the "
            "90% watch threshold is always reachable."
        ),
    },
]

ADMIN_EMAIL = "admin@academicprime.dev"
ADMIN_PASSWORD = "Admin1234!"
EXPERT_EMAIL = "expert@academicprime.dev"
EXPERT_PASSWORD = "Expert1234!"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        settings = db.query(RewardSettings).filter(RewardSettings.id == 1).first()
        if settings is None:
            settings = RewardSettings(
                id=1,
                default_video_reward=Decimal("0.001"),
                default_watch_percentage=Decimal("85"),
                daily_claim_limit=5,
            )
            db.add(settings)
            db.commit()

        admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if admin is None:
            admin = User(
                email=ADMIN_EMAIL,
                username="admin",
                password_hash=hash_password(ADMIN_PASSWORD),
                role="admin",
            )
            admin.profile = UserProfile(display_name="Platform Admin")
            db.add(admin)

        expert_user = db.query(User).filter(User.email == EXPERT_EMAIL).first()
        if expert_user is None:
            expert_user = User(
                email=EXPERT_EMAIL,
                username="satoshi_teacher",
                password_hash=hash_password(EXPERT_PASSWORD),
            )
            expert_user.profile = UserProfile(display_name="Satoshi Teacher")
            db.add(expert_user)
        db.commit()

        expert = db.query(Expert).filter(Expert.user_id == expert_user.id).first()
        if expert is None:
            expert = Expert(
                user_id=expert_user.id,
                status="approved",
                display_name="Satoshi Teacher",
                headline="Blockchain educator",
                bio="Teaches Bitcoin and blockchain fundamentals.",
            )
            db.add(expert)
            db.commit()

        default_categories = [
            ("Blockchain Basics", "blockchain-basics"),
            ("Security", "security"),
            ("DeFi", "defi"),
            ("Trading", "trading"),
        ]
        for name, slug in default_categories:
            if db.query(Category).filter(Category.slug == slug).first() is None:
                db.add(Category(name=name, slug=slug))

        for item in DEMO_VIDEOS:
            exists = db.query(Video).filter(Video.provider_video_id == item["video_id"]).first()
            if exists is not None:
                continue
            expert_user = db.query(User).filter(User.email == EXPERT_EMAIL).first()
            video = Video(
                expert_id=db.query(Expert).first().id,
                title=item["title"],
                slug=f"{item['video_id']}-demo",
                description=item["description"],
                provider=VideoProvider.YOUTUBE,
                source_url=item["url"],
                provider_video_id=item["video_id"],
                thumbnail_url=f"https://i.ytimg.com/vi/{item['video_id']}/hqdefault.jpg",
                duration_seconds=item["duration"],
                language="en",
                difficulty=Difficulty.BEGINNER,
                format=VideoFormat.LONG,
                status=ContentStatus.PUBLISHED,
                published_at=__import__("datetime").datetime.now(
                    __import__("datetime").timezone.utc
                ),
            )
            video.tags = ["bitcoin", "blockchain"]
            video.learning_objectives = [
                "Understand ledgers and digital signatures",
                "Explain proof-of-work at a high level",
            ]
            db.add(video)

        db.commit()
        print("Seed complete.")
        print(f"  Admin login : {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
        print(f"  Expert login: {EXPERT_EMAIL} / {EXPERT_PASSWORD}")
        print(f"  Demo videos : {[v['title'] for v in DEMO_VIDEOS]}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
