from decimal import Decimal
from sqlalchemy import select

from app.models.platform import AuditLog
from tests.conftest import auth_headers, make_user


def test_update_reward_settings_and_audit(client, db):
    admin = make_user(db, role="admin")
    headers = auth_headers(client, admin.email, "Passw0rd!123")

    initial = client.get("/api/v1/admin/settings/rewards", headers=headers)
    assert initial.status_code == 200
    assert Decimal(initial.json()["default_video_reward"]) == 0

    updated = client.put(
        "/api/v1/admin/settings/rewards",
        json={
            "default_video_reward": "10.000000000",
            "course_bonus_reward": "100.000000000",
            "default_watch_percentage": 90,
            "daily_claim_limit": 3,
            "min_account_age_days": 1,
            "expert_model": "fixed",
            "expert_per_video_reward": "5.000000000",
        },
        headers=headers,
    )
    assert updated.status_code == 200
    body = updated.json()
    assert Decimal(body["default_video_reward"]) == Decimal("10")
    assert body["daily_claim_limit"] == 3

    invalid_watch = client.put(
        "/api/v1/admin/settings/rewards",
        json={"default_watch_percentage": 150},
        headers=headers,
    )
    assert invalid_watch.status_code == 422

    logs = db.scalars(select(AuditLog).where(AuditLog.action == "admin.reward_settings.updated")).all()
    assert len(logs) == 1


def test_platform_settings_upsert(client, db):
    admin = make_user(db, role="admin")
    headers = auth_headers(client, admin.email, "Passw0rd!123")

    put = client.put(
        "/api/v1/admin/settings/platform/blockchain.token_mint",
        json={"value": {"mint": "", "network": "devnet"}, "description": "Configured later."},
        headers=headers,
    )
    assert put.status_code == 200

    bad_key = client.put(
        "/api/v1/admin/settings/platform/invalid key with spaces!",
        json={"value": {}},
        headers=headers,
    )
    assert bad_key.status_code == 422

    listing = client.get("/api/v1/admin/settings/platform", headers=headers)
    keys = [item["key"] for item in listing.json()]
    assert "blockchain.token_mint" in keys


def test_countries_upsert(client, db):
    admin = make_user(db, role="admin")
    headers = auth_headers(client, admin.email, "Passw0rd!123")

    put = client.put(
        "/api/v1/admin/countries/us",
        json={"name": "United States", "is_supported": True, "rewards_enabled": True},
        headers=headers,
    )
    assert put.status_code == 200
    assert put.json()["code"] == "US"

    bad = client.put(
        "/api/v1/admin/countries/usa",
        json={"name": "Not valid"},
        headers=headers,
    )
    assert bad.status_code == 422


def test_user_country_validation(client, db):
    admin = make_user(db, role="admin")
    user = make_user(db)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    user_headers = auth_headers(client, user.email, "Passw0rd!123")

    unknown = client.patch("/api/v1/users/me", json={"country_code": "XX"}, headers=user_headers)
    assert unknown.status_code == 422

    client.put(
        "/api/v1/admin/countries/de",
        json={"name": "Germany", "is_supported": True},
        headers=admin_headers,
    )
    ok = client.patch("/api/v1/users/me", json={"country_code": "de"}, headers=user_headers)
    assert ok.status_code == 200


def test_stats_counts(client, db):
    make_user(db)
    make_user(db)
    make_user(db, role="admin")
    admin_headers = None
    from app.models.user import User as UserModel

    admin = db.query(UserModel).filter(UserModel.role == "admin").first()
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    stats = client.get("/api/v1/admin/stats", headers=admin_headers)
    body = stats.json()
    assert body["users_total"] == 3
    assert body["users_active"] == 3
