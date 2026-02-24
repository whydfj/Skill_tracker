from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_root_redirect():
    response = client.get("/")
    # Должен редиректить на /static/index.html
    assert response.status_code in (200, 307, 308)


def test_ai_request_basic():
    response = client.post(
        "/api/ai_request",
        json={"question": "Как в приложении создать новую задачу для сотрудника?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, str)
    assert len(data) > 0


def test_ai_task_autocomplete_basic():
    payload = {
        "username": "test_user",
        "title": "Подготовка отчета по продажам",
        "draft_description": "Сделать отчет по результатам квартала",
    }
    response = client.post("/api/ai_task_autocomplete", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suggested_description" in data
    assert isinstance(data["suggested_description"], str)
    assert len(data["suggested_description"]) > 0

