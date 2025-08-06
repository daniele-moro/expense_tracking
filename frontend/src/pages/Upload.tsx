import React, { useState } from 'react';
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
} from '@mui/icons-material';

const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'grocery_receipt_20250806.jpg',
      type: 'receipt',
      status: 'completed',
      confidence: 95,
      uploadedAt: '2025-08-06 10:30',
      extractedAmount: 67.45,
    },
    {
      id: 2,
      name: 'gas_station_receipt.jpg',
      type: 'receipt',
      status: 'processing',
      confidence: null,
      uploadedAt: '2025-08-06 10:25',
      extractedAmount: null,
    },
    {
      id: 3,
      name: 'payslip_july_2025.pdf',
      type: 'payslip',
      status: 'needs_review',
      confidence: 75,
      uploadedAt: '2025-08-06 09:15',
      extractedAmount: 3500.00,
    },
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    // Handle file drop logic here
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="warning" />;
      case 'needs_review':
        return <Error color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'needs_review':
        return 'error';
      default:
        return 'default';
    }
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
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Choose Files
              <input type="file" hidden multiple accept=".jpg,.jpeg,.png,.pdf" />
            </Button>
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

        {/* Processing Queue */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Processing Queue
            </Typography>
            {uploadedFiles.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                No files uploaded yet
              </Typography>
            ) : (
              <List>
                {uploadedFiles.map((file) => (
                  <ListItem key={file.id} divider>
                    <Box display="flex" alignItems="center" mr={2}>
                      {getStatusIcon(file.status)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1">{file.name}</Typography>
                          <Chip
                            label={file.type}
                            size="small"
                            color={file.type === 'receipt' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                          <Chip
                            label={file.status.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(file.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Uploaded: {file.uploadedAt}
                          </Typography>
                          {file.confidence && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              OCR Confidence: {file.confidence}%
                            </Typography>
                          )}
                          {file.extractedAmount && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Extracted Amount: ${file.extractedAmount.toFixed(2)}
                            </Typography>
                          )}
                          {file.status === 'processing' && (
                            <LinearProgress sx={{ mt: 1, width: 200 }} />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => setPreviewOpen(true)}
                        disabled={file.status === 'processing'}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton edge="end" color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
            {uploadedFiles.some(f => f.status === 'needs_review') && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" color="warning.dark">
                  {uploadedFiles.filter(f => f.status === 'needs_review').length} document(s) need your review.
                  <Button size="small" sx={{ ml: 1 }} color="warning">
                    Review Now
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
    </Box>
  );
};

export default Upload;