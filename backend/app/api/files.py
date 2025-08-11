"""
File upload and management API endpoints
"""
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.document import Document
from app.auth.middleware import get_current_user
from app.database.database import get_db
from app.services.file_service import file_service
from app.api.schemas import DocumentResponse, DocumentListResponse


router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document (receipt or payslip) for processing
    
    Args:
        file: The uploaded file (JPG, PNG, PDF)
        document_type: Type of document ('receipt' or 'payslip')
        current_user: Authenticated user
        
    Returns:
        DocumentResponse: Created document information
    """
    # Validate document type
    if document_type not in ['receipt', 'payslip']:
        raise HTTPException(
            status_code=400,
            detail="Document type must be 'receipt' or 'payslip'"
        )
    
    # Handle file upload
    document = await file_service.upload_document(
        file=file,
        user_id=current_user.id,
        document_type=document_type,
        db_session=db
    )
    
    return DocumentResponse.model_validate(document)


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    document_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents for the current user
    
    Args:
        document_type: Optional filter by document type
        current_user: Authenticated user
        
    Returns:
        DocumentListResponse: List of user's documents
    """
    documents = file_service.get_user_documents(
        user_id=current_user.id,
        document_type=document_type,
        db_session=db
    )
    
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(doc) for doc in documents],
        total=len(documents)
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific document by ID
    
    Args:
        document_id: ID of the document
        current_user: Authenticated user
        
    Returns:
        DocumentResponse: Document information
    """
    document = file_service.get_document(document_id, current_user.id, db)
    
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    return DocumentResponse.model_validate(document)


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download a document file
    
    Args:
        document_id: ID of the document
        current_user: Authenticated user
        
    Returns:
        FileResponse: The document file
    """
    document = file_service.get_document(document_id, current_user.id, db)
    
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Document file not found"
        )
    
    return FileResponse(
        path=str(file_path),
        filename=document.original_filename,
        media_type=document.mime_type
    )


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document and its file
    
    Args:
        document_id: ID of the document
        current_user: Authenticated user
        
    Returns:
        dict: Success message
    """
    success = file_service.delete_document(document_id, current_user.id, db)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    return {"message": "Document deleted successfully"}