# backend/tests/conftest.py
import pytest
import jwt
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from backend.main import app
from backend.core.security import security


# Секретный ключ должен соответствовать тому, что в вашем приложении
SECRET_KEY = "test-secret-key"  # замените на ваш реальный ключ из config.py
ALGORITHM = "HS256"


def create_test_token(user_id: int, role: str = "employee") -> str:
    """Создает настоящий JWT токен для тестов."""
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@pytest.fixture
def mock_db_session():
    """Mock of async database session."""
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = AsyncMock()
    session.execute.return_value.scalar_one_or_none = AsyncMock(return_value=None)
    session.execute.return_value.scalars.return_value.all = AsyncMock(return_value=[])
    session.execute.return_value.scalar = AsyncMock(return_value=None)
    return session


@pytest.fixture
def client():
    """Test client without authentication."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_token():
    """Return a real JWT token for admin."""
    return create_test_token(user_id=1, role="admin")


@pytest.fixture
def manager_token():
    """Return a real JWT token for manager."""
    return create_test_token(user_id=2, role="manager")


@pytest.fixture
def user_token():
    """Return a real JWT token for regular user."""
    return create_test_token(user_id=3, role="employee")


@pytest.fixture
def client_with_admin_auth(client, admin_token):
    """Client with admin authentication cookie."""
    client.cookies.set("aboba", admin_token)
    return client


@pytest.fixture
def client_with_manager_auth(client, manager_token):
    """Client with manager authentication cookie."""
    client.cookies.set("aboba", manager_token)
    return client


@pytest.fixture
def client_with_user_auth(client, user_token):
    """Client with user authentication cookie."""
    client.cookies.set("aboba", user_token)
    return client


@pytest.fixture
def client_without_auth(client):
    """Client without authentication."""
    return client


# Для обратной совместимости с тестами, которые используют старые имена
@pytest.fixture
def client_manager(client_with_manager_auth):
    """Alias for client_with_manager_auth."""
    return client_with_manager_auth


@pytest.fixture
def client_user(client_with_user_auth):
    """Alias for client_with_user_auth."""
    return client_with_user_auth