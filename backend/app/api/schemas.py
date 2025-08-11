"""
Pydantic schemas for user authentication and file management
"""
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List
import re


class UserCreate(BaseModel):
    """Schema for user registration request"""
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (excluding sensitive data)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str


class TokenData(BaseModel):
    """Schema for token payload data"""
    user_id: Optional[int] = None
    email: Optional[str] = None


class DocumentResponse(BaseModel):
    """Schema for document response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    type: str
    original_filename: str
    file_size: int
    mime_type: str
    processing_status: str
    ocr_confidence: Optional[float] = None
    processed_at: Optional[datetime] = None
    uploaded_at: datetime


class DocumentListResponse(BaseModel):
    """Schema for document list response"""
    documents: List[DocumentResponse]
    total: int
