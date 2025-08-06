import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { Add, AttachMoney, Description } from '@mui/icons-material';

const Income: React.FC = () => {
  const incomeData = [
    {
      id: 1,
      source: 'Tech Corp Inc.',
      grossAmount: 3500.00,
      netAmount: 2650.00,
      period: 'July 2025',
      type: 'Salary',
      verified: true,
    },
    {
      id: 2,
      source: 'Freelance Project',
      grossAmount: 1200.00,
      netAmount: 1200.00,
      period: 'July 2025',
      type: 'Freelance',
      verified: true,
    },
  ];

  const totalGross = incomeData.reduce((sum, income) => sum + income.grossAmount, 0);
  const totalNet = incomeData.reduce((sum, income) => sum + income.netAmount, 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Income</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Income
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Gross Income
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="success.main">
                ${totalGross.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Net Income
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="primary.main">
                ${totalNet.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                After deductions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Description color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Deductions
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="warning.main">
                ${(totalGross - totalNet).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Taxes & benefits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="secondary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Income Sources
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {incomeData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active sources
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Income List */}
      <Grid container spacing={3}>
        {incomeData.map((income) => (
          <Grid item xs={12} md={6} key={income.id}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6">{income.source}</Typography>
                <Chip
                  label={income.verified ? 'Verified' : 'Pending'}
                  color={income.verified ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Gross Amount
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${income.grossAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Net Amount
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ${income.netAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Type
                  </Typography>
                  <Chip label={income.type} size="small" variant="outlined" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Period
                  </Typography>
                  <Typography variant="body1">
                    {income.period}
                  </Typography>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                <Button size="small" variant="outlined">
                  Edit
                </Button>
                <Button size="small" variant="outlined">
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Add Options */}
      <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Quick Add Income
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="outlined" size="large" startIcon={<Description />}>
              Upload Payslip
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" size="large" startIcon={<Add />}>
              Manual Entry
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Income;