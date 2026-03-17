from __future__ import annotations

from typing import Generator

import os

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, SessionLocal


TEST_DB_PATH = "./test_notes.db"


@pytest.fixture(autouse=True, scope="session")
def setup_test_db() -> Generator[None, None, None]:
    # Override database URL for tests by recreating engine bound to a test DB file
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


def test_create_note_success(client: TestClient) -> None:
    resp = client.post("/api/notes", json={"title": "Test Note", "body": "Content"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] > 0
    assert data["title"] == "Test Note"
    assert data["body"] == "Content"
    assert "created_at" in data and "updated_at" in data


def test_create_note_validation_error_empty_title(client: TestClient) -> None:
    resp = client.post("/api/notes", json={"title": "   "})
    assert resp.status_code == 422


def test_list_notes_ordering(client: TestClient) -> None:
    client.post("/api/notes", json={"title": "First"})
    client.post("/api/notes", json={"title": "Second"})

    resp = client.get("/api/notes", params={"limit": 10, "offset": 0})
    assert resp.status_code == 200
    data = resp.json()
    items = data["items"]
    assert len(items) >= 2
    assert items[0]["updated_at"] >= items[1]["updated_at"]


def test_get_note_by_id_and_404(client: TestClient) -> None:
    create_resp = client.post("/api/notes", json={"title": "Fetch Me"})
    note_id = create_resp.json()["id"]

    resp = client.get(f"/api/notes/{note_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == note_id

    resp_404 = client.get("/api/notes/999999")
    assert resp_404.status_code == 404
    assert resp_404.json()["detail"]["error"] == "Note not found"


def test_update_note_and_404(client: TestClient) -> None:
    create_resp = client.post("/api/notes", json={"title": "Old", "body": "Body"})
    note_id = create_resp.json()["id"]

    update_resp = client.patch(
        f"/api/notes/{note_id}", json={"title": "New", "body": "Updated"}
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["title"] == "New"
    assert data["body"] == "Updated"

    resp_404 = client.patch("/api/notes/999999", json={"title": "X"})
    assert resp_404.status_code == 404


def test_delete_note_and_404(client: TestClient) -> None:
    create_resp = client.post("/api/notes", json={"title": "To Delete"})
    note_id = create_resp.json()["id"]

    delete_resp = client.delete(f"/api/notes/{note_id}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/notes/{note_id}")
    assert get_resp.status_code == 404

    delete_404 = client.delete("/api/notes/999999")
    assert delete_404.status_code == 404
