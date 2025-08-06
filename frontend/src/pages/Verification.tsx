import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Add,
  Delete,
} from '@mui/icons-material';

const Verification: React.FC = () => {
  const [currentItem, setCurrentItem] = useState(0);
  
  const pendingItems = [
    {
      id: 1,
      filename: 'grocery_receipt_20250806.jpg',
      type: 'receipt',
      confidence: 87,
      extractedData: {
        merchant: 'Whole Foods Market',
        amount: 67.45,
        date: '2025-08-06',
        category: 'Groceries',
        items: [
          { name: 'Organic Bananas', quantity: '2 lbs', price: 3.98 },
          { name: 'Almond Milk', quantity: '1', price: 4.99 },
          { name: 'Chicken Breast', quantity: '1.5 lbs', price: 12.48 },
        ],
      },
      originalImage: '/api/placeholder/400/600',
    },
    {
      id: 2,
      filename: 'gas_station_receipt.jpg',
      type: 'receipt',
      confidence: 75,
      extractedData: {
        merchant: 'Shell Gas Station',
        amount: 45.20,
        date: '2025-08-05',
        category: 'Transportation',
        items: [
          { name: 'Regular Gasoline', quantity: '12.5 gal', price: 45.20 },
        ],
      },
      originalImage: '/api/placeholder/400/600',
    },
    {
      id: 3,
      filename: 'payslip_july_2025.pdf',
      type: 'payslip',
      confidence: 92,
      extractedData: {
        employer: 'Tech Corp Inc.',
        grossPay: 3500.00,
        netPay: 2650.00,
        payPeriod: 'July 1-31, 2025',
        deductions: {
          'Federal Tax': 420.00,
          'State Tax': 210.00,
          'Social Security': 217.00,
          'Medicare': 50.75,
          'Health Insurance': 120.00,
        },
      },
      originalImage: '/api/placeholder/400/600',
    },
  ];

  const current = pendingItems[currentItem];
  const [formData, setFormData] = useState(current?.extractedData || {});

  const handleNext = () => {
    setCurrentItem((prev) => (prev + 1) % pendingItems.length);
    setFormData(pendingItems[(currentItem + 1) % pendingItems.length]?.extractedData || {});
  };

  const handlePrevious = () => {
    setCurrentItem((prev) => (prev - 1 + pendingItems.length) % pendingItems.length);
    setFormData(pendingItems[(currentItem - 1 + pendingItems.length) % pendingItems.length]?.extractedData || {});
  };

  const handleApprove = () => {
    console.log('Approved:', formData);
    handleNext();
  };

  const handleReject = () => {
    console.log('Rejected:', current.id);
    handleNext();
  };

  if (!current) {
    return (
      <Box textAlign="center" py={8}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          All Caught Up!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          No documents pending verification
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Verification Queue
        </Typography>
        <Chip
          label={`${currentItem + 1} of ${pendingItems.length}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Original Document */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Original Document
            </Typography>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image="/api/placeholder/400/600"
                alt={current.filename}
                sx={{ objectFit: 'contain', backgroundColor: 'grey.100' }}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {current.filename}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={current.type}
                    size="small"
                    color={current.type === 'receipt' ? 'primary' : 'secondary'}
                  />
                  <Chip
                    label={`${current.confidence}% confidence`}
                    size="small"
                    color={current.confidence > 85 ? 'success' : current.confidence > 70 ? 'warning' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Extracted Data Form */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Extracted Data
            </Typography>
            
            {current.confidence < 80 && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Low confidence score ({current.confidence}%). Please review all fields carefully.
              </Alert>
            )}

            {current.type === 'receipt' ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Merchant"
                      value={formData.merchant || ''}
                      onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      InputProps={{ startAdornment: '$' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category || ''}
                        label="Category"
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <MenuItem value="Groceries">Groceries</MenuItem>
                        <MenuItem value="Transportation">Transportation</MenuItem>
                        <MenuItem value="Dining">Dining</MenuItem>
                        <MenuItem value="Utilities">Utilities</MenuItem>
                        <MenuItem value="Entertainment">Entertainment</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Line Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell width={50}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(formData.items || []).map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].name = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].quantity = e.target.value;
                                setFormData({ ...formData, items: newItems });
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                newItems[index].price = parseFloat(e.target.value);
                                setFormData({ ...formData, items: newItems });
                              }}
                              InputProps={{ startAdornment: '$' }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button startIcon={<Add />} size="small" sx={{ mt: 1 }}>
                  Add Item
                </Button>
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Employer"
                      value={formData.employer || ''}
                      onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Gross Pay"
                      type="number"
                      value={formData.grossPay || ''}
                      onChange={(e) => setFormData({ ...formData, grossPay: parseFloat(e.target.value) })}
                      InputProps={{ startAdornment: '$' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Net Pay"
                      type="number"
                      value={formData.netPay || ''}
                      onChange={(e) => setFormData({ ...formData, netPay: parseFloat(e.target.value) })}
                      InputProps={{ startAdornment: '$' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pay Period"
                      value={formData.payPeriod || ''}
                      onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box display="flex" gap={2} mt={4}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleApprove}
                size="large"
              >
                Approve & Save
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleReject}
                size="large"
              >
                Reject
              </Button>
              <Box flexGrow={1} />
              <Button onClick={handlePrevious} disabled={currentItem === 0}>
                Previous
              </Button>
              <Button onClick={handleNext} disabled={currentItem === pendingItems.length - 1}>
                Next
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Verification;