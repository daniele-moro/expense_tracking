import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CloudUpload,
  Receipt,
  AttachMoney,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Mock data for the dashboard
  const monthlyStats = {
    totalExpenses: 1247.50,
    totalIncome: 3500.00,
    pendingVerifications: 3,
    documentsProcessed: 15,
  };

  const recentTransactions = [
    { id: 1, description: 'Grocery Store Receipt', amount: -67.45, date: '2025-08-06', status: 'verified' },
    { id: 2, description: 'Gas Station', amount: -45.20, date: '2025-08-05', status: 'pending' },
    { id: 3, description: 'Salary Payment', amount: 3500.00, date: '2025-08-01', status: 'verified' },
    { id: 4, description: 'Restaurant Receipt', amount: -28.90, date: '2025-08-04', status: 'verified' },
  ];

  const budgetProgress = [
    { category: 'Groceries', spent: 245, budget: 400, percentage: 61 },
    { category: 'Transportation', spent: 120, budget: 200, percentage: 60 },
    { category: 'Entertainment', spent: 85, budget: 150, percentage: 57 },
    { category: 'Utilities', spent: 180, budget: 200, percentage: 90 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Overview
      </Typography>
      
      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Monthly Expenses
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                ${monthlyStats.totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="error">
                ↓ 15% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Monthly Income
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                ${monthlyStats.totalIncome.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="success.main">
                ↑ 5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Pending Verification
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {monthlyStats.pendingVerifications}
              </Typography>
              <Button size="small" color="warning" sx={{ mt: 1 }}>
                Review Now
              </Button>
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
              <Typography variant="h5" component="div" color="success.main">
                +${(monthlyStats.totalIncome - monthlyStats.totalExpenses).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                fullWidth
                size="large"
              >
                Upload Receipt
              </Button>
              <Button variant="outlined" fullWidth>
                Add Manual Expense
              </Button>
              <Button variant="outlined" fullWidth>
                Add Income Entry
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {recentTransactions.map((transaction) => (
                <ListItem key={transaction.id} divider>
                  <ListItemText
                    primary={transaction.description}
                    secondary={transaction.date}
                  />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Typography>
                    <Chip
                      label={transaction.status}
                      size="small"
                      color={transaction.status === 'verified' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
            <Button variant="text" fullWidth sx={{ mt: 1 }}>
              View All Transactions
            </Button>
          </Paper>
        </Grid>

        {/* Budget Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Progress
            </Typography>
            <Grid container spacing={2}>
              {budgetProgress.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.category}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{item.category}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        ${item.spent}/${item.budget}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      color={item.percentage > 80 ? 'error' : item.percentage > 60 ? 'warning' : 'success'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {item.percentage}% used
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;