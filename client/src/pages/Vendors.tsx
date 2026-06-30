import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { apiPrivate } from '../api/axios';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Vendor Name', width: 250 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'gstNumber', headerName: 'Tax ID / GST', width: 150 },
  { field: 'phone', headerName: 'Phone', width: 150 },
];

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await apiPrivate.get('/vendors');
        setVendors(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Vendors</Typography>
        <Button variant="contained">
          Add Vendor
        </Button>
      </Box>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={vendors}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default Vendors;
