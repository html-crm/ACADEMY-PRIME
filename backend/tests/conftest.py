import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models
from app.core.deps import get_current_user
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models.enums import AccountStatus, UserRole
from app.models.user import User, UserProfile

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture()
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db):
    from app.core.rate_limit import _auth_limiter

    _auth_limiter.reset()
    application = create_app()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    application.dependency_overrides[get_db] = override_get_db
    yield TestClient(application)
    application.dependency_overrides.clear()


_counter = {"n": 0}


def make_user(
    db,
    role: UserRole = UserRole.USER,
    status: AccountStatus = AccountStatus.ACTIVE,
    password: str = "Passw0rd!123",
) -> User:
    _counter["n"] += 1
    n = _counter["n"]
    user = User(
        email=f"user{n}@example.com",
        username=f"user{n}",
        password_hash=hash_password(password),
        role=role,
        status=status,
    )
    user.profile = UserProfile(display_name=f"User {n}")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(client: TestClient, email: str, password: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
