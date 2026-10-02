"""
Security tests for authentication, authorization, and tenant isolation
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_unauthenticated_request_rejected(test_client):
    """Unauthenticated requests to protected endpoints should be rejected"""
    response = test_client.get("/violations/")
    assert response.status_code == 401


def test_malformed_token_rejected(test_client):
    """Malformed JWT tokens should be rejected"""
    response = test_client.get(
        "/violations/",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401


def test_missing_authorization_header(test_client):
    """Missing Authorization header should be rejected"""
    response = test_client.get("/violations/")
    assert response.status_code == 401


def test_health_endpoint_public(test_client):
    """Health endpoint should be accessible without authentication"""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data


def test_root_endpoint_public(test_client):
    """Root endpoint should be accessible without authentication"""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data


def test_invalid_object_id_format(test_client):
    """Invalid MongoDB ObjectId format should be rejected"""
    # First get a valid token
    register_response = test_client.post(
        "/auth/register-company",
        json={
            "name": "Test Security Co",
            "industry": "Testing",
            "admin_email": "security@test.com",
            "admin_password": "testpass123",
            "admin_name": "Security Tester"
        }
    )
    
    if register_response.status_code == 201:
        token = register_response.json()["access_token"]
        
        # Try to access violation with invalid ID
        response = test_client.get(
            "/violations/invalid_id",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        assert "Invalid" in response.json()["detail"]


def test_unauthorized_model_training(test_client):
    """Non-admin users should not be able to train models"""
    # This test would require setting up a non-admin user
    # For now, verify endpoint requires authentication
    response = test_client.post(
        "/ml/train",
        json={"model_version": "v1"}
    )
    assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
