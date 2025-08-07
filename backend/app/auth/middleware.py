"""
Authentication middleware for JWT token validation and user context injection
"""
from typing import Optional
from functools import wraps

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.auth_service import verify_token, get_user_by_email
from app.models.user import User

# Security scheme for Bearer token
security = HTTPBearer()


class AuthenticationError(HTTPException):
    """Custom exception for authentication errors"""
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token
    
    Args:
        credentials: Bearer token from request header
        db: Database session
        
    Returns:
        User: The authenticated user object
        
    Raises:
        AuthenticationError: If token is invalid or user not found
    """
    token = credentials.credentials
    
    # Verify JWT token
    token_data = verify_token(token)
    if token_data is None:
        raise AuthenticationError("Invalid or expired token")
    
    # Get user from database
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise AuthenticationError("User not found")
    
    # Check if user is active
    if not user.is_active:
        raise AuthenticationError("Account is deactivated")
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get current active user
    
    Args:
        current_user: User from get_current_user dependency
        
    Returns:
        User: The active user object
        
    Raises:
        AuthenticationError: If user is inactive
    """
    if not current_user.is_active:
        raise AuthenticationError("Account is deactivated")
    return current_user


def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to get current user if token is provided (optional authentication)
    
    Args:
        request: FastAPI request object to check for authorization header
        db: Database session
        
    Returns:
        Optional[User]: The authenticated user object or None if no token provided
    """
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        # Verify JWT token
        token_data = verify_token(token)
        if token_data is None:
            return None
        
        # Get user from database
        user = get_user_by_email(db, email=token_data.email)
        if user is None or not user.is_active:
            return None
        
        return user
    except (ValueError, AttributeError, AuthenticationError):
        return None


def require_auth(func):
    """
    Decorator to require authentication for a route handler
    
    Usage:
        @require_auth
        async def protected_endpoint(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.id}
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper


def require_active_user(func):
    """
    Decorator to require an active user for a route handler
    
    Usage:
        @require_active_user
        async def protected_endpoint(current_user: User = Depends(get_current_active_user)):
            return {"user_id": current_user.id}
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper