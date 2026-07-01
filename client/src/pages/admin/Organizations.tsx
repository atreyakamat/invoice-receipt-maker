import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
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
    { field: 'createdAt', headerName: 'Created At', width: 200, valueFormatter: (params: any) => new Date(params.value).toLocaleDateString() },
    { 
      field: 'plan', 
      headerName: 'Plan', 
      width: 150,
      valueGetter: (params: any) => params.row?.subscription?.plan || 'Unknown'
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Organizations</Typography>
      <Card sx={{ height: 600, width: '100%', p: 0 }}>
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
      </Card>
    </Box>
  );
};

export default Organizations;
