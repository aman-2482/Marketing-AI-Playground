from fastapi.testclient import TestClient

from app.ai_service import DEFAULT_MODEL
from app.main import app


def test_health_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["app"] == "GenAI Marketing Lab"


def test_models_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/api/models")

    assert response.status_code == 200
    payload = response.json()
    assert "models" in payload
    assert isinstance(payload["models"], list)
    assert len(payload["models"]) > 0
    assert payload["default"] == DEFAULT_MODEL
    assert any(m["id"] == DEFAULT_MODEL for m in payload["models"])
