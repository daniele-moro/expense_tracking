/**
 * Simplified tests for Upload component focusing on core functionality
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Upload from '../Upload';

// Mock the custom hooks
jest.mock('../../hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploadingFiles: [],
    uploadFile: jest.fn(),
    removeUploadingFile: jest.fn(),
    clearCompleted: jest.fn(),
    isUploading: false,
  }),
}));

jest.mock('../../hooks/useDocuments', () => ({
  useDocuments: () => ({
    documents: [],
    loading: false,
    error: null,
    total: 0,
    refresh: jest.fn(),
    deleteDocument: jest.fn(),
    downloadDocument: jest.fn(),
    filterByType: jest.fn(),
    currentFilter: 'all',
  }),
}));

// Mock FileService
jest.mock('../../services/fileService', () => ({
  validateFile: jest.fn().mockReturnValue({ valid: true }),
  formatFileSize: jest.fn().mockReturnValue('1.2 MB'),
  inferDocumentType: jest.fn().mockReturnValue('receipt'),
  __esModule: true,
  default: {
    validateFile: jest.fn().mockReturnValue({ valid: true }),
    formatFileSize: jest.fn().mockReturnValue('1.2 MB'),
    inferDocumentType: jest.fn().mockReturnValue('receipt'),
  }
}));

describe('Upload Component', () => {
  test('renders main elements', () => {
    render(<Upload />);
    
    expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    expect(screen.getByText('Drag & Drop Files Here')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });

  test('renders document types section', () => {
    render(<Upload />);
    
    expect(screen.getByText('Document Types')).toBeInTheDocument();
    expect(screen.getByText('Receipts')).toBeInTheDocument();
    expect(screen.getByText('Payslips')).toBeInTheDocument();
  });

  test('shows empty documents state', () => {
    render(<Upload />);
    
    expect(screen.getByText('No documents uploaded yet. Drop files above to get started!')).toBeInTheDocument();
  });

  test('document type radio buttons work', () => {
    render(<Upload />);
    
    const receiptRadio = screen.getByLabelText('Receipt');
    const payslipRadio = screen.getByLabelText('Payslip');
    
    expect(receiptRadio).toBeChecked();
    
    fireEvent.click(payslipRadio);
    expect(payslipRadio).toBeChecked();
    expect(receiptRadio).not.toBeChecked();
  });

  test('filter buttons are present', () => {
    render(<Upload />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Receipts')).toBeInTheDocument();
    expect(screen.getByText('Payslips')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  test('file input has correct attributes', () => {
    render(<Upload />);
    
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', '.jpg,.jpeg,.png,.pdf');
    expect(fileInput).toHaveAttribute('multiple');
  });
});