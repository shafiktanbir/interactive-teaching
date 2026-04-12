import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

from app.config import get_settings
from app.main import app
from app.seed import LESSON_ID, N_TEXT


def _mongo_available() -> bool:
    try:
        s = get_settings()
        client = MongoClient(s.mongodb_uri, serverSelectionTimeoutMS=2000)
        client.admin.command("ping")
        client.close()
        return True
    except Exception:
        return False


pytestmark = pytest.mark.skipif(
    not _mongo_available(),
    reason="MongoDB not reachable (start docker compose or set MONGODB_URI)",
)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_get_lesson_seed(client):
    res = client.get(f"/lessons/{str(LESSON_ID)}")
    assert res.status_code == 200
    body = res.json()
    assert body["title"] == "Interactive Teaching Platform"
    assert len(body["toc"]) == 3
    assert len(body.get("multimedia_strip", [])) >= 5


def test_get_interactive_text_node(client):
    res = client.get(f"/interactive-nodes/{str(N_TEXT)}")
    assert res.status_code == 200
    data = res.json()
    assert data["kind"] == "text"
    blob = (data.get("text") or "") + str(data.get("content") or "")
    assert "sample text" in blob.lower()


def test_post_patch_interactive_node(client):
    res = client.post(
        "/interactive-nodes",
        json={
            "kind": "text",
            "label": "API test",
            "source": {"type": "inline", "text": "hello", "rich_text": {"type": "doc", "content": []}},
        },
    )
    assert res.status_code == 201
    nid = res.json()["id"]
    pres = client.get(f"/interactive-nodes/{nid}")
    assert pres.status_code == 200
    patch = client.patch(
        f"/interactive-nodes/{nid}",
        json={"label": "API test updated"},
    )
    assert patch.status_code == 200
    assert patch.json()["label"] == "API test updated"
