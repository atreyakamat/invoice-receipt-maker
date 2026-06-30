import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

const columns: GridColDef[] = [
  { field: 'invoiceNumber', headerName: 'Invoice #', width: 150 },
  { field: 'vendor', headerName: 'Vendor', width: 200 },
  { field: 'amount', headerName: 'Amount', width: 130 },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'confidence', headerName: 'Confidence', width: 120 },
  { field: 'date', headerName: 'Date', width: 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: (_params) => {
      // Assuming a hook to useNavigate in a component wrapper, we pass it down or handle differently
      return (
        <Button variant="outlined" size="small" color="primary">
          Validate
        </Button>
      )
    }
  }
];

const rows = [
  { id: 1, invoiceNumber: 'INV-001', vendor: 'Adobe', amount: '₹1450', status: 'Completed', confidence: '99%', date: 'Today' },
  { id: 2, invoiceNumber: 'INV-002', vendor: 'AWS', amount: '₹5400', status: 'Processing', confidence: '-', date: 'Today' },
];

const Invoices: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Invoices</Typography>
        <Button variant="contained" component="label">
          Upload Invoice
          <input type="file" hidden />
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns.map(c => c.field === 'actions' ? {
          ...c, 
          renderCell: (params) => (
            <Button variant="outlined" size="small" color="primary" onClick={() => navigate(`/invoices/${params.row.id}/validate`)}>
              Review
            </Button>
          )
        } : c)}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default Invoices;
