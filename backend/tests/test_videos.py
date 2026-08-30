from tests.conftest import auth_headers, make_user


def _approve_expert(client, db, user):
    admin = make_user(db, role="admin")
    headers = auth_headers(client, user.email, "Passw0rd!123")
    client.post(
        "/api/v1/experts/apply",
        json={"display_name": "Test Creator", "headline": "Ed", "bio": "Bio"},
        headers=headers,
    )
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    pending = client.get("/api/v1/admin/experts?status=pending", headers=admin_headers).json()
    target = next(e for e in pending if e["display_name"] == "Test Creator")
    review = client.patch(
        f"/api/v1/admin/experts/{target['id']}/review",
        json={"status": "approved"},
        headers=admin_headers,
    )
    assert review.status_code == 200
    return headers, admin_headers


def _submit(client, headers, title="What is DeFi really?", duration=300):
    return client.post(
        "/api/v1/experts/videos",
        json={
            "title": title,
            "description": "Lesson about DeFi",
            "source_url": "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
            "duration_seconds": duration,
            "difficulty": "beginner",
            "format": "long",
        },
        headers=headers,
    )


def test_non_expert_cannot_submit_video(client, db):
    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    response = _submit(client, headers)
    assert response.status_code == 403


def test_expert_submits_and_admin_publishes(client, db):
    from app.models.content import Video
    from app.models.enums import ContentStatus

    creator = make_user(db)
    headers, admin_headers = _approve_expert(client, db, creator)

    submitted = _submit(client, headers)
    assert submitted.status_code == 201
    body = submitted.json()
    assert body["status"] == "submitted"
    assert body["provider"] == "youtube"
    assert body["provider_video_id"] == "bBC-nXj3Ng4"

    mine = client.get("/api/v1/experts/me/videos", headers=headers).json()
    assert len(mine) == 1

    queue = client.get("/api/v1/admin/videos?status=submitted", headers=admin_headers).json()
    assert len(queue) >= 1
    video_id = queue[0]["id"]

    approve = client.patch(
        f"/api/v1/admin/videos/{video_id}/review", json={"action": "approve"}, headers=admin_headers
    )
    assert approve.status_code == 200

    publish = client.patch(
        f"/api/v1/admin/videos/{video_id}/review", json={"action": "publish"}, headers=admin_headers
    )
    assert publish.status_code == 200

    public = client.get(f"/api/v1/content/videos/{video_id}")
    assert public.status_code == 200
    assert public.json()["required_watch_percentage"] == "90.0"


def test_publish_without_duration_blocked(client, db):
    creator = make_user(db)
    headers, admin_headers = _approve_expert(client, db, creator)

    bad = client.post(
        "/api/v1/experts/videos",
        json={
            "title": "Zero duration lesson",
            "source_url": "https://youtu.be/bBC-nXj3Ng4",
            "duration_seconds": -5,
        },
        headers=headers,
    )
    assert bad.status_code == 422


def test_invalid_transition_rejected(client, db):
    creator = make_user(db)
    headers, admin_headers = _approve_expert(client, db, creator)
    submitted = _submit(client, headers)
    video_id = submitted.json()["id"]

    publish_directly = client.patch(
        f"/api/v1/admin/videos/{video_id}/review", json={"action": "publish"}, headers=admin_headers
    )
    assert publish_directly.status_code == 409


def test_external_url_accepted_and_non_http_rejected(client, db):
    creator = make_user(db)
    headers, _ = _approve_expert(client, db, creator)
    external = client.post(
        "/api/v1/experts/videos",
        json={
            "title": "Hosted video",
            "source_url": "https://example.com/video.mp4",
            "duration_seconds": 60,
        },
        headers=headers,
    )
    assert external.status_code == 201
    assert external.json()["provider"] == "external"

    garbage = client.post(
        "/api/v1/experts/videos",
        json={
            "title": "Bad source",
            "source_url": "file:///etc/passwd",
            "duration_seconds": 60,
        },
        headers=headers,
    )
    assert garbage.status_code == 422


def test_category_crud(client, db):
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    created = client.post(
        "/api/v1/admin/categories", json={"name": "NFT Basics"}, headers=admin_headers
    )
    assert created.status_code == 201
    duplicate = client.post(
        "/api/v1/admin/categories", json={"name": "nft basics"}, headers=admin_headers
    )
    assert duplicate.status_code == 409
    listing = client.get("/api/v1/content/categories").json()
    assert any(c["slug"] == "nft-basics" for c in listing)
