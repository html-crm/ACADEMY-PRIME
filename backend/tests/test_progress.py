from tests.conftest import auth_headers, make_user


def _publish_video(db, duration: int = 600, provider: str = "youtube", video_id: str | None = None) -> str:
    from datetime import datetime, timezone
    import uuid as uuidlib

    from app.models.content import Video
    from app.models.enums import ContentStatus, Difficulty, VideoFormat, VideoProvider

    vid = video_id or uuidlib.uuid4().hex[:11]
    video = Video(
        title="Demo lesson for tests",
        slug=vid + "-slug",
        provider=VideoProvider(provider),
        source_url=f"https://www.youtube.com/watch?v={vid}",
        provider_video_id=vid,
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


def _beat(client, headers, video_id, position, ended=False):
    return client.post(
        "/api/v1/progress/heartbeat",
        json={"video_id": video_id, "position_seconds": position, "state": "playing", "ended": ended},
        headers=headers,
    )


def test_heartbeat_requires_auth(client):
    response = client.post("/api/v1/progress/heartbeat", json={"video_id": "00000000-0000-0000-0000-000000000000", "position_seconds": 1})
    assert response.status_code == 401


def test_normal_watch_completes_and_issues_reward_once(client, db):
    from datetime import datetime, timedelta, timezone

    from app.models.progress import VideoProgress

    user = make_user(db)
    admin = make_user(db, role="admin")
    admin_headers = auth_headers(client, admin.email, "Passw0rd!123")
    client.put(
        "/api/v1/admin/settings/rewards",
        json={
            "default_video_reward": "10.000000000",
            "default_watch_percentage": 90,
            "daily_claim_limit": 5,
            "min_account_age_days": 0,
            "course_bonus_reward": "0",
        },
        headers=admin_headers,
    )
    headers = auth_headers(client, user.email, "Passw0rd!123")
    video_id = _publish_video(db, duration=100)

    first = _beat(client, headers, video_id, 30)
    assert first.status_code == 200
    body = first.json()
    assert body["completed"] is False
    assert body["current_percentage"] == "30.0"

    row = db.query(VideoProgress).one()
    row.updated_at = datetime.now(timezone.utc) - timedelta(seconds=70)
    db.commit()

    second = _beat(client, headers, video_id, 95, ended=True)
    assert second.status_code == 200
    body = second.json()
    assert body["completed"] is True
    assert body["reward_issued"] is True

    again = _beat(client, headers, video_id, 96)
    assert again.status_code == 200
    assert again.json()["reward_issued"] is False

    dashboard = client.get("/api/v1/users/me/dashboard", headers=headers).json()
    assert dashboard["available"] != "0"
    lessons = dashboard["lessons_completed"]
    assert lessons == 1


def test_scrubbing_is_not_credited(client, db):
    import time

    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    video_id = _publish_video(db, duration=600)

    first = _beat(client, headers, video_id, 5)
    assert first.status_code == 200

    time.sleep(0.05)

    scrub = _beat(client, headers, video_id, 590)
    body = scrub.json()
    assert scrub.status_code == 200
    assert body["max_position_seconds"] == 590

    completed_early = client.get("/api/v1/users/me/dashboard", headers=headers).json()
    assert completed_early["lessons_completed"] == 0


def test_unpublished_video_rejected(client, db):
    from app.models.content import Video
    from app.models.enums import ContentStatus, Difficulty, VideoFormat, VideoProvider

    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    video = Video(
        title="Draft lesson",
        slug="draft-lesson-x",
        provider=VideoProvider.YOUTUBE,
        source_url="https://www.youtube.com/watch?v=abcdefghijk",
        duration_seconds=100,
        status=ContentStatus.SUBMITTED,
    )
    db.add(video)
    db.commit()

    response = _beat(client, headers, str(video.id), 10)
    assert response.status_code == 404


def test_my_progress_lists_rows(client, db):
    user = make_user(db)
    headers = auth_headers(client, user.email, "Passw0rd!123")
    video_id = _publish_video(db, duration=100)
    _beat(client, headers, video_id, 40)
    rows = client.get("/api/v1/progress/my", headers=headers).json()
    assert rows["total"] == 1
    item = rows["items"][0]
    assert item["percentage"] == "40.0"
    assert item["completed"] is False
