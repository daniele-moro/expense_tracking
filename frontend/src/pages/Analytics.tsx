import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart,
  FileDownload,
} from '@mui/icons-material';

const Analytics: React.FC = () => {
  const categorySpending = [
    { category: 'Groceries', amount: 543.20, percentage: 35, change: -5 },
    { category: 'Transportation', amount: 287.50, percentage: 18, change: 12 },
    { category: 'Dining', amount: 201.80, percentage: 13, change: -8 },
    { category: 'Utilities', amount: 180.00, percentage: 12, change: 2 },
    { category: 'Entertainment', amount: 156.70, percentage: 10, change: 15 },
    { category: 'Healthcare', amount: 98.50, percentage: 6, change: -3 },
    { category: 'Other', amount: 89.30, percentage: 6, change: 8 },
  ];

  const monthlyTrends = [
    { month: 'Jan', expenses: 1245, income: 3500 },
    { month: 'Feb', expenses: 1156, income: 3500 },
    { month: 'Mar', expenses: 1389, income: 3500 },
    { month: 'Apr', expenses: 1267, income: 3500 },
    { month: 'May', expenses: 1445, income: 3500 },
    { month: 'Jun', expenses: 1334, income: 3500 },
    { month: 'Jul', expenses: 1247, income: 4700 }, // Including freelance
  ];

  const totalExpenses = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Period</InputLabel>
            <Select label="Time Period" defaultValue="month">
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FileDownload />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Spending
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                ${totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="error">
                ↓ 8% vs last month
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
                  Average Daily
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                ${(totalExpenses / 31).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="success.main">
                ↑ 12% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PieChart color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Top Category
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                Groceries
              </Typography>
              <Typography variant="body2" color="textSecondary">
                35% of spending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BarChart color="secondary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Savings Rate
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="success.main">
                73%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Of income saved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Category Breakdown */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Your spending breakdown for this month
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {categorySpending.map((category, index) => (
                <Box key={category.category} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body1" fontWeight="medium">
                      {category.category}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        ${category.amount.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${category.change > 0 ? '+' : ''}${category.change}%`}
                        size="small"
                        color={category.change > 0 ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${category.percentage}%`,
                          height: '100%',
                          backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ minWidth: 35 }}>
                      {category.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Trends
            </Typography>
            <Typography variant="body2" color="textSecordary" paragraph>
              Income vs Expenses over time
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {monthlyTrends.slice(-6).map((month) => (
                <Box key={month.month} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {month.month}
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      +${(month.income - month.expenses).toFixed(0)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Income: ${month.income}
                      </Typography>
                      <Box
                        sx={{
                          height: 4,
                          backgroundColor: 'success.light',
                          borderRadius: 2,
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Expenses: ${month.expenses}
                      </Typography>
                      <Box
                        sx={{
                          height: 4,
                          backgroundColor: 'error.light',
                          borderRadius: 2,
                          width: `${(month.expenses / month.income) * 100}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" color="success.dark">
                    Great Job! 💚
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    Your grocery spending decreased by 5% this month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, backgroundColor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" color="warning.dark">
                    Watch Out ⚠️
                  </Typography>
                  <Typography variant="caption" color="warning.dark">
                    Transportation costs increased by 12%
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" color="info.dark">
                    Tip 💡
                  </Typography>
                  <Typography variant="caption" color="info.dark">
                    You're saving 73% of your income - excellent!
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ p: 2, backgroundColor: 'secondary.light', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold" color="secondary.dark">
                    Goal 🎯
                  </Typography>
                  <Typography variant="caption" color="secondary.dark">
                    Consider setting a budget for entertainment
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;