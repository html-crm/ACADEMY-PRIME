from tests.conftest import auth_headers, make_user


def test_user_cannot_access_admin(client, db):
    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "forbidden"


def test_admin_can_access_admin(client, db):
    admin = make_user(db, role="admin")
    headers = auth_headers(client, admin.email, "Passw0rd!123")
    response = client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["users_total"] >= 1


def test_banned_user_locked_out(client, db):
    admin = make_user(db, role="admin")
    victim = make_user(db)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    ban = client.patch(
        f"/api/v1/admin/users/{victim.id}/status",
        json={"status": "banned"},
        headers=admin_headers,
    )
    assert ban.status_code == 200
    login = client.post("/api/v1/auth/login", json={"email": victim.email, "password": "Passw0rd!123"})
    assert login.status_code == 403
    assert login.json()["detail"]["code"] == "account_banned"


def test_admin_cannot_ban_admin(client, db):
    admin = make_user(db, role="admin")
    other_admin = make_user(db, role="admin")
    headers = auth_headers(client, admin.email, "Passw0rd!123")
    response = client.patch(
        f"/api/v1/admin/users/{other_admin.id}/status",
        json={"status": "suspended"},
        headers=headers,
    )
    assert response.status_code == 409


def test_suspended_user_cannot_login(client, db):
    admin = make_user(db, role="admin")
    user = make_user(db)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    suspend = client.patch(
        f"/api/v1/admin/users/{user.id}/status", json={"status": "suspended"}, headers=admin_headers
    )
    assert suspend.status_code == 200
    login = client.post("/api/v1/auth/login", json={"email": user.email, "password": "Passw0rd!123"})
    assert login.status_code == 403


def test_restore_user(client, db):
    admin = make_user(db, role="admin")
    user = make_user(db)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    client.patch(
        f"/api/v1/admin/users/{user.id}/status", json={"status": "banned"}, headers=admin_headers
    )
    restore = client.patch(
        f"/api/v1/admin/users/{user.id}/status", json={"status": "active"}, headers=admin_headers
    )
    assert restore.status_code == 200
    assert restore.json()["status"] == "active"
