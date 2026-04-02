# backend/tests/test_manager.py
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock

from backend.DB_SQLite.database_shortcat import DatabaseManager





@pytest.mark.asyncio
async def test_add_task_user_not_found(client_with_manager_auth):
    """Test adding task for non-existent user."""
    task_data = {
        "username": "nonexistent",
        "title": "Task",
        "description": "Description",
        "deadline": "2025-12-31"
    }

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch.object(DatabaseManager, 'get_user_id_by_username2', new_callable=AsyncMock) as mock_get_id:
            mock_get_id.return_value = None
            response = client_with_manager_auth.post("/api/add_task", json=task_data)

    assert response.status_code == 404
    assert "Пользователь не найден" in response.json()["detail"]






@pytest.mark.asyncio
async def test_delete_task_not_manager(client_with_user_auth):
    """Test regular user trying to delete task (should be forbidden)."""
    delete_data = {
        "username": "employee1",
        "title": "Task"
    }

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "employee"

        response = client_with_user_auth.request(
            method="DELETE",
            url="/api/delete_task",
            content=json.dumps(delete_data),
            headers={"Content-Type": "application/json"}
        )

    assert response.status_code == 403
    assert "нет доступа" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_user_tasks_success(client_with_manager_auth):
    """Test successfully getting user tasks."""
    username = "employee1"
    tasks = [MagicMock(), MagicMock()]

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch.object(DatabaseManager, 'get_all_users_tasks', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = tasks
            response = client_with_manager_auth.get(f"/api/get_user_tasks/{username}")

    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_get_user_tasks_empty(client_with_manager_auth):
    """Test getting tasks for user with no tasks."""
    username = "employee1"

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch.object(DatabaseManager, 'get_all_users_tasks', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            response = client_with_manager_auth.get(f"/api/get_user_tasks/{username}")

    assert response.status_code == 404




@pytest.mark.asyncio
async def test_get_all_tasks_forbidden(client_with_user_auth):
    """Test regular user trying to get all tasks."""
    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "employee"

        response = client_with_user_auth.get("/api/get_all_tasks")

    assert response.status_code == 403
    assert "Доступ запрещен" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_deadline_success(client_with_manager_auth):
    """Test successful deadline update."""
    deadline_data = {
        "task_id": 1,
        "new_deadline": "2026-01-01"
    }

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch('backend.api.manager.new_session') as mock_session_ctx:
            mock_session = AsyncMock()
            mock_session_ctx.return_value.__aenter__.return_value = mock_session
            response = client_with_manager_auth.patch("/api/update_deadline", json=deadline_data)

    assert response.status_code == 200
    assert response.json()["status"] is True


@pytest.mark.asyncio
async def test_update_deadline_forbidden(client_with_user_auth):
    """Test regular user trying to update deadline."""
    deadline_data = {
        "task_id": 1,
        "new_deadline": "2026-01-01"
    }

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "employee"

        response = client_with_user_auth.patch("/api/update_deadline", json=deadline_data)

    assert response.status_code == 403
    assert "нет доступа" in response.json()["detail"]


@pytest.mark.asyncio
async def test_show_all_success(client_with_manager_auth):
    """Test successfully showing all users."""
    users = [MagicMock(), MagicMock()]

    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch.object(DatabaseManager, 'number_of_all_users', new_callable=AsyncMock) as mock_count:
            mock_count.return_value = 2

            with patch.object(DatabaseManager, 'get_all_users', new_callable=AsyncMock) as mock_get:
                mock_get.return_value = users
                response = client_with_manager_auth.get("/api/found/show_all")

    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_show_all_no_users(client_with_manager_auth):
    """Test showing all users when there are none."""
    with patch('backend.api.manager.is_manager', new_callable=AsyncMock) as mock_is_manager:
        mock_is_manager.return_value = "manager"

        with patch.object(DatabaseManager, 'number_of_all_users', new_callable=AsyncMock) as mock_count:
            mock_count.return_value = 0
            response = client_with_manager_auth.get("/api/found/show_all")

    assert response.status_code == 404