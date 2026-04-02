# backend/tests/test_user.py
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock

from backend.DB_SQLite.database_shortcat import DatabaseManager


@pytest.mark.asyncio
async def test_login_success(client):
    """Test successful user login."""
    login_data = {
        "username": "testuser",
        "password": "secret"
    }

    mock_user = MagicMock()
    mock_user.id = 1
    mock_user.username = "testuser"
    mock_user.role = "employee"
    mock_user.name = "Test"
    mock_user.surname = "User"
    mock_user.email_user = "test@example.com"
    mock_user.created_at = "2025-01-01"

    with patch.object(DatabaseManager, 'get_login', new_callable=AsyncMock) as mock_get_login:
        mock_get_login.return_value = mock_user

        response = client.post("/api/login", json=login_data)

    assert response.status_code == 200
    assert response.json()["message"] == "Пользователь найден"
    assert response.json()["user"]["id"] == 1
    assert "aboba" in response.cookies


@pytest.mark.asyncio
async def test_login_failure(client):
    """Test failed login (user not found)."""
    login_data = {
        "username": "nonexistent",
        "password": "password"
    }

    with patch.object(DatabaseManager, 'get_login', new_callable=AsyncMock) as mock_get_login:
        mock_get_login.return_value = None

        response = client.post("/api/login", json=login_data)

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_logout(client):
    """Test logout."""

    response = client.post("/api/logout")
    assert response.status_code == 200
    assert response.json()["status"] is True


@pytest.mark.asyncio
async def test_found_user_success(client_with_user_auth):
    """Test successfully finding a user."""
    found_data = {"username": "existing"}

    mock_user = MagicMock()
    mock_user.name = "John"
    mock_user.surname = "Doe"
    mock_user.role = "employee"
    mock_user.created_at = "2025-01-01"

    with patch.object(DatabaseManager, 'get_user_by_username', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_user

        response = client_with_user_auth.post("/api/found", json=found_data)

    assert response.status_code == 200
    assert response.json()["status"] is True
    assert response.json()["name_user"] == "John"


@pytest.mark.asyncio
async def test_found_user_not_found(client_with_user_auth):
    """Test finding non-existent user."""
    found_data = {"username": "missing"}

    with patch.object(DatabaseManager, 'get_user_by_username', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = None

        response = client_with_user_auth.post("/api/found", json=found_data)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_current_user_success(client_with_user_auth):
    """Test getting current user info."""
    with patch.object(DatabaseManager, 'get_user_by_id', new_callable=AsyncMock) as mock_get:
        mock_user = MagicMock()
        mock_get.return_value = mock_user

        response = client_with_user_auth.get("/api/get_current_user")

    assert response.status_code == 200
    mock_get.assert_awaited_once_with(3)  # user_id из фикстуры


@pytest.mark.asyncio
async def test_get_my_tasks_success(client_with_user_auth):
    """Test getting current user's tasks."""
    tasks = [MagicMock(), MagicMock()]

    with patch('backend.api.user.new_session') as mock_session_ctx:
        mock_session = AsyncMock()
        mock_session_ctx.return_value.__aenter__.return_value = mock_session
        mock_session.execute.return_value.scalars.return_value.all = AsyncMock(return_value=tasks)

        response = client_with_user_auth.get("/api/get_my_tasks")

    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_update_progress_success(client_with_user_auth):
    """Test successfully updating task progress."""
    progress_data = {
        "task_title": "My Task",
        "progress": 75
    }

    with patch('backend.api.user.new_session') as mock_session_ctx:
        mock_session = AsyncMock()
        mock_session_ctx.return_value.__aenter__.return_value = mock_session
        mock_session.execute.return_value.scalar_one_or_none = AsyncMock(return_value=MagicMock())

        response = client_with_user_auth.patch("/api/tasks/My Task/progress", json=progress_data)

    assert response.status_code == 200
    assert response.json()["progress"] == 75


@pytest.mark.asyncio
async def test_update_progress_task_not_found(client_with_user_auth):
    """Test updating progress of non-existent task."""
    progress_data = {
        "task_title": "Nonexistent Task",
        "progress": 50
    }

    with patch('backend.api.user.new_session') as mock_session_ctx:
        mock_session = AsyncMock()
        mock_session_ctx.return_value.__aenter__.return_value = mock_session
        mock_session.execute.return_value.scalar_one_or_none = AsyncMock(return_value=None)

        response = client_with_user_auth.patch("/api/tasks/Nonexistent Task/progress", json=progress_data)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_add_comment_success(client_with_user_auth):
    """Test successfully adding a comment."""
    comment_data = {
        "task_id": 1,
        "text": "Great work!",
        "attached_file": None
    }

    with patch.object(DatabaseManager, 'add_comment', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = MagicMock()

        response = client_with_user_auth.post("/api/add_new_comment", json=comment_data)

    assert response.status_code == 200
    assert response.json()["status"] is True


@pytest.mark.asyncio
async def test_add_comment_forbidden(client_with_user_auth):
    """Test adding comment to someone else's task (should be forbidden)."""
    comment_data = {
        "task_id": 1,
        "text": "Comment",
        "attached_file": None
    }

    with patch.object(DatabaseManager, 'add_comment', new_callable=AsyncMock) as mock_add:
        mock_add.return_value = None

        response = client_with_user_auth.post("/api/add_new_comment", json=comment_data)

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_comment_success(client_with_user_auth):
    """Test successfully deleting a comment."""
    delete_data = {"comment_id": 5}

    with patch.object(DatabaseManager, 'delete_comment_with_comment_id_and_user_id',
                      new_callable=AsyncMock) as mock_del:
        mock_del.return_value = True

        response = client_with_user_auth.request(
            method="DELETE",
            url="/api/delete_comment",
            json=delete_data
        )

    assert response.status_code == 200
    assert response.json()["status"] is True


@pytest.mark.asyncio
async def test_delete_comment_forbidden(client_with_user_auth):
    """Test deleting someone else's comment (should be forbidden)."""
    delete_data = {"comment_id": 5}

    with patch.object(DatabaseManager, 'delete_comment_with_comment_id_and_user_id',
                      new_callable=AsyncMock) as mock_del:
        mock_del.return_value = None

        response = client_with_user_auth.request(
            method="DELETE",
            url="/api/delete_comment",
            json=delete_data
        )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_settings_success(client_with_user_auth):
    """Test successfully updating user settings."""
    settings_data = {
        "new_lang": "en",
        "new_theme": "dark"
    }

    with patch('backend.api.user.new_session') as mock_session_ctx:
        mock_session = AsyncMock()
        mock_session_ctx.return_value.__aenter__.return_value = mock_session

        response = client_with_user_auth.patch("/api/reset_settings", json=settings_data)

    assert response.status_code == 200
    assert response.json()["updated_fields"] == {"language_app": "en", "theme_style": "dark"}


@pytest.mark.asyncio
async def test_update_settings_partial(client_with_user_auth):
    """Test partial settings update (only language)."""
    settings_data = {
        "new_lang": "ru",
        "new_theme": None
    }

    with patch('backend.api.user.new_session') as mock_session_ctx:
        mock_session = AsyncMock()
        mock_session_ctx.return_value.__aenter__.return_value = mock_session

        response = client_with_user_auth.patch("/api/reset_settings", json=settings_data)

    assert response.status_code == 200
    assert response.json()["updated_fields"] == {"language_app": "ru"}