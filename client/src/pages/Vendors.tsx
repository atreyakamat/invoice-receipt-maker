import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, IconButton } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiPrivate } from '../api/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
  gstNumber: z.string().optional(),
  phone: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

const Vendors: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await apiPrivate.get('/vendors');
      return res.data;
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { name: '', email: '', gstNumber: '', phone: '' }
  });

  const handleOpen = (vendor?: any) => {
    if (vendor) {
      setEditingId(vendor.id);
      reset({
        name: vendor.name,
        email: vendor.email || '',
        gstNumber: vendor.gstNumber || '',
        phone: vendor.phone || '',
      });
    } else {
      setEditingId(null);
      reset({ name: '', email: '', gstNumber: '', phone: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: VendorFormValues) => {
      if (editingId) {
        return apiPrivate.put(`/vendors/${editingId}`, data);
      } else {
        return apiPrivate.post('/vendors', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setSuccessMsg(editingId ? 'Vendor updated successfully' : 'Vendor added successfully');
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiPrivate.delete(`/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setSuccessMsg('Vendor deleted successfully');
    }
  });

  const onSubmit = (data: VendorFormValues) => {
    saveMutation.mutate(data);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Vendor Name', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'gstNumber', headerName: 'Tax ID / GST', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => {
            if (window.confirm('Are you sure you want to delete this vendor?')) {
              deleteMutation.mutate(params.row.id);
            }
          }}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Vendors</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Vendor
        </Button>
      </Box>
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={vendors || []}
          columns={columns}
          loading={isLoading}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Vendor Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message as string}
              />
              <TextField
                fullWidth
                label="Email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
              <TextField
                fullWidth
                label="Tax ID / GST"
                {...register('gstNumber')}
              />
              <TextField
                fullWidth
                label="Phone"
                {...register('phone')}
              />
            </Box>
            {saveMutation.isError && <Alert severity="error" sx={{ mt: 2 }}>Failed to save vendor.</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg(null)}>
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Vendors;
