import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../../api/axios';

const AdminDashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: async () => {
      const res = await apiPrivate.get('/admin/dashboard');
      const sys = await apiPrivate.get('/admin/system');
      return { metrics: res.data, system: sys.data };
    }
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load admin metrics.</Alert>;

  return (
    <Box>
      <Typography variant="h4" mb={4}>System Overview</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Total Organizations</Typography>
            <Typography variant="h3">{data?.metrics.totalOrganizations}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Total Users</Typography>
            <Typography variant="h3">{data?.metrics.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">Invoices Processed</Typography>
            <Typography variant="h3">{data?.metrics.totalInvoices}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" mb={2} mt={2}>System Health</Typography>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" gap={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Database</Typography>
                <Typography color={data?.system.database === 'OK' ? 'success.main' : 'error'}>
                  {data?.system.database}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Redis/Queue</Typography>
                <Typography color={data?.system.redis === 'OK' ? 'success.main' : 'error'}>
                  {data?.system.redis}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Workers</Typography>
                <Typography color={data?.system.workers === 'OK' ? 'success.main' : 'error'}>
                  {data?.system.workers}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
