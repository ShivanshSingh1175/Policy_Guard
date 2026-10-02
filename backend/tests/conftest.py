"""
Pytest configuration and shared fixtures
"""
import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.testclient import TestClient
from app.main import app
from app import db as db_module
from app.config import settings

# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db():
    """Get database connection for testing"""
    client = AsyncIOMotorClient(settings.MONGO_URI)
    database = client[settings.MONGO_DB_NAME + "_test"]
    yield database
    # Cleanup
    await client.drop_database(settings.MONGO_DB_NAME + "_test")
    client.close()


@pytest.fixture(scope="function")
def test_client():
    """Create a TestClient with database initialized
    
    Note: TestClient uses httpx which creates its own event loop.
    We use the raise_server_exceptions=False to handle the database
    initialization within the TestClient's context.
    """
    # Use the app's lifespan context manager
    with TestClient(app, raise_server_exceptions=True) as client:
        yield client
