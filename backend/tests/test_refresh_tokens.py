"""
Tests for refresh token functionality
"""
import pytest
import time
from datetime import datetime, timedelta
from sqlalchemy import update

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.services.auth_service import get_password_hash


@pytest.fixture
def refresh_test_user(db_session):
    """Create a test user for refresh token tests"""
    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpassword")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    yield user


class TestRefreshTokens:
    
    def test_refresh_token_success(self, refresh_test_user, client):
        """Test successful refresh token flow"""
        # Login first
        login_response = client.post("/api/v1/auth/login", json={
            "email": refresh_test_user.email,
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        original_access_token = login_data["access_token"]
        refresh_token = login_data["refresh_token"]
        
        # Wait 1.1 seconds to ensure different timestamp for new token
        time.sleep(1.1)
        
        # Use refresh token to get new tokens
        refresh_response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response.status_code == 200
        
        refresh_data = refresh_response.json()
        assert "access_token" in refresh_data
        assert "refresh_token" in refresh_data
        assert refresh_data["token_type"] == "bearer"
        
        # New tokens should be different
        assert refresh_data["access_token"] != original_access_token
        assert refresh_data["refresh_token"] != refresh_token

    def test_refresh_token_invalid(self, client):
        """Test refresh with invalid token"""
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_token"
        })
        assert response.status_code == 401

    def test_refresh_token_reuse_prevention(self, refresh_test_user, client):
        """Test that used refresh tokens cannot be reused"""
        # Login first
        login_response = client.post("/api/v1/auth/login", json={
            "email": refresh_test_user.email,
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        refresh_token = login_data["refresh_token"]
        
        # Use refresh token once
        refresh_response1 = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response1.status_code == 200
        
        # Try to use the same refresh token again
        refresh_response2 = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response2.status_code == 401

    def test_refresh_token_revoked(self, refresh_test_user, client):
        """Test that revoked refresh tokens are rejected"""
        # Login first
        login_response = client.post("/api/v1/auth/login", json={
            "email": refresh_test_user.email,
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        refresh_token = login_data["refresh_token"]
        
        # Logout (revoke refresh token)
        logout_response = client.post("/api/v1/auth/logout", 
            json={"refresh_token": refresh_token}
        )
        assert logout_response.status_code == 200
        
        # Try to use revoked refresh token
        refresh_response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response.status_code == 401

    def test_refresh_token_expired(self, refresh_test_user, client, db_session):
        """Test that expired refresh tokens are rejected"""
        # Login first
        login_response = client.post("/api/v1/auth/login", json={
            "email": refresh_test_user.email,
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        refresh_token = login_data["refresh_token"]
        
        # Manually expire the refresh token in database
        db_session.execute(
            update(RefreshToken)
            .where(RefreshToken.token == refresh_token)
            .values(expires_at=datetime.utcnow() - timedelta(days=1))
        )
        db_session.commit()
        
        # Try to use expired refresh token
        refresh_response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response.status_code == 401

    def test_logout_revokes_refresh_token(self, refresh_test_user, client, db_session):
        """Test that logout properly revokes refresh token"""
        # Login first
        login_response = client.post("/api/v1/auth/login", json={
            "email": refresh_test_user.email,
            "password": "testpassword"
        })
        assert login_response.status_code == 200
        
        login_data = login_response.json()
        refresh_token = login_data["refresh_token"]
        
        # Logout
        logout_response = client.post("/api/v1/auth/logout", 
            json={"refresh_token": refresh_token}
        )
        assert logout_response.status_code == 200
        
        # Verify refresh token is revoked in database
        token_record = db_session.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()
        assert token_record is not None
        assert token_record.is_revoked is True