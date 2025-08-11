"""
Application configuration settings
"""
import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings

# Get the backend directory path
BACKEND_DIR = Path(__file__).parent.parent.parent  # Go up from app/core/config.py to backend/


class Settings(BaseSettings):
    # Database
    database_url: str = f"sqlite:///{BACKEND_DIR}/expense_tracker.db"

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # File Storage
    upload_path: str = str(BACKEND_DIR / "app_data" / "uploads")
    documents_path: str = str(BACKEND_DIR / "app_data" / "documents")
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
