import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../../api/axios';

const Users: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiPrivate.get('/admin/users');
      return res.data;
    }
  });

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150, renderCell: (params) => <Chip label={params.value} color={params.value === 'SYSTEM_ADMIN' ? 'error' : 'primary'} size="small" /> },
    { field: 'organization', headerName: 'Organization', width: 200, valueGetter: (params) => params.row.organization?.companyName || 'None' },
    { field: 'emailVerified', headerName: 'Verified', width: 100, type: 'boolean' },
    { field: 'createdAt', headerName: 'Joined', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" mb={3}>All Users</Typography>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={users || []}
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

export default Users;
