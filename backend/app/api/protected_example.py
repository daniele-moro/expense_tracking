"""
Example API endpoints demonstrating authentication middleware usage
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.auth.middleware import get_current_user, get_current_active_user, get_optional_current_user
from app.models.user import User
from app.api.schemas import UserResponse

router = APIRouter(prefix="/protected", tags=["protected-examples"])


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's profile information
    
    Requires valid JWT token in Authorization header
    """
    return current_user


@router.get("/active-only")
async def active_users_only(
    current_user: User = Depends(get_current_active_user)
):
    """
    Endpoint that requires an active user
    
    Will return 401 if user is deactivated
    """
    return {
        "message": "Welcome to the active users area",
        "user_id": current_user.id,
        "email": current_user.email
    }


@router.get("/optional-auth")
async def optional_authentication(
    current_user: User = Depends(get_optional_current_user)
):
    """
    Endpoint with optional authentication
    
    Returns different content based on authentication status
    """
    if current_user:
        return {
            "message": "Welcome back",
            "user_id": current_user.id,
            "email": current_user.email,
            "authenticated": True
        }
    else:
        return {
            "message": "Welcome, anonymous user",
            "authenticated": False
        }


@router.post("/admin-action")
async def admin_action(
    current_user: User = Depends(get_current_active_user)
):
    """
    Example admin action requiring active authentication
    
    In a real application, you might add additional role-based checks here
    """
    # Example: Check if user has admin role (not implemented in current model)
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "message": "Admin action completed",
        "performed_by": current_user.email
    }