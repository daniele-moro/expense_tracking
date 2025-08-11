"""
Tests for file API endpoints
"""
import tempfile
from pathlib import Path
from unittest.mock import Mock, patch
from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from main import app
from app.models.document import Document
from app.models.user import User
from app.services.auth_service import create_access_token
from tests.conftest import create_test_document


class TestFileAPI:
    """Test cases for file API endpoints"""
    
    def create_test_image_file(self) -> BytesIO:
        """Create a test image file"""
        img = Image.new('RGB', (100, 100), (255, 0, 0))  # Red color as RGB tuple
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        return buffer

    def get_auth_headers(self, user: User) -> dict:
        """Get authentication headers for a user"""
        token = create_access_token(data={"sub": str(user.id), "email": user.email})
        return {"Authorization": f"Bearer {token}"}

    @patch('app.services.file_service.file_service.upload_document')
    def test_upload_document_success(self, mock_upload, client, test_user):
        """Test successful document upload"""
        # Setup mock
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_document.user_id = test_user.id
        mock_document.type = "receipt"
        mock_document.original_filename = "test.jpg"
        mock_document.file_size = 1000
        mock_document.mime_type = "image/jpeg"
        mock_document.processing_status = "pending"
        mock_document.ocr_confidence = None
        mock_document.processed_at = None
        mock_document.uploaded_at = "2023-01-01T00:00:00"
        
        mock_upload.return_value = mock_document
        
        # Create test file
        test_file = self.create_test_image_file()
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.post(
            "/api/v1/files/upload",
            headers=auth_headers,
            files={"file": ("test.jpg", test_file, "image/jpeg")},
            data={"document_type": "receipt"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["type"] == "receipt"
        assert data["original_filename"] == "test.jpg"
        
        mock_upload.assert_called_once()

    def test_upload_document_unauthenticated(self, client):
        """Test document upload without authentication"""
        test_file = self.create_test_image_file()
        
        response = client.post(
            "/api/v1/files/upload",
            files={"file": ("test.jpg", test_file, "image/jpeg")},
            data={"document_type": "receipt"}
        )
        
        assert response.status_code == 403

    def test_upload_document_invalid_type(self, client, test_user):
        """Test document upload with invalid document type"""
        test_file = self.create_test_image_file()
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.post(
            "/api/v1/files/upload",
            headers=auth_headers,
            files={"file": ("test.jpg", test_file, "image/jpeg")},
            data={"document_type": "invalid_type"}
        )
        
        assert response.status_code == 400
        assert "Document type must be" in response.json()["detail"]

    def test_upload_document_missing_file(self, client, test_user):
        """Test document upload without file"""
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.post(
            "/api/v1/files/upload",
            headers=auth_headers,
            data={"document_type": "receipt"}
        )
        
        assert response.status_code == 422  # Validation error

    def test_upload_document_missing_document_type(self, client, test_user):
        """Test document upload without document type"""
        test_file = self.create_test_image_file()
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.post(
            "/api/v1/files/upload",
            headers=auth_headers,
            files={"file": ("test.jpg", test_file, "image/jpeg")}
        )
        
        assert response.status_code == 422  # Validation error

    @patch('app.services.file_service.file_service.get_user_documents')
    def test_list_documents(self, mock_get_docs, client, test_user):
        """Test listing user documents"""
        # Setup mock documents
        mock_doc1 = Mock(spec=Document)
        mock_doc1.id = 1
        mock_doc1.user_id = test_user.id
        mock_doc1.type = "receipt"
        mock_doc1.original_filename = "receipt1.jpg"
        mock_doc1.file_size = 1000
        mock_doc1.mime_type = "image/jpeg"
        mock_doc1.processing_status = "completed"
        mock_doc1.ocr_confidence = 0.95
        mock_doc1.processed_at = "2023-01-01T00:00:00"
        mock_doc1.uploaded_at = "2023-01-01T00:00:00"
        
        mock_doc2 = Mock(spec=Document)
        mock_doc2.id = 2
        mock_doc2.user_id = test_user.id
        mock_doc2.type = "payslip"
        mock_doc2.original_filename = "payslip1.pdf"
        mock_doc2.file_size = 2000
        mock_doc2.mime_type = "application/pdf"
        mock_doc2.processing_status = "pending"
        mock_doc2.ocr_confidence = None
        mock_doc2.processed_at = None
        mock_doc2.uploaded_at = "2023-01-02T00:00:00"
        
        mock_get_docs.return_value = [mock_doc1, mock_doc2]
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["documents"]) == 2
        
        # Check first document
        doc1 = data["documents"][0]
        assert doc1["id"] == 1
        assert doc1["type"] == "receipt"
        assert doc1["processing_status"] == "completed"
        
        # Check second document
        doc2 = data["documents"][1]
        assert doc2["id"] == 2
        assert doc2["type"] == "payslip"
        assert doc2["processing_status"] == "pending"

    @patch('app.services.file_service.file_service.get_user_documents')
    def test_list_documents_with_filter(self, mock_get_docs, client, test_user):
        """Test listing user documents with type filter"""
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_document.user_id = test_user.id
        mock_document.type = "receipt"
        mock_document.original_filename = "receipt.jpg"
        mock_document.file_size = 1000
        mock_document.mime_type = "image/jpeg"
        mock_document.processing_status = "completed"
        mock_document.ocr_confidence = 0.95
        mock_document.processed_at = "2023-01-01T00:00:00"
        mock_document.uploaded_at = "2023-01-01T00:00:00"
        
        mock_get_docs.return_value = [mock_document]
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get(
            "/api/v1/files/?document_type=receipt",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["documents"][0]["type"] == "receipt"
        
        mock_get_docs.assert_called_once()
        # Verify the call arguments (ignoring the db_session parameter)
        call_args = mock_get_docs.call_args
        assert call_args.kwargs['user_id'] == test_user.id
        assert call_args.kwargs['document_type'] == "receipt"

    def test_list_documents_unauthenticated(self, client):
        """Test listing documents without authentication"""
        response = client.get("/api/v1/files/")
        assert response.status_code == 403

    @patch('app.services.file_service.file_service.get_document')
    def test_get_document(self, mock_get_doc, client, test_user):
        """Test getting specific document"""
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_document.user_id = test_user.id
        mock_document.type = "receipt"
        mock_document.original_filename = "receipt.jpg"
        mock_document.file_size = 1000
        mock_document.mime_type = "image/jpeg"
        mock_document.processing_status = "completed"
        mock_document.ocr_confidence = 0.95
        mock_document.processed_at = "2023-01-01T00:00:00"
        mock_document.uploaded_at = "2023-01-01T00:00:00"
        
        mock_get_doc.return_value = mock_document
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/1", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["type"] == "receipt"
        assert data["processing_status"] == "completed"
        
        mock_get_doc.assert_called_once()
        # Verify the call arguments (ignoring the db_session parameter)
        call_args = mock_get_doc.call_args
        assert call_args.args[:2] == (1, test_user.id)

    @patch('app.services.file_service.file_service.get_document')
    def test_get_document_not_found(self, mock_get_doc, client, test_user):
        """Test getting non-existent document"""
        mock_get_doc.return_value = None
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Document not found" in response.json()["detail"]

    def test_get_document_unauthenticated(self, client):
        """Test getting document without authentication"""
        response = client.get("/api/v1/files/1")
        assert response.status_code == 403

    @patch('app.services.file_service.file_service.get_document')
    def test_download_document(self, mock_get_doc, client, test_user):
        """Test downloading document"""
        # Create test file
        temp_dir = tempfile.mkdtemp()
        test_file = Path(temp_dir) / "test_download.jpg"
        test_content = b"test image content"
        test_file.write_bytes(test_content)
        
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_document.user_id = test_user.id
        mock_document.file_path = str(test_file)
        mock_document.original_filename = "receipt.jpg"
        mock_document.mime_type = "image/jpeg"
        
        mock_get_doc.return_value = mock_document
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/1/download", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.content == test_content
        assert response.headers["content-type"] == "image/jpeg"
        
        # Cleanup
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)

    @patch('app.services.file_service.file_service.get_document')
    def test_download_document_not_found(self, mock_get_doc, client, test_user):
        """Test downloading non-existent document"""
        mock_get_doc.return_value = None
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/1/download", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Document not found" in response.json()["detail"]

    @patch('app.services.file_service.file_service.get_document')
    def test_download_document_file_missing(self, mock_get_doc, client, test_user):
        """Test downloading document when file doesn't exist"""
        mock_document = Mock(spec=Document)
        mock_document.id = 1
        mock_document.user_id = test_user.id
        mock_document.file_path = "/nonexistent/file.jpg"
        mock_document.original_filename = "receipt.jpg"
        mock_document.mime_type = "image/jpeg"
        
        mock_get_doc.return_value = mock_document
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.get("/api/v1/files/1/download", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Document file not found" in response.json()["detail"]

    def test_download_document_unauthenticated(self, client):
        """Test downloading document without authentication"""
        response = client.get("/api/v1/files/1/download")
        assert response.status_code == 403

    @patch('app.services.file_service.file_service.delete_document')
    def test_delete_document(self, mock_delete, client, test_user):
        """Test deleting document"""
        mock_delete.return_value = True
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.delete("/api/v1/files/1", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Document deleted successfully"
        
        mock_delete.assert_called_once()
        # Verify the call arguments (ignoring the db_session parameter)
        call_args = mock_delete.call_args
        assert call_args.args[:2] == (1, test_user.id)

    @patch('app.services.file_service.file_service.delete_document')
    def test_delete_document_not_found(self, mock_delete, client, test_user):
        """Test deleting non-existent document"""
        mock_delete.return_value = False
        auth_headers = self.get_auth_headers(test_user)
        
        response = client.delete("/api/v1/files/999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Document not found" in response.json()["detail"]

    def test_delete_document_unauthenticated(self, client):
        """Test deleting document without authentication"""
        response = client.delete("/api/v1/files/1")
        assert response.status_code == 403
