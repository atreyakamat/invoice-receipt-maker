import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', spend: 4000 },
  { name: 'Feb', spend: 3000 },
  { name: 'Mar', spend: 2000 },
  { name: 'Apr', spend: 2780 },
  { name: 'May', spend: 1890 },
  { name: 'Jun', spend: 2390 },
];

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {[
          { title: 'Total Spend', value: '₹4,56,000' },
          { title: 'Invoices Processed', value: '1,286' },
          { title: 'AI Accuracy', value: '98.2%' },
          { title: 'Avg Process Time', value: '7.2 sec' },
        ].map((kpi) => (
          <Box key={kpi.title}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {kpi.title}
                </Typography>
                <Typography variant="h5">
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Monthly Spending</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="spend" stroke="#1976d2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
