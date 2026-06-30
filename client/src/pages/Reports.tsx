import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { apiPrivate } from '../api/axios';

const Reports: React.FC = () => {
  const handleExportCsv = async () => {
    try {
      const response = await apiPrivate.get('/exports/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoices.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await apiPrivate.get('/exports/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoices.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Reports & Exports</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Export Data</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Download a full report of all processed invoices for your accounting software.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleExportCsv}>
              Download CSV
            </Button>
            <Button variant="outlined" onClick={handleExportExcel}>
              Download Excel (XLSX)
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
