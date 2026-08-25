from datetime import datetime, timedelta, timezone

from app.models.enums import VerificationLevel
from app.models.progress import VideoCompletion
from tests.conftest import auth_headers, make_user


def _become_expert(client, db, user):
    client.post(
        "/api/v1/experts/apply",
        json={"display_name": "Test Creator"},
        headers=auth_headers(client, user.email, "Passw0rd!123"),
    )
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    pending = client.get("/api/v1/admin/experts?status=pending", headers=admin_headers).json()
    target = next(e for e in pending if e["display_name"] == "Test Creator")
    response = client.patch(
        f"/api/v1/admin/experts/{target['id']}/review",
        json={"status": "approved"},
        headers=admin_headers,
    )
    assert response.status_code == 200
    return auth_headers(client, user.email, "Passw0rd!123")


def _submit(client, headers, duration=300, format_="long", title="My sample lesson post"):
    return client.post(
        "/api/v1/experts/videos",
        json={
            "title": title,
            "source_url": "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
            "duration_seconds": duration,
            "difficulty": "beginner",
            "format": format_,
        },
        headers=headers,
    )


def test_expert_can_update_own_video(client, db):
    user = make_user(db)
    headers = _become_expert(client, db, user)
    created = _submit(client, headers)
    assert created.status_code == 201
    video_id = created.json()["id"]

    updated = client.patch(
        f"/experts/videos/{video_id}".replace("/experts", "/api/v1/experts"),
        json={"title": "Updated lesson title here", "duration_seconds": 420},
        headers=headers,
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["title"] == "Updated lesson title here"


def test_short_video_duration_validated_on_submit_and_update(client, db):
    user = make_user(db)
    headers = _become_expert(client, db, user)

    too_long = _submit(client, headers, duration=90, format_="short", title="Too long short clip")
    assert too_long.status_code == 422
    assert too_long.json()["detail"]["code"] == "short_too_long"

    ok = _submit(client, headers, duration=45, format_="short", title="Valid short clip post")
    assert ok.status_code == 201

    updated = client.patch(
        "/api/v1/experts/videos/" + ok.json()["id"],
        json={"duration_seconds": 61},
        headers=headers,
    )
    assert updated.status_code == 422


def test_expert_cannot_touch_other_experts_video(client, db):
    owner = make_user(db)
    other = make_user(db)
    owner_headers = _become_expert(client, db, owner)
    created = _submit(client, owner_headers)
    assert created.status_code == 201
    video_id = created.json()["id"]

    other_headers = _become_expert(client, db, other)
    patched = client.patch(f"/api/v1/experts/videos/{video_id}", json={"title": "Hijacked title"}, headers=other_headers)
    assert patched.status_code == 404
    deleted = client.delete(f"/api/v1/experts/videos/{video_id}", headers=other_headers)
    assert deleted.status_code == 404


def test_expert_can_delete_unpublished_but_not_published(client, db):
    user = make_user(db)
    admin = make_user(db, role="admin")
    headers = _become_expert(client, db, user)
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")

    created = _submit(client, headers)
    video_id = created.json()["id"]

    approved = client.patch(
        f"/api/v1/admin/videos/{video_id}/review", json={"action": "approve"}, headers=admin_headers
    )
    assert approved.status_code == 200
    published = client.patch(
        f"/api/v1/admin/videos/{video_id}/review", json={"action": "publish"}, headers=admin_headers
    )
    assert published.status_code == 200

    blocked = client.delete(f"/api/v1/experts/videos/{video_id}", headers=headers)
    assert blocked.status_code == 409
    assert blocked.json()["detail"]["code"] == "published_video"


def test_expert_earnings_endpoint(client, db):
    from app.models.content import Video as VideoModel

    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    headers = _become_expert(client, db, user)

    created = _submit(client, headers)
    video_id = created.json()["id"]
    client.patch(f"/api/v1/admin/videos/{video_id}/review", json={"action": "approve"}, headers=admin_headers)
    client.patch(f"/api/v1/admin/videos/{video_id}/review", json={"action": "publish"}, headers=admin_headers)

    # Simulate one learner completion + issued reward.
    import uuid

    video = db.get(VideoModel, uuid.UUID(video_id))
    learner = make_user(db)
    completion = VideoCompletion(
        user_id=learner.id,
        video_id=video.id,
        verification_level=VerificationLevel.HEARTBEAT_ONLY,
        required_percentage=90,
    )
    db.add(completion)
    db.commit()

    earnings = client.get("/api/v1/experts/me/earnings", headers=headers)
    assert earnings.status_code == 200, earnings.text
    body = earnings.json()
    assert body["videos_total"] == 1
    assert body["videos_published"] == 1
    assert body["completions"] == 1
