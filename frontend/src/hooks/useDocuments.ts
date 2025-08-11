/**
 * Custom hook for managing documents - loading, refreshing, and filtering
 */
import { useState, useEffect, useCallback } from 'react';
import FileService, { Document, DocumentListResponse } from '../services/fileService';

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => Promise<void>;
  deleteDocument: (documentId: number) => Promise<void>;
  downloadDocument: (documentId: number, filename: string) => Promise<void>;
  filterByType: (type?: 'receipt' | 'payslip') => void;
  currentFilter: 'all' | 'receipt' | 'payslip';
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'receipt' | 'payslip'>('all');

  const loadDocuments = useCallback(async (type?: 'receipt' | 'payslip') => {
    try {
      setLoading(true);
      setError(null);

      const response: DocumentListResponse = await FileService.getDocuments(type);
      setDocuments(response.documents);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const filterType = currentFilter === 'all' ? undefined : currentFilter;
    await loadDocuments(filterType);
  }, [currentFilter, loadDocuments]);

  const filterByType = useCallback((type?: 'receipt' | 'payslip') => {
    const newFilter = type || 'all';
    setCurrentFilter(newFilter);
    loadDocuments(type);
  }, [loadDocuments]);

  const deleteDocument = useCallback(async (documentId: number) => {
    try {
      await FileService.deleteDocument(documentId);
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setTotal(prev => prev - 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      throw new Error(errorMessage);
    }
  }, []);

  const downloadDocument = useCallback(async (documentId: number, filename: string) => {
    try {
      await FileService.downloadDocument(documentId, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download document';
      throw new Error(errorMessage);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    loading,
    error,
    total,
    refresh,
    deleteDocument,
    downloadDocument,
    filterByType,
    currentFilter,
  };
};

export default useDocuments;