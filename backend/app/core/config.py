"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./expense_tracker.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File Storage
    upload_path: str = "app_data/uploads"
    documents_path: str = "app_data/documents"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # OCR
    tesseract_cmd: Optional[str] = None  # Will use system default if None
    ocr_confidence_threshold: float = 0.8
    
    # CORS
    allowed_origins: list = ["http://localhost:3000"]
    
    # Development
    debug: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()