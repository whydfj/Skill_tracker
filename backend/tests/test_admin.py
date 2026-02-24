# backend/tests/test_admin.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from backend.DB_SQLite.database_shortcat import DatabaseManager


@pytest.mark.asyncio
async def test_create_user_success(client_with_admin_auth):
    """Test successful user creation by admin."""
    user_data = {
        "username": "newuser",
        "password": "secret",
        "role": "employee",
        "name": "John",
        "surname": "Doe",
        "email_user": "john@example.com"
    }

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "admin"

        with patch.object(DatabaseManager, 'get_user_by_username_or_email', new_callable=AsyncMock) as mock_get_user:
            mock_get_user.return_value = None

            with patch.object(DatabaseManager, 'create_user', new_callable=AsyncMock) as mock_create:
                mock_create.return_value = {"user": MagicMock(), "settings": MagicMock()}

                with patch.object(DatabaseManager, 'send_registration_email', new_callable=AsyncMock) as mock_email:
                    response = client_with_admin_auth.post("/api/create_user", json=user_data)

    assert response.status_code == 200
    assert response.json()["status"] is True

    assert "Пользователь создан успешно" in response.json()["message"]
    mock_get_user.assert_awaited_once_with("newuser", "john@example.com")
    mock_create.assert_awaited_once()
    mock_email.assert_awaited_once_with("john@example.com", "newuser", "secret")


@pytest.mark.asyncio
async def test_create_user_already_exists(client_with_admin_auth):
    """Test creating a user that already exists."""
    user_data = {
        "username": "existing",
        "password": "secret",
        "role": "employee",
        "name": "John",
        "surname": "Doe",
        "email_user": "john@example.com"
    }

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "admin"

        with patch.object(DatabaseManager, 'get_user_by_username_or_email', new_callable=AsyncMock) as mock_get_user:
            mock_get_user.return_value = MagicMock()
            response = client_with_admin_auth.post("/api/create_user", json=user_data)

    assert response.status_code == 405

    assert "Пользователь с таким именем или email уже существует" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_user_short_password(client_with_admin_auth):
    """Test creating a user with too short password."""
    user_data = {
        "username": "newuser",
        "password": "123",
        "role": "employee",
        "name": "John",
        "surname": "Doe",
        "email_user": "john@example.com"
    }

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "admin"

        with patch.object(DatabaseManager, 'get_user_by_username_or_email', new_callable=AsyncMock) as mock_get_user:
            mock_get_user.return_value = None
            response = client_with_admin_auth.post("/api/create_user", json=user_data)

    assert response.status_code == 400

    assert "Длина пароля должна быть хотя бы 4" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_user_not_admin(client_with_user_auth):
    """Test non-admin trying to create a user."""
    user_data = {
        "username": "newuser",
        "password": "secret",
        "role": "employee",
        "name": "John",
        "surname": "Doe",
        "email_user": "john@example.com"
    }

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "employee"

        response = client_with_user_auth.post("/api/create_user", json=user_data)

    assert response.status_code == 401

    assert "только администратор" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_user_success(client_with_admin_auth):
    """Test successful user deletion."""
    delete_data = {"username": "user_to_delete"}

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "admin"

        with patch.object(DatabaseManager, 'get_user_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = MagicMock()

            with patch.object(DatabaseManager, 'delete_user', new_callable=AsyncMock) as mock_delete:
                mock_delete.return_value = True
                response = client_with_admin_auth.request(
                    method="DELETE",
                    url="/api/found/delete",
                    json=delete_data
                )

    assert response.status_code == 200
    assert response.json()["status"] is True

    assert "Пользователь удален" in response.json()["message"]


@pytest.mark.asyncio
async def test_delete_user_not_found(client_with_admin_auth):
    """Test deleting non-existent user."""
    delete_data = {"username": "nonexistent"}

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "admin"

        with patch.object(DatabaseManager, 'get_user_by_username', new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None
            response = client_with_admin_auth.request(
                method="DELETE",
                url="/api/found/delete",
                json=delete_data
            )

    assert response.status_code == 404

    assert "Пользователь не найден" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_user_not_admin(client_with_user_auth):
    """Test non-admin trying to delete a user."""
    delete_data = {"username": "someone"}

    with patch('backend.api.admin.is_admin', new_callable=AsyncMock) as mock_is_admin:
        mock_is_admin.return_value = "employee"

        response = client_with_user_auth.request(
            method="DELETE",
            url="/api/found/delete",
            json=delete_data
        )

    assert response.status_code == 401

    assert "только администратор" in response.json()["detail"]