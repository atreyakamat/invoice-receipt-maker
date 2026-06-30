import React, { useState } from 'react';
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await apiPrivate.get('/invoices');
      return res.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('invoice', file);
      const res = await apiPrivate.post('/invoices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Invoice uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to upload invoice');
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
    // reset input
    e.target.value = '';
  };

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 200 },
    { field: 'vendor', headerName: 'Vendor', width: 200, valueGetter: (_params, row) => row.vendor?.name || 'Unknown' },
    { field: 'total', headerName: 'Amount', width: 130 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'confidence', headerName: 'Confidence', width: 120 },
    { field: 'invoiceDate', headerName: 'Date', width: 150, valueFormatter: (value) => new Date(value).toLocaleDateString() },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button variant="outlined" size="small" color="primary" onClick={() => navigate(`/invoices/${params.row.id}/validate`)}>
          Review
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Invoices</Typography>
        <Button variant="contained" component="label" disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Invoice'}
          <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileUpload} />
        </Button>
      </Box>

      <DataGrid
        rows={invoices || []}
        columns={columns}
        loading={isLoading}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        disableRowSelectionOnClick
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Invoices;
