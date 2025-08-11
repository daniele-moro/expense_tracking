"""
Tests for file service functionality
"""
import os
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO

import pytest
from fastapi import UploadFile, HTTPException
from PIL import Image

from app.services.file_service import FileService
from app.models.document import Document


class TestFileService:
    """Test cases for FileService"""
    
    def setup_method(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.file_service = FileService()
        # Override paths for testing
        self.file_service.upload_path = Path(self.temp_dir) / "uploads"
        self.file_service.documents_path = Path(self.temp_dir) / "documents"
        self.file_service.upload_path.mkdir(parents=True, exist_ok=True)
        self.file_service.documents_path.mkdir(parents=True, exist_ok=True)
    
    def teardown_method(self):
        """Clean up test environment"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def create_mock_upload_file(self, filename: str, content: bytes, size: int = None) -> UploadFile:
        """Create a mock UploadFile for testing"""
        mock_file = Mock()
        mock_file.read.return_value = content
        mock_file.filename = filename
        mock_file.size = size or len(content)
        mock_file.file = BytesIO(content)
        return mock_file
    
    def create_test_image(self, format: str = "JPEG") -> bytes:
        """Create a test image in memory"""
        img = Image.new('RGB', (100, 100), color=(255, 0, 0))  # Red color as RGB tuple
        buffer = BytesIO()
        img.save(buffer, format=format)
        return buffer.getvalue()
    
    def test_validate_file_valid_image(self):
        """Test file validation with valid image"""
        content = self.create_test_image()
        upload_file = self.create_mock_upload_file("test.jpg", content)
        
        # Should not raise exception
        self.file_service.validate_file(upload_file)
    
    def test_validate_file_invalid_extension(self):
        """Test file validation with invalid extension"""
        upload_file = self.create_mock_upload_file("test.txt", b"test content")
        
        with pytest.raises(HTTPException) as exc:
            self.file_service.validate_file(upload_file)
        
        assert exc.value.status_code == 400
        assert "File type not allowed" in exc.value.detail
    
    def test_validate_file_too_large(self):
        """Test file validation with file too large"""
        # Create file larger than max size
        large_content = b"x" * (self.file_service.max_file_size + 1)
        upload_file = self.create_mock_upload_file("test.jpg", large_content)
        
        with pytest.raises(HTTPException) as exc:
            self.file_service.validate_file(upload_file)
        
        assert exc.value.status_code == 413
        assert "File too large" in exc.value.detail
    
    def test_generate_file_path(self):
        """Test file path generation"""
        user_id = 123
        filename = "receipt.jpg"
        doc_type = "receipt"
        
        file_path = self.file_service.generate_file_path(user_id, filename, doc_type)
        
        assert file_path.parent.name == doc_type
        assert file_path.parent.parent.name == f"user_{user_id}"
        assert file_path.suffix == ".jpg"
        assert file_path.name != filename  # Should be unique
    
    def test_save_upload_file(self):
        """Test saving upload file"""
        content = b"test content"
        upload_file = self.create_mock_upload_file("test.jpg", content)
        destination = Path(self.temp_dir) / "test_save.jpg"
        
        self.file_service.save_upload_file(upload_file, destination)
        
        assert destination.exists()
        assert destination.read_bytes() == content
    
    @patch('magic.from_file')
    def test_validate_file_content_valid(self, mock_magic):
        """Test file content validation with valid MIME type"""
        mock_magic.return_value = "image/jpeg"
        test_file = Path(self.temp_dir) / "test.jpg"
        test_file.write_bytes(self.create_test_image())
        
        mime_type = self.file_service.validate_file_content(test_file)
        
        assert mime_type == "image/jpeg"
    
    @patch('magic.from_file')
    def test_validate_file_content_invalid(self, mock_magic):
        """Test file content validation with invalid MIME type"""
        mock_magic.return_value = "text/plain"
        test_file = Path(self.temp_dir) / "test.jpg"
        test_file.write_bytes(b"not an image")
        
        with pytest.raises(HTTPException) as exc:
            self.file_service.validate_file_content(test_file)
        
        assert exc.value.status_code == 400
        # Check for the actual error message from the code
        assert "Invalid file content. Detected type: text/plain" in exc.value.detail
    
    def test_optimize_image(self):
        """Test image optimization"""
        # Create a large test image
        large_img = Image.new('RGB', (3000, 3000), color=(0, 0, 255))  # Blue color as RGB tuple
        test_file = Path(self.temp_dir) / "large_image.jpg"
        large_img.save(test_file, 'JPEG')
        
        original_size = test_file.stat().st_size
        
        self.file_service.optimize_image(test_file)
        
        # Image should be optimized (smaller)
        optimized_size = test_file.stat().st_size
        assert optimized_size < original_size
        
        # Check that image was resized
        with Image.open(test_file) as img:
            assert max(img.size) <= 2000
    
    def test_optimize_image_non_image(self):
        """Test image optimization with non-image file"""
        test_file = Path(self.temp_dir) / "test.pdf"
        test_file.write_bytes(b"fake pdf content")
        
        # Should not raise exception, just skip optimization
        self.file_service.optimize_image(test_file)
    
    @patch('app.services.file_service.get_db')
    @patch('magic.from_file')
    @pytest.mark.asyncio
    async def test_upload_document_success(self, mock_magic, mock_get_db):
        """Test successful document upload"""
        # Setup mocks
        mock_magic.return_value = "image/jpeg"
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        # Mock database operations
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()
        
        # Create test file
        content = self.create_test_image()
        upload_file = self.create_mock_upload_file("receipt.jpg", content)
        
        with patch.object(self.file_service, 'validate_file'), \
             patch.object(self.file_service, 'save_upload_file'), \
             patch('app.services.file_service.Document', return_value=mock_document):
            
            result = await self.file_service.upload_document(
                file=upload_file,
                user_id=123,
                document_type="receipt"
            )
            
            assert result == mock_document
            mock_db.add.assert_called_once()
            mock_db.commit.assert_called_once()
    
    @patch('app.services.file_service.get_db')
    @pytest.mark.asyncio
    async def test_upload_document_validation_failure(self, mock_get_db):
        """Test document upload with validation failure"""
        mock_db = Mock()
        mock_get_db.return_value = mock_db
        
        # Create invalid file
        upload_file = self.create_mock_upload_file("test.txt", b"content")
        
        with pytest.raises(HTTPException):
            await self.file_service.upload_document(
                file=upload_file,
                user_id=123,
                document_type="receipt"
            )
    
    @patch('app.services.file_service.get_db')
    def test_get_user_documents(self, mock_get_db):
        """Test getting user documents"""
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_documents = [Mock(spec=Document), Mock(spec=Document)]
        mock_query.all.return_value = mock_documents
        
        result = self.file_service.get_user_documents(user_id=123)
        
        assert result == mock_documents
        mock_db.query.assert_called_once()
    
    @patch('app.services.file_service.get_db')
    def test_get_user_documents_with_type_filter(self, mock_get_db):
        """Test getting user documents with type filter"""
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.order_by.return_value = mock_query
        mock_documents = [Mock(spec=Document)]
        mock_query.all.return_value = mock_documents
        
        result = self.file_service.get_user_documents(
            user_id=123, 
            document_type="receipt"
        )
        
        assert result == mock_documents
        # Should have two filter calls: one for user_id, one for document_type
        assert mock_query.filter.call_count == 2
    
    @patch('app.services.file_service.get_db')
    def test_get_document(self, mock_get_db):
        """Test getting specific document"""
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_document = Mock(spec=Document)
        mock_query.first.return_value = mock_document
        
        result = self.file_service.get_document(document_id=1, user_id=123)
        
        assert result == mock_document
    
    @patch('app.services.file_service.get_db')
    def test_delete_document_success(self, mock_get_db):
        """Test successful document deletion"""
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        # Create test file
        test_file = Path(self.temp_dir) / "test_delete.jpg"
        test_file.write_bytes(b"test content")
        
        mock_document = Mock(spec=Document)
        mock_document.file_path = str(test_file)
        
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = mock_document
        
        result = self.file_service.delete_document(document_id=1, user_id=123)
        
        assert result is True
        assert not test_file.exists()
        mock_db.delete.assert_called_once_with(mock_document)
        mock_db.commit.assert_called_once()
    
    @patch('app.services.file_service.get_db')
    def test_delete_document_not_found(self, mock_get_db):
        """Test document deletion when document not found"""
        mock_db = Mock()
        mock_get_db.return_value = iter([mock_db])  # Make it iterable
        mock_db.__enter__ = Mock(return_value=mock_db)
        mock_db.__exit__ = Mock(return_value=None)
        
        mock_query = Mock()
        mock_db.query.return_value = mock_query
        mock_query.filter.return_value = mock_query
        mock_query.first.return_value = None  # Document not found
        
        result = self.file_service.delete_document(document_id=1, user_id=123)
        
        assert result is False
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()