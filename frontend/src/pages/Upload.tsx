import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  CloudUpload,
  Receipt,
  Description,
  Visibility,
  Delete,
  CheckCircle,
  Error,
  Schedule,
  Download,
  Clear,
} from '@mui/icons-material';

import { useFileUpload } from '../hooks/useFileUpload';
import { useDocuments } from '../hooks/useDocuments';
import FileService from '../services/fileService';

const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<'receipt' | 'payslip'>('receipt');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks for file management
  const { uploadingFiles, uploadFile, removeUploadingFile, clearCompleted, isUploading } = useFileUpload();
  const { 
    documents, 
    loading, 
    error, 
    total, 
    refresh, 
    deleteDocument, 
    downloadDocument, 
    filterByType, 
    currentFilter 
  } = useDocuments();

  // File handling functions
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Validate file
      const validation = FileService.validateFile(file);
      if (!validation.valid) {
        showSnackbar(validation.error || 'Invalid file', 'error');
        continue;
      }

      // Infer document type if not explicitly set
      const documentType = FileService.inferDocumentType(file.name) || selectedDocumentType;

      try {
        await uploadFile(file, documentType);
        showSnackbar(`${file.name} uploaded successfully!`, 'success');
        // Refresh documents list
        refresh();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        showSnackbar(`Failed to upload ${file.name}: ${errorMessage}`, 'error');
      }
    }
  }, [uploadFile, selectedDocumentType, showSnackbar, refresh]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Clear the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleDelete = useCallback(async (documentId: number, filename: string) => {
    try {
      await deleteDocument(documentId);
      showSnackbar(`${filename} deleted successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      showSnackbar(`Failed to delete ${filename}: ${errorMessage}`, 'error');
    }
  }, [deleteDocument, showSnackbar]);

  const handleDownload = useCallback(async (documentId: number, filename: string) => {
    try {
      await downloadDocument(documentId, filename);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      showSnackbar(`Failed to download ${filename}: ${errorMessage}`, 'error');
    }
  }, [downloadDocument, showSnackbar]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="warning" />;
      case 'pending':
        return <Schedule color="info" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Documents
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload receipts and payslips for automatic processing. Supported formats: JPG, PNG, PDF
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Area */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              backgroundColor: dragActive ? 'action.hover' : 'background.paper',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Files Here
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              or click to select files
            </Typography>
            <Button 
              variant="contained" 
              component="label" 
              sx={{ mb: 2 }}
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Files
            </Button>
            <input 
              type="file" 
              ref={fileInputRef}
              hidden 
              multiple 
              accept=".jpg,.jpeg,.png,.pdf" 
              onChange={handleFileSelect}
            />
            
            {/* Document Type Selection */}
            <FormControl sx={{ mt: 2 }}>
              <FormLabel component="legend">Default Document Type</FormLabel>
              <RadioGroup
                row
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value as 'receipt' | 'payslip')}
              >
                <FormControlLabel value="receipt" control={<Radio />} label="Receipt" />
                <FormControlLabel value="payslip" control={<Radio />} label="Payslip" />
              </RadioGroup>
            </FormControl>
            <Typography variant="caption" display="block" color="textSecondary">
              Max file size: 10MB • Formats: JPG, PNG, PDF
            </Typography>
          </Paper>
        </Grid>

        {/* Upload Types */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Document Types
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Receipt color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Receipts</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Grocery stores, restaurants, gas stations, retail purchases
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Automatically extracts: Amount, merchant, date, line items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Description color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Payslips</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Salary statements, wage slips, income documentation
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Automatically extracts: Gross pay, net pay, deductions, dates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Processing Queue and Documents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Documents ({total})
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                {uploadingFiles.length > 0 && (
                  <Button 
                    size="small" 
                    onClick={clearCompleted}
                    startIcon={<Clear />}
                  >
                    Clear Completed
                  </Button>
                )}
                <Button size="small" onClick={() => filterByType()}>
                  All
                </Button>
                <Button size="small" onClick={() => filterByType('receipt')}>
                  Receipts
                </Button>
                <Button size="small" onClick={() => filterByType('payslip')}>
                  Payslips
                </Button>
                <Button size="small" onClick={refresh}>
                  Refresh
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Show uploading files first */}
            {uploadingFiles.length > 0 && (
              <>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Uploading ({uploadingFiles.length})
                </Typography>
                <List>
                  {uploadingFiles.map((file) => (
                    <ListItem key={file.id} divider>
                      <Box display="flex" alignItems="center" mr={2}>
                        {file.status === 'uploading' && <Schedule color="primary" />}
                        {file.status === 'completed' && <CheckCircle color="success" />}
                        {file.status === 'error' && <Error color="error" />}
                      </Box>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">{file.file.name}</Typography>
                            <Chip
                              label={file.documentType}
                              size="small"
                              color={file.documentType === 'receipt' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                            <Chip
                              label={file.status}
                              size="small"
                              color={file.status === 'completed' ? 'success' : file.status === 'error' ? 'error' : 'info'}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Size: {FileService.formatFileSize(file.file.size)}
                            </Typography>
                            {file.error && (
                              <Typography variant="caption" display="block" color="error">
                                Error: {file.error}
                              </Typography>
                            )}
                            {file.status === 'uploading' && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={file.progress.percentage} 
                                  sx={{ width: 200 }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                  {file.progress.percentage}% uploaded
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => removeUploadingFile(file.id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Show existing documents */}
            {loading ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  Loading documents...
                </Typography>
              </Box>
            ) : documents.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                No documents uploaded yet. Drop files above to get started!
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: uploadingFiles.length > 0 ? 2 : 0 }}>
                  Saved Documents
                </Typography>
                <List>
                  {documents.map((document) => (
                    <ListItem key={document.id} divider>
                      <Box display="flex" alignItems="center" mr={2}>
                        {getStatusIcon(document.processing_status)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">{document.original_filename}</Typography>
                            <Chip
                              label={document.type}
                              size="small"
                              color={document.type === 'receipt' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                            <Chip
                              label={document.processing_status}
                              size="small"
                              color={getStatusColor(document.processing_status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Uploaded: {formatDate(document.uploaded_at)}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              Size: {FileService.formatFileSize(document.file_size)}
                            </Typography>
                            {document.ocr_confidence && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                OCR Confidence: {Math.round(document.ocr_confidence * 100)}%
                              </Typography>
                            )}
                            {document.processing_status === 'processing' && (
                              <LinearProgress sx={{ mt: 1, width: 200 }} />
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Download">
                          <IconButton
                            edge="end"
                            onClick={() => handleDownload(document.id, document.original_filename)}
                            size="small"
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            edge="end" 
                            color="error"
                            onClick={() => handleDelete(document.id, document.original_filename)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {documents.some(d => d.processing_status === 'failed') && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" color="error.dark">
                  {documents.filter(d => d.processing_status === 'failed').length} document(s) failed processing.
                  <Button size="small" sx={{ ml: 1 }} color="error">
                    Review Failed
                  </Button>
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            Document preview would be displayed here
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained">Edit Extracted Data</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Upload;