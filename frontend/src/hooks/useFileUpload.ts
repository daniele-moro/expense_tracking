/**
 * Custom hook for handling file uploads with progress tracking and error handling
 */
import { useState, useCallback } from 'react';
import FileService, { Document, UploadProgress } from '../services/fileService';

export interface UploadingFile {
  id: string;
  file: File;
  documentType: 'receipt' | 'payslip';
  progress: UploadProgress;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  result?: Document;
}

export interface UseFileUploadReturn {
  uploadingFiles: UploadingFile[];
  uploadFile: (file: File, documentType: 'receipt' | 'payslip') => Promise<Document>;
  removeUploadingFile: (id: string) => void;
  clearCompleted: () => void;
  isUploading: boolean;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadFile = useCallback(async (
    file: File,
    documentType: 'receipt' | 'payslip'
  ): Promise<Document> => {
    // Validate file before upload
    const validation = FileService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create unique ID for this upload
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize upload tracking
    const uploadingFile: UploadingFile = {
      id: uploadId,
      file,
      documentType,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      status: 'uploading',
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      const result = await FileService.uploadDocument(
        file,
        documentType,
        (progress) => {
          setUploadingFiles(prev =>
            prev.map(item =>
              item.id === uploadId
                ? { ...item, progress }
                : item
            )
          );
        }
      );

      // Mark as completed
      setUploadingFiles(prev =>
        prev.map(item =>
          item.id === uploadId
            ? { ...item, status: 'completed', result }
            : item
        )
      );

      return result;
    } catch (error) {
      // Mark as error
      setUploadingFiles(prev =>
        prev.map(item =>
          item.id === uploadId
            ? {
                ...item,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : item
        )
      );
      throw error;
    }
  }, []);

  const removeUploadingFile = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadingFiles(prev => prev.filter(item => item.status !== 'completed'));
  }, []);

  const isUploading = uploadingFiles.some(file => file.status === 'uploading');

  return {
    uploadingFiles,
    uploadFile,
    removeUploadingFile,
    clearCompleted,
    isUploading,
  };
};

export default useFileUpload;