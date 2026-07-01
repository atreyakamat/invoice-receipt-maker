import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const res = await apiPrivate.get('/dashboard/metrics');
      return res.data;
    }
  });

  if (isLoading) return <CircularProgress />;

  const statCards = [
    { title: 'Total Invoices', value: data?.totalInvoices || 0, icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
    { title: 'Total Amount', value: `$${data?.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`, icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main' }} /> },
    { title: 'Pending Approval', value: data?.pendingApproval || 0, icon: <PendingActionsIcon sx={{ fontSize: 40, color: 'warning.main' }} /> },
    { title: 'Approved', value: data?.approvedInvoices || 0, icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'info.main' }} /> },
  ];

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Typography variant="h3" mb={1}>Welcome back!</Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here is what's happening with your invoices today.
      </Typography>

      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div variants={item}>
              <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 1 }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.03)' }}>
                    {stat.icon}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

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
