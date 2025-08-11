/**
 * Tests for useFileUpload hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';
import FileService from '../../services/fileService';

// Mock FileService
jest.mock('../../services/fileService', () => ({
  validateFile: jest.fn(),
  uploadDocument: jest.fn(),
  __esModule: true,
  default: {
    validateFile: jest.fn(),
    uploadDocument: jest.fn(),
  }
}));

const mockFileService = FileService as jest.Mocked<typeof FileService>;

describe('useFileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state is correct', () => {
    const { result } = renderHook(() => useFileUpload());
    
    expect(result.current.uploadingFiles).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(typeof result.current.uploadFile).toBe('function');
    expect(typeof result.current.removeUploadingFile).toBe('function');
    expect(typeof result.current.clearCompleted).toBe('function');
  });

  test('validates file before upload', async () => {
    mockFileService.validateFile.mockReturnValue({ valid: false, error: 'Invalid file' });
    
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    await expect(act(async () => {
      await result.current.uploadFile(mockFile, 'receipt');
    })).rejects.toThrow('Invalid file');
    
    expect(mockFileService.validateFile).toHaveBeenCalledWith(mockFile);
  });

  test('handles successful upload', async () => {
    const mockDocument = { id: 1, original_filename: 'test.jpg', type: 'receipt' };
    
    mockFileService.validateFile.mockReturnValue({ valid: true });
    mockFileService.uploadDocument.mockResolvedValue(mockDocument as any);
    
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    
    let uploadResult: any;
    
    await act(async () => {
      uploadResult = await result.current.uploadFile(mockFile, 'receipt');
    });
    
    expect(uploadResult).toEqual(mockDocument);
    expect(mockFileService.uploadDocument).toHaveBeenCalledWith(
      mockFile, 
      'receipt', 
      expect.any(Function)
    );
  });

  test('handles upload failure', async () => {
    mockFileService.validateFile.mockReturnValue({ valid: true });
    mockFileService.uploadDocument.mockRejectedValue(new Error('Upload failed'));
    
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    
    await expect(act(async () => {
      await result.current.uploadFile(mockFile, 'receipt');
    })).rejects.toThrow('Upload failed');
    
    // Wait for state update and check that the uploading file has error status
    await waitFor(() => {
      expect(result.current.uploadingFiles).toHaveLength(1);
    });
    
    const uploadingFile = result.current.uploadingFiles[0];
    expect(uploadingFile.status).toBe('error');
    expect(uploadingFile.error).toBe('Upload failed');
  });

  test('removes uploading file by id', async () => {
    mockFileService.validateFile.mockReturnValue({ valid: true });
    mockFileService.uploadDocument.mockResolvedValue({ id: 1 } as any);
    
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Start upload to get a file in the list
    await act(async () => {
      await result.current.uploadFile(mockFile, 'receipt');
    });
    
    await waitFor(() => {
      expect(result.current.uploadingFiles).toHaveLength(1);
    });
    
    const uploadId = result.current.uploadingFiles[0].id;
    
    act(() => {
      result.current.removeUploadingFile(uploadId);
    });
    
    expect(result.current.uploadingFiles).toHaveLength(0);
  });

  test('isUploading reflects upload state', async () => {
    mockFileService.validateFile.mockReturnValue({ valid: true });
    mockFileService.uploadDocument.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    const { result } = renderHook(() => useFileUpload());
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    
    // Start upload
    const uploadPromise = act(async () => {
      await result.current.uploadFile(mockFile, 'receipt');
    });
    
    // Should show as uploading
    await waitFor(() => {
      expect(result.current.isUploading).toBe(true);
    });
    
    // Wait for upload to complete
    await uploadPromise;
    
    await waitFor(() => {
      expect(result.current.isUploading).toBe(false);
    });
  });
});