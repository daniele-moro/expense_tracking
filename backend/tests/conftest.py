"""
Pytest configuration and fixtures for testing
"""
import pytest
import uuid
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base, get_db
from main import app

# Get the backend directory path for absolute test database path
BACKEND_DIR = Path(__file__).parent.parent  # Go up from tests/ to backend/

# Test database URL (absolute path to avoid working directory issues)
SQLALCHEMY_TEST_DATABASE_URL = f"sqlite:///{BACKEND_DIR}/test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create test database tables and provide session - uses same DB as main test database"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create a unique test database for each test"""
    # Create unique test database for each test to avoid locking issues
    test_db_name = f"test_{uuid.uuid4().hex[:8]}.db"
    test_db_path = BACKEND_DIR / test_db_name
    test_db_url = f"sqlite:///{test_db_path}"
    
    # Create unique engine and session for this test
    test_engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    yield {
        'engine': test_engine,
        'session_factory': TestingSessionLocal,
        'db_path': test_db_path
    }
    
    # Clean up: remove test database file
    if test_db_path.exists():
        test_db_path.unlink()


@pytest.fixture(scope="function")
def db_session(test_db):
    """Create test database session using the same database as client"""
    db = test_db['session_factory']()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(test_db):
    """Create test client with overridden database"""
    def override_get_db_for_test():
        """Override database dependency for this specific test"""
        try:
            db = test_db['session_factory']()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db_for_test
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function") 
def test_user(db_session):
    """Create a test user for authentication tests"""
    from app.services.auth_service import create_user
    
    user = create_user(
        db=db_session,
        email="test@example.com", 
        password="TestPass123"
    )
    return user


def create_test_user():
    """Create a test user with authentication token for API tests"""
    from app.models.user import User
    from app.services.auth_service import create_access_token
    from unittest.mock import Mock
    
    # Create mock user
    mock_user = Mock(spec=User)
    mock_user.id = 1
    mock_user.email = "test@example.com"
    mock_user.is_active = True
    
    # Create token
    token = create_access_token(data={"user_id": mock_user.id, "email": mock_user.email})
    
    return {
        "user": mock_user,
        "token": token
    }


def create_test_document(user_id: int = 1, document_type: str = "receipt"):
    """Create a test document for testing"""
    from app.models.document import Document
    from unittest.mock import Mock
    from datetime import datetime
    
    mock_document = Mock(spec=Document)
    mock_document.id = 1
    mock_document.user_id = user_id
    mock_document.type = document_type
    mock_document.original_filename = f"test_{document_type}.jpg"
    mock_document.file_path = f"/test/path/{document_type}.jpg"
    mock_document.file_size = 1000
    mock_document.mime_type = "image/jpeg"
    mock_document.processing_status = "pending"
    mock_document.ocr_confidence = None
    mock_document.processed_at = None
    mock_document.uploaded_at = datetime.now()
    
    return mock_document
