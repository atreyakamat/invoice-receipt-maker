import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const res = await apiPrivate.get('/dashboard/analytics');
      return res.data;
    }
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load dashboard data.</Alert>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Spend</Typography>
              <Typography variant="h5">₹{data?.totalSpend || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Invoices Processed</Typography>
              <Typography variant="h5">{data?.invoicesProcessed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>AI Confidence Avg</Typography>
              <Typography variant="h5">{data?.avgConfidence || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Monthly Spend</Typography>
          <Box sx={{ height: 300 }}>
            {data?.chartData && data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="spend" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="textSecondary">No data available for charts.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
