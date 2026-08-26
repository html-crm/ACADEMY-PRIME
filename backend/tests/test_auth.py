from tests.conftest import auth_headers


def test_register_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "username": "alice", "password": "Str0ngPass!x"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["access_token"]
    assert body["refresh_token"]


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "username": "dupone", "password": "Str0ngPass!x"}
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201
    conflict = client.post(
        "/api/v1/auth/register",
        json={"email": "DUP@example.com", "username": "duptwo", "password": "Str0ngPass!x"},
    )
    assert conflict.status_code == 409
    assert conflict.json()["detail"]["code"] == "email_already_registered"


def test_register_duplicate_username(client):
    client.post("/api/v1/auth/register", json={"email": "u1@example.com", "username": "same_name", "password": "Str0ngPass!x"})
    second = client.post("/api/v1/auth/register", json={"email": "u2@example.com", "username": "same_name", "password": "Str0ngPass!x"})
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "username_taken"


def test_register_weak_password_rejected(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "username": "weakling", "password": "short"},
    )
    assert response.status_code == 422


def test_login_success_and_me(client):
    client.post("/api/v1/auth/register", json={"email": "bob@example.com", "username": "bob", "password": "Str0ngPass!x"})
    login = client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "Str0ngPass!x"})
    assert login.status_code == 200
    me = client.get("/api/v1/auth/me", headers=auth_headers_from(login))
    assert me.status_code == 200
    assert me.json()["username"] == "bob"


def auth_headers_from(login_response):
    return {"Authorization": f"Bearer {login_response.json()['access_token']}"}


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"email": "carl@example.com", "username": "carl", "password": "Str0ngPass!x"})
    bad = client.post("/api/v1/auth/login", json={"email": "carl@example.com", "password": "WrongPassword1!"})
    assert bad.status_code == 401
    assert bad.json()["detail"]["code"] == "invalid_credentials"


def test_me_requires_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_refresh_rotation(client):
    registered = client.post(
        "/api/v1/auth/register",
        json={"email": "dave@example.com", "username": "dave", "password": "Str0ngPass!x"},
    )
    refresh_token = registered.json()["refresh_token"]
    rotated = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert rotated.status_code == 200
    new_pair = rotated.json()
    assert new_pair["access_token"] != registered.json()["access_token"]

    reuse = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert reuse.status_code == 401
    assert reuse.json()["detail"]["code"] == "token_reuse_detected"

    family_dead = client.post("/api/v1/auth/refresh", json={"refresh_token": new_pair["refresh_token"]})
    assert family_dead.status_code == 401


def test_logout_revokes_session(client, db):
    from app.models.user import RefreshToken

    registered = client.post(
        "/api/v1/auth/register",
        json={"email": "erin@example.com", "username": "erin", "password": "Str0ngPass!x"},
    )
    refresh_token = registered.json()["refresh_token"]
    headers = {"Authorization": f"Bearer {registered.json()['access_token']}"}
    logout = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers=headers)
    assert logout.status_code == 204
    rows = db.query(RefreshToken).all()
    assert any(r.revoked_at is not None for r in rows)
