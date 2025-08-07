"""
Tests for main FastAPI application endpoints
"""
from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test the root endpoint returns expected response"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Expense Tracking API"
    assert data["version"] == "1.0.0"


def test_health_check_endpoint(client: TestClient):
    """Test the health check endpoint returns healthy status"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
