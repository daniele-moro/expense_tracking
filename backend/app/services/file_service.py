"""
File management service for handling document uploads and storage
"""
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException
from PIL import Image
try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

from app.core.config import settings
from app.database.database import get_db
from app.models.document import Document


class FileService:
    """Service for handling file uploads, validation, and storage"""
    
    # Allowed file types and extensions
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf'}
    ALLOWED_MIME_TYPES = {
        'image/jpeg', 'image/jpg', 'image/png', 'application/pdf'
    }
    
    def __init__(self):
        self.upload_path = Path(settings.upload_path)
        self.documents_path = Path(settings.documents_path)
        self.max_file_size = settings.max_file_size
        
        # Create directories if they don't exist
        self.upload_path.mkdir(parents=True, exist_ok=True)
        self.documents_path.mkdir(parents=True, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> None:
        """
        Validate uploaded file for type, size, and content
        
        Args:
            file: The uploaded file to validate
            
        Raises:
            HTTPException: If validation fails
        """
        # Check file extension
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Supported types: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
        
        # Check file size
        if file.size and file.size > self.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {self.max_file_size / (1024*1024):.1f}MB"
            )
    
    def validate_file_content(self, file_path: Path) -> str:
        """
        Validate file content using python-magic
        
        Args:
            file_path: Path to the uploaded file
            
        Returns:
            str: The detected MIME type
            
        Raises:
            HTTPException: If content validation fails
        """
        try:
            mime_type = magic.from_file(str(file_path), mime=True)
            
            if mime_type not in self.ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file content. Detected type: {mime_type}"
                )
            
            return mime_type
        except HTTPException:
            # Re-raise HTTPException without wrapping
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Could not validate file content: {str(e)}"
            )
    
    def generate_file_path(self, user_id: int, original_filename: str, document_type: str) -> Path:
        """
        Generate organized file path for user documents
        
        Args:
            user_id: ID of the user uploading the file
            original_filename: Original name of the uploaded file
            document_type: Type of document (receipt, payslip)
            
        Returns:
            Path: Generated file path for storage
        """
        file_extension = Path(original_filename).suffix.lower()
        unique_filename = f"{uuid.uuid4().hex}{file_extension}"
        
        # Organize by user and document type
        user_dir = self.documents_path / f"user_{user_id}" / document_type
        user_dir.mkdir(parents=True, exist_ok=True)
        
        return user_dir / unique_filename
    
    def save_upload_file(self, upload_file: UploadFile, destination: Path) -> None:
        """
        Save uploaded file to destination path
        
        Args:
            upload_file: The uploaded file object
            destination: Path where file should be saved
        """
        try:
            with destination.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Could not save file: {str(e)}"
            )
    
    def optimize_image(self, file_path: Path) -> None:
        """
        Optimize image for better OCR processing
        
        Args:
            file_path: Path to the image file to optimize
        """
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            try:
                with Image.open(file_path) as img:
                    # Convert to RGB if necessary
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Resize if too large (max 2000px on longest side)
                    max_size = 2000
                    if max(img.size) > max_size:
                        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                        img.save(file_path, 'JPEG', quality=85, optimize=True)
            except Exception as e:
                # Log the error but don't fail the upload
                print(f"Could not optimize image {file_path}: {str(e)}")
    
    async def upload_document(
        self, 
        file: UploadFile, 
        user_id: int, 
        document_type: str,
        db_session = None
    ) -> Document:
        """
        Handle complete document upload process
        
        Args:
            file: The uploaded file
            user_id: ID of the user uploading
            document_type: Type of document (receipt, payslip)
            
        Returns:
            Document: Created document record
        """
        # Validate file
        self.validate_file(file)
        
        # Generate file path
        file_path = self.generate_file_path(user_id, file.filename, document_type)
        
        # Save file
        self.save_upload_file(file, file_path)
        
        # Validate file content
        mime_type = self.validate_file_content(file_path)
        
        # Optimize image if applicable
        if mime_type.startswith('image/'):
            self.optimize_image(file_path)
        
        # Create document record in database
        db = db_session or next(get_db())
        try:
            # Use file size from upload file if available, otherwise stat the file
            file_size = file.size if file.size else file_path.stat().st_size
            
            document = Document(
                user_id=user_id,
                type=document_type,
                file_path=str(file_path),
                original_filename=file.filename,
                file_size=file_size,
                mime_type=mime_type,
                processing_status='pending'
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            return document
            
        except Exception as e:
            db.rollback()
            # Clean up file if database operation failed
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Could not save document record: {str(e)}"
            )
        finally:
            if not db_session:  # Only close if we created the session
                db.close()
    
    def get_user_documents(self, user_id: int, document_type: Optional[str] = None, db_session = None) -> List[Document]:
        """
        Get all documents for a user
        
        Args:
            user_id: ID of the user
            document_type: Optional filter by document type
            
        Returns:
            List[Document]: List of user's documents
        """
        db = db_session or next(get_db())
        try:
            query = db.query(Document).filter(Document.user_id == user_id)
            
            if document_type:
                query = query.filter(Document.type == document_type)
            
            return query.order_by(Document.uploaded_at.desc()).all()
        finally:
            if not db_session:  # Only close if we created the session
                db.close()
    
    def get_document(self, document_id: int, user_id: int, db_session = None) -> Optional[Document]:
        """
        Get a specific document for a user
        
        Args:
            document_id: ID of the document
            user_id: ID of the user (for authorization)
            
        Returns:
            Document or None: The requested document if found and authorized
        """
        db = db_session or next(get_db())
        try:
            return db.query(Document).filter(
                Document.id == document_id,
                Document.user_id == user_id
            ).first()
        finally:
            if not db_session:  # Only close if we created the session
                db.close()
    
    def delete_document(self, document_id: int, user_id: int, db_session = None) -> bool:
        """
        Delete a document and its file
        
        Args:
            document_id: ID of the document to delete
            user_id: ID of the user (for authorization)
            
        Returns:
            bool: True if deleted successfully
        """
        db = db_session or next(get_db())
        try:
            document = db.query(Document).filter(
                Document.id == document_id,
                Document.user_id == user_id
            ).first()
            
            if not document:
                return False
            
            # Delete file from filesystem
            file_path = Path(document.file_path)
            if file_path.exists():
                file_path.unlink()
            
            # Delete database record
            db.delete(document)
            db.commit()
            
            return True
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Could not delete document: {str(e)}"
            )
        finally:
            if not db_session:  # Only close if we created the session
                db.close()


# Global file service instance
file_service = FileService()