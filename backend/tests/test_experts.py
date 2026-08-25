from sqlalchemy import select

from app.models.platform import Notification
from tests.conftest import auth_headers, make_user


def _apply(client, headers, name="Crypto Teacher"):
    return client.post(
        "/api/v1/experts/apply",
        json={
            "display_name": name,
            "headline": "Bitcoin educator since 2017",
            "bio": "Teaches blockchain fundamentals.",
            "links": ["https://example.com"],
        },
        headers=headers,
    )


def test_apply_as_expert(client, db):
    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    response = _apply(client, headers)
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending"

    duplicate = _apply(client, headers)
    assert duplicate.status_code == 409

    notifications = db.scalars(select(Notification).where(Notification.user_id == user.id)).all()
    assert any(n.type == "notification.expert.application_received" for n in notifications)


def test_admin_approves_expert_and_role_promoted(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    headers = auth_headers(client, user.email, "Passw0rd!123")
    applied = _apply(client, headers)

    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    pending = client.get("/api/v1/admin/experts?status=pending", headers=admin_headers)
    assert pending.status_code == 200
    target_id = pending.json()[0]["id"]

    approved = client.patch(
        f"/api/v1/admin/experts/{target_id}/review",
        json={"status": "approved", "note": "Great credentials."},
        headers=admin_headers,
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "approved"

    db.refresh(user)
    assert user.role.value == "expert"

    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["role"] == "expert"

    notifications = db.scalars(select(Notification).where(Notification.user_id == user.id)).all()
    assert any(n.type == "notification.expert.review.approved" for n in notifications)


def test_reject_expert_keeps_user_role(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    headers = auth_headers(client, user.email, "Passw0rd!123")
    applied = _apply(client, headers, name="Spam Creator")

    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    rejected = client.patch(
        f"/api/v1/admin/experts/{applied.json()['id']}/review",
        json={"status": "rejected", "note": "Insufficient expertise."},
        headers=admin_headers,
    )
    assert rejected.status_code == 200
    db.refresh(user)
    assert user.role.value == "user"


def test_pending_cannot_be_restored(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    headers = auth_headers(client, user.email, "Passw0rd!123")
    applied = _apply(client, headers)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    invalid = client.patch(
        f"/api/v1/admin/experts/{applied.json()['id']}/review",
        json={"status": "pending"},
        headers=admin_headers,
    )
    assert invalid.status_code == 409


def test_non_expert_cannot_read_expert_profile(client, db):
    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    response = client.get("/api/v1/experts/me", headers=headers)
    assert response.status_code == 404
