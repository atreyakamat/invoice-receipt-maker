import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../../api/axios';

const Organizations: React.FC = () => {
  const { data: orgs, isLoading } = useQuery({
    queryKey: ['adminOrganizations'],
    queryFn: async () => {
      const res = await apiPrivate.get('/admin/organizations');
      return res.data;
    }
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'companyName', headerName: 'Company Name', width: 250 },
    { field: 'email', headerName: 'Contact Email', width: 200 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: 'Created At', width: 200, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" mb={3}>All Organizations</Typography>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={orgs || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default Organizations;
