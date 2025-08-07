"""
Authentication service for password hashing and JWT token management
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.api.schemas import TokenData

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate password hash from plain password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    """
    Verify JWT token and return token data
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if user_id is None:
            return None
            
        token_data = TokenData(user_id=int(user_id), email=email)
        return token_data
    except (JWTError, ValueError, TypeError):
        return None


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get user by email address
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, password: str) -> User:
    """
    Create new user with hashed password
    """
    hashed_password = get_password_hash(password)
    db_user = User(
        email=email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate user with email and password
    """
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def create_refresh_token(db: Session, user_id: int) -> str:
    """
    Create and store a new refresh token for the user
    """
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    
    # Store in database
    db_refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()
    
    return token


def verify_refresh_token(db: Session, token: str) -> Optional[User]:
    """
    Verify refresh token and return the associated user
    """
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.is_revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not db_token:
        return None
        
    return db_token.user


def revoke_refresh_token(db: Session, token: str) -> bool:
    """
    Revoke a refresh token
    """
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if not db_token:
        return False
        
    db_token.is_revoked = True
    db.commit()
    return True


def revoke_all_user_tokens(db: Session, user_id: int) -> None:
    """
    Revoke all refresh tokens for a user
    """
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()


def cleanup_expired_tokens(db: Session) -> None:
    """
    Remove expired refresh tokens from database
    """
    db.query(RefreshToken).filter(
        RefreshToken.expires_at < datetime.utcnow()
    ).delete()
    db.commit()
