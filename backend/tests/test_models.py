"""
Tests for database models
"""
from datetime import date

from app.models.document import Document
from app.models.expense import Expense
from app.models.income import Income  # Required for SQLAlchemy relationships
from app.models.user import User


def test_user_model_creation(db_session):
    """Test creating a user model instance"""
    user = User(
        email="test@example.com",
        password_hash="hashed_password",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.is_active is True
    assert user.created_at is not None


def test_expense_model_creation(db_session):
    """Test creating an expense model instance"""
    # Create user first
    user = User(email="test@example.com", password_hash="hashed")
    db_session.add(user)
    db_session.commit()

    expense = Expense(
        user_id=user.id,
        amount=25.50,
        merchant="Test Store",
        description="Test purchase",
        category="groceries",
        transaction_date=date.today()
    )
    db_session.add(expense)
    db_session.commit()

    assert expense.id is not None
    assert expense.amount == 25.50
    assert expense.merchant == "Test Store"
    assert expense.user_id == user.id


def test_document_model_creation(db_session):
    """Test creating a document model instance"""
    # Create user first
    user = User(email="test@example.com", password_hash="hashed")
    db_session.add(user)
    db_session.commit()

    document = Document(
        user_id=user.id,
        type="receipt",
        original_filename="receipt.pdf",
        file_path="/uploads/receipt.pdf",
        file_size=1024,
        mime_type="application/pdf",
        processing_status="pending"
    )
    db_session.add(document)
    db_session.commit()

    assert document.id is not None
    assert document.type == "receipt"
    assert document.processing_status == "pending"
    assert document.user_id == user.id
