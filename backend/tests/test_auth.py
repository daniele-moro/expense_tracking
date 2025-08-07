"""
Tests for authentication endpoints
"""
import pytest
from app.models.user import User


class TestUserRegistration:
    """Test cases for user registration endpoint"""

    def test_register_user_success(self, client):
        """Test successful user registration"""
        user_data = {
            "email": "test@example.com",
            "password": "TestPass123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data  # Password should not be in response

    def test_register_user_duplicate_email(self, client):
        """Test registration with duplicate email"""
        user_data = {
            "email": "duplicate@example.com",
            "password": "TestPass123"
        }
        
        # Register user first time
        response1 = client.post("/api/v1/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Try to register same email again
        response2 = client.post("/api/v1/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"]

    def test_register_user_invalid_email(self, client):
        """Test registration with invalid email format"""
        user_data = {
            "email": "invalid-email",
            "password": "TestPass123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error

    def test_register_user_weak_password(self, client):
        """Test registration with weak password"""
        test_cases = [
            {"email": "test1@example.com", "password": "short"},  # Too short
            {"email": "test2@example.com", "password": "12345678"},  # No letters
            {"email": "test3@example.com", "password": "onlyletters"},  # No numbers
        ]
        
        for user_data in test_cases:
            response = client.post("/api/v1/auth/register", json=user_data)
            assert response.status_code == 422  # Validation error

    def test_register_user_missing_fields(self, client):
        """Test registration with missing required fields"""
        # Missing email
        response1 = client.post("/api/v1/auth/register", json={"password": "TestPass123"})
        assert response1.status_code == 422
        
        # Missing password
        response2 = client.post("/api/v1/auth/register", json={"email": "test@example.com"})
        assert response2.status_code == 422


class TestUserLogin:
    """Test cases for user login endpoint"""

    @pytest.fixture
    def registered_user(self, client):
        """Create a registered user for login tests"""
        user_data = {
            "email": "logintest@example.com",
            "password": "TestPass123"
        }
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        return user_data

    def test_login_success(self, registered_user, client):
        """Test successful user login"""
        login_data = {
            "email": registered_user["email"],
            "password": registered_user["password"]
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["expires_in"] > 0

    def test_login_invalid_credentials(self, registered_user, client):
        """Test login with invalid credentials"""
        # Wrong password
        login_data1 = {
            "email": registered_user["email"],
            "password": "wrongpassword"
        }
        response1 = client.post("/api/v1/auth/login", json=login_data1)
        assert response1.status_code == 401
        assert "Invalid email or password" in response1.json()["detail"]
        
        # Non-existent email
        login_data2 = {
            "email": "nonexistent@example.com",
            "password": registered_user["password"]
        }
        response2 = client.post("/api/v1/auth/login", json=login_data2)
        assert response2.status_code == 401
        assert "Invalid email or password" in response2.json()["detail"]

    def test_login_invalid_email_format(self, client):
        """Test login with invalid email format"""
        login_data = {
            "email": "invalid-email",
            "password": "TestPass123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 422  # Validation error

    def test_login_missing_fields(self, client):
        """Test login with missing required fields"""
        # Missing password
        response1 = client.post("/api/v1/auth/login", json={"email": "test@example.com"})
        assert response1.status_code == 422
        
        # Missing email
        response2 = client.post("/api/v1/auth/login", json={"password": "TestPass123"})
        assert response2.status_code == 422
