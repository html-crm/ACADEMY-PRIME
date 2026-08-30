import uuid
from decimal import Decimal

from app.models.enums import AccountStatus, RewardEntryType, RewardStatus, UserRole
from app.models.reward import Reward
from app.models.user import User
from tests.conftest import auth_headers, make_user

PASSWORD = "Passw0rd!123"


def _seed_reward(db, user: User, amount: str, status: RewardStatus = RewardStatus.AVAILABLE):
    reward = Reward(
        user_id=user.id,
        entry_type=RewardEntryType.VIDEO_COMPLETION,
        source_type="video_completion",
        source_id=uuid.uuid4(),
        video_id=None,
        amount=Decimal(amount),
        status=status,
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


def _auth(client, user):
    return auth_headers(client, user.email, PASSWORD)


def test_leaderboard_empty_when_no_earnings(client):
    body = client.get("/api/v1/leaderboard").json()
    assert body["items"] == []
    assert body["total_ranked"] == 0


def test_leaderboard_orders_and_sums_earned(client, db):
    alice = make_user(db)
    bob = make_user(db)
    carol = make_user(db)

    _seed_reward(db, alice, "25.000000000")
    _seed_reward(db, alice, "50.000000000")
    _seed_reward(db, bob, "10.000000000")
    _seed_reward(db, carol, "0.500000000")

    items = client.get("/api/v1/leaderboard").json()["items"]

    assert [i["rank"] for i in items] == [1, 2, 3]
    assert items[0]["username"] == alice.username
    assert items[0]["total_earned"] == "75.000000000"
    assert items[0]["earned_count"] == 2
    assert items[1]["username"] == bob.username
    assert items[1]["total_earned"] == "10.000000000"
    assert items[2]["username"] == carol.username
    assert items[2]["total_earned"] == "0.500000000"


def test_leaderboard_excludes_non_earned_statuses(client, db):
    alice = make_user(db)
    _seed_reward(db, alice, "100.000000000", RewardStatus.AVAILABLE)
    _seed_reward(db, alice, "999.000000000", RewardStatus.PENDING)
    _seed_reward(db, alice, "999.000000000", RewardStatus.CANCELLED)
    _seed_reward(db, alice, "999.000000000", RewardStatus.REVERSED)
    _seed_reward(db, alice, "999.000000000", RewardStatus.FAILED)

    items = client.get("/api/v1/leaderboard").json()["items"]
    assert len(items) == 1
    assert items[0]["total_earned"] == "100.000000000"


def test_leaderboard_excludes_admin_and_non_active(client, db):
    alice = make_user(db)
    admin = make_user(db, role=UserRole.ADMIN)
    banned = make_user(db, status=AccountStatus.BANNED)

    _seed_reward(db, alice, "5.000000000")
    _seed_reward(db, admin, "5000.000000000")
    _seed_reward(db, banned, "9000.000000000")

    items = client.get("/api/v1/leaderboard").json()["items"]
    assert len(items) == 1
    assert items[0]["username"] == alice.username


def test_leaderboard_highlights_current_user(client, db):
    alice = make_user(db)
    bob = make_user(db)
    _seed_reward(db, alice, "30.000000000")
    _seed_reward(db, bob, "5.000000000")

    headers = _auth(client, bob)
    items = client.get("/api/v1/leaderboard", headers=headers).json()["items"]
    bob_row = next(i for i in items if i["username"] == bob.username)
    assert bob_row["is_you"] is True
    assert all(i["is_you"] is False for i in items if i["username"] != bob.username)


def test_leaderboard_respects_limit(client, db):
    for _ in range(5):
        u = make_user(db)
        _seed_reward(db, u, "1.000000000")
    body = client.get("/api/v1/leaderboard?limit=2").json()
    assert len(body["items"]) == 2
    assert body["total_ranked"] == 5


def test_leaderboard_me_returns_standing(client, db):
    alice = make_user(db)
    bob = make_user(db)
    _seed_reward(db, alice, "40.000000000")
    _seed_reward(db, bob, "7.000000000")

    headers = _auth(client, alice)
    body = client.get("/api/v1/leaderboard/me", headers=headers).json()
    assert body["rank"] == 1
    assert body["username"] == alice.username
    assert body["total_earned"] == "40.000000000"
    assert body["earned_count"] == 1

    carol = make_user(db)
    headers_carol = _auth(client, carol)
    body2 = client.get("/api/v1/leaderboard/me", headers=headers_carol).json()
    assert body2["rank"] is None
    assert body2["total_earned"] == "0"
    assert body2["earned_count"] == 0


def test_leaderboard_me_requires_auth(client):
    response = client.get("/api/v1/leaderboard/me")
    assert response.status_code == 401
