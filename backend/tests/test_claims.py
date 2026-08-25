from datetime import datetime, timedelta, timezone
import uuid
from decimal import Decimal

from app.models.progress import VideoProgress
from app.models.user import Wallet
from tests.conftest import auth_headers, make_user


def _configure_rewards(client, admin_headers, **overrides):
    payload = {
        "default_video_reward": "10.000000000",
        "default_watch_percentage": 90,
        "daily_claim_limit": 5,
        "min_account_age_days": 0,
        "course_bonus_reward": "0",
    }
    payload.update(overrides)
    response = client.put("/api/v1/admin/settings/rewards", json=payload, headers=admin_headers)
    assert response.status_code == 200, response.text


def _publish_video(db, video_id: str, duration: int = 100) -> str:
    from app.models.content import Video
    from app.models.enums import ContentStatus, Difficulty, VideoFormat, VideoProvider

    video = Video(
        title=f"Claim lesson {video_id}",
        slug=video_id + "-slug",
        provider=VideoProvider.YOUTUBE,
        source_url=f"https://www.youtube.com/watch?v={video_id}",
        provider_video_id=video_id,
        duration_seconds=duration,
        language="en",
        difficulty=Difficulty.BEGINNER,
        format=VideoFormat.LONG,
        status=ContentStatus.PUBLISHED,
        published_at=datetime.now(timezone.utc),
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return str(video.id)


def _complete(client, db, headers, video_id, duration=100):
    first = client.post(
        "/api/v1/progress/heartbeat",
        json={"video_id": video_id, "position_seconds": 30, "state": "playing"},
        headers=headers,
    )
    assert first.status_code == 200, first.text
    row = db.query(VideoProgress).filter_by(video_id=uuid.UUID(video_id)).one()
    row.updated_at = datetime.now(timezone.utc) - timedelta(seconds=duration)
    db.commit()
    final = client.post(
        "/api/v1/progress/heartbeat",
        json={"video_id": video_id, "position_seconds": duration, "state": "playing", "ended": True},
        headers=headers,
    )
    assert final.json()["reward_issued"] is True


def _link_wallet(client, headers, address="9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin"):
    return client.post(
        "/api/v1/users/me/wallets",
        json={"address": address, "is_primary": True},
        headers=headers,
    )


def test_claim_without_wallet_rejected(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    _configure_rewards(client, admin_headers)

    headers = auth_headers(client, user.email, "Passw0rd!123")
    _complete(client, db, headers, _publish_video(db, "claimvid01"))

    response = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "no_wallet"


def test_claim_moves_available_to_claimed(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    _configure_rewards(client, admin_headers)

    headers = auth_headers(client, user.email, "Passw0rd!123")
    _complete(client, db, headers, _publish_video(db, "claimvid02"))
    before = client.get("/api/v1/users/me/dashboard", headers=headers).json()

    assert _link_wallet(client, headers).status_code == 201

    ledger = client.get("/api/v1/users/me/rewards", headers=headers).json()
    assert ledger["total"] == 1
    assert ledger["items"][0]["status"] == "available"

    claim = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert claim.status_code == 200, claim.text
    body = claim.json()
    assert body["total_amount"] == before["available"]
    assert len(body["claims"]) == 1
    assert body["claims"][0]["status"] == "requested"

    after = client.get("/api/v1/users/me/dashboard", headers=headers).json()
    assert Decimal(after["available"]) == 0
    assert Decimal(after["claimed"]) > 0

    claims = client.get("/api/v1/users/me/rewards/claims", headers=headers).json()
    assert len(claims) == 1

    again = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert again.status_code == 409
    assert again.json()["detail"]["code"] == "nothing_to_claim"


def test_daily_claim_limit_enforced(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    _configure_rewards(client, admin_headers, daily_claim_limit=1)

    headers = auth_headers(client, user.email, "Passw0rd!123")
    assert _link_wallet(client, headers).status_code == 201
    _complete(client, db, headers, _publish_video(db, "claimvid03"))

    first = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert first.status_code == 200

    _complete(client, db, headers, _publish_video(db, "claimvid04"))
    second = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert second.status_code == 429
    assert second.json()["detail"]["code"] == "daily_limit_reached"


def test_min_account_age_blocks_claim(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    _configure_rewards(client, admin_headers, min_account_age_days=7)

    headers = auth_headers(client, user.email, "Passw0rd!123")
    _complete(client, db, headers, _publish_video(db, "claimvid05"))
    assert _link_wallet(client, headers).status_code == 201

    response = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "account_too_young"


def test_primary_wallet_used_for_payout(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    _configure_rewards(client, admin_headers)

    headers = auth_headers(client, user.email, "Passw0rd!123")
    _complete(client, db, headers, _publish_video(db, "claimvid06"))
    _link_wallet(client, headers)
    first = db.query(Wallet).filter_by(user_id=user.id, address="9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin").one()
    first.is_primary = False
    primary = Wallet(
        user_id=user.id,
        address="Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
        is_primary=True,
    )
    db.add(primary)
    db.commit()

    claim = client.post("/api/v1/users/me/rewards/claims", headers=headers)
    assert claim.status_code == 200
    assert claim.json()["wallet_address"] == primary.address
