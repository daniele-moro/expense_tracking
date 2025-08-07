"""
Simple test to verify the authentication endpoints work
"""
import pytest
from fastapi.testclient import TestClient
from main import app

def test_app_starts():
    """Test that the app can start"""
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Expense Tracking API"

def test_health_endpoint():
    """Test health check endpoint"""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_endpoint_exists():
    """Test that the register endpoint is accessible"""
    client = TestClient(app)
    # Try to access the endpoint with empty data - should get validation error
    response = client.post("/api/v1/auth/register", json={})
    # Should get 422 validation error, not 404 (endpoint not found)
    assert response.status_code == 422
