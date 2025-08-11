/**
 * Tests for useDocuments hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocuments } from '../useDocuments';
import FileService from '../../services/fileService';
import type { Document } from '../../services/fileService';

// Mock FileService
jest.mock('../../services/fileService', () => ({
  getDocuments: jest.fn(),
  deleteDocument: jest.fn(),
  downloadDocument: jest.fn(),
  __esModule: true,
  default: {
    getDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    downloadDocument: jest.fn(),
  }
}));

const mockFileService = FileService as jest.Mocked<typeof FileService>;

const mockDocument: Document = {
  id: 1,
  user_id: 1,
  type: 'receipt',
  original_filename: 'test-receipt.jpg',
  file_size: 1024,
  mime_type: 'image/jpeg',
  processing_status: 'pending',
  ocr_confidence: null,
  processed_at: null,
  uploaded_at: '2023-01-01T00:00:00Z'
};

describe('useDocuments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state is correct', () => {
    mockFileService.getDocuments.mockResolvedValue({ documents: [], total: 0 });
    
    const { result } = renderHook(() => useDocuments());
    
    expect(result.current.documents).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.total).toBe(0);
    expect(result.current.currentFilter).toBe('all');
  });

  test('loads documents on mount', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.documents).toEqual([mockDocument]);
    expect(result.current.total).toBe(1);
    expect(mockFileService.getDocuments).toHaveBeenCalledWith(undefined);
  });

  test('handles loading error', async () => {
    mockFileService.getDocuments.mockRejectedValue(new Error('Load failed'));
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBe('Load failed');
    expect(result.current.documents).toEqual([]);
  });

  test('refreshes documents', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    mockFileService.getDocuments.mockClear();
    
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(mockFileService.getDocuments).toHaveBeenCalledTimes(1);
  });

  test('filters by document type', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.filterByType('receipt');
    });
    
    await waitFor(() => {
      expect(result.current.currentFilter).toBe('receipt');
    });
    
    expect(mockFileService.getDocuments).toHaveBeenLastCalledWith('receipt');
  });

  test('filters by all documents', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // First filter by receipt
    act(() => {
      result.current.filterByType('receipt');
    });
    
    // Then filter by all
    act(() => {
      result.current.filterByType();
    });
    
    await waitFor(() => {
      expect(result.current.currentFilter).toBe('all');
    });
    
    expect(mockFileService.getDocuments).toHaveBeenLastCalledWith(undefined);
  });

  test('deletes document', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    mockFileService.deleteDocument.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.deleteDocument(1);
    });
    
    expect(mockFileService.deleteDocument).toHaveBeenCalledWith(1);
    expect(result.current.documents).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  test('handles delete error', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    mockFileService.deleteDocument.mockRejectedValue(new Error('Delete failed'));
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await expect(act(async () => {
      await result.current.deleteDocument(1);
    })).rejects.toThrow('Delete failed');
    
    // Document should still be in the list
    expect(result.current.documents).toEqual([mockDocument]);
  });

  test('downloads document', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    mockFileService.downloadDocument.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.downloadDocument(1, 'test.jpg');
    });
    
    expect(mockFileService.downloadDocument).toHaveBeenCalledWith(1, 'test.jpg');
  });

  test('handles download error', async () => {
    mockFileService.getDocuments.mockResolvedValue({ 
      documents: [mockDocument], 
      total: 1 
    });
    mockFileService.downloadDocument.mockRejectedValue(new Error('Download failed'));
    
    const { result } = renderHook(() => useDocuments());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await expect(act(async () => {
      await result.current.downloadDocument(1, 'test.jpg');
    })).rejects.toThrow('Download failed');
  });
});