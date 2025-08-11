/**
 * File upload service for handling document uploads and management
 * Interfaces with the backend file API endpoints
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Document {
  id: number;
  user_id: number;
  type: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  processing_status: string;
  ocr_confidence: number | null;
  processed_at: string | null;
  uploaded_at: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class FileService {
  /**
   * Upload a document file
   */
  static async uploadDocument(
    file: File,
    documentType: 'receipt' | 'payslip',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
            };
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Upload failed');
      }
      throw error;
    }
  }

  /**
   * Get all documents for the current user
   */
  static async getDocuments(documentType?: 'receipt' | 'payslip'): Promise<DocumentListResponse> {
    try {
      const params = documentType ? { document_type: documentType } : {};
      const response = await axios.get(`${API_BASE_URL}/api/v1/files/`, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to load documents');
      }
      throw error;
    }
  }

  /**
   * Get a specific document by ID
   */
  static async getDocument(documentId: number): Promise<Document> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/files/${documentId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to load document');
      }
      throw error;
    }
  }

  /**
   * Download a document file
   */
  static async downloadDocument(documentId: number, filename: string): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/files/${documentId}/download`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to download document');
      }
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/files/${documentId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Failed to delete document');
      }
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit',
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not supported. Please use JPG, PNG, or PDF files.',
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get document type from filename
   */
  static inferDocumentType(filename: string): 'receipt' | 'payslip' {
    const name = filename.toLowerCase();
    if (name.includes('payslip') || name.includes('salary') || name.includes('wage')) {
      return 'payslip';
    }
    return 'receipt'; // Default to receipt
  }
}

export default FileService;