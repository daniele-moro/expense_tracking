/**
 * Tests for FileService utility functions
 */
import { FileService } from '../fileService';

describe('FileService', () => {
  describe('validateFile', () => {
    test('validates valid image file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = FileService.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('validates valid PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = FileService.validateFile(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('rejects invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = FileService.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File type not supported. Please use JPG, PNG, or PDF files.');
    });

    test('rejects oversized file', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('x').join(''); // 11MB
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(file, 'size', {
        value: 11 * 1024 * 1024,
        writable: false
      });
      
      const result = FileService.validateFile(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds 10MB limit');
    });
  });

  describe('formatFileSize', () => {
    test('formats bytes correctly', () => {
      expect(FileService.formatFileSize(0)).toBe('0 Bytes');
      expect(FileService.formatFileSize(500)).toBe('500 Bytes');
      expect(FileService.formatFileSize(1024)).toBe('1 KB');
      expect(FileService.formatFileSize(1536)).toBe('1.5 KB');
      expect(FileService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(FileService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('inferDocumentType', () => {
    test('infers payslip from filename', () => {
      expect(FileService.inferDocumentType('payslip_jan_2023.pdf')).toBe('payslip');
      expect(FileService.inferDocumentType('salary_statement.jpg')).toBe('payslip');
      expect(FileService.inferDocumentType('wage_slip.png')).toBe('payslip');
    });

    test('defaults to receipt for unknown filenames', () => {
      expect(FileService.inferDocumentType('random_document.pdf')).toBe('receipt');
      expect(FileService.inferDocumentType('grocery_bill.jpg')).toBe('receipt');
      expect(FileService.inferDocumentType('receipt.png')).toBe('receipt');
    });

    test('handles case insensitive matching', () => {
      expect(FileService.inferDocumentType('PAYSLIP.PDF')).toBe('payslip');
      expect(FileService.inferDocumentType('Salary.jpg')).toBe('payslip');
    });
  });
});