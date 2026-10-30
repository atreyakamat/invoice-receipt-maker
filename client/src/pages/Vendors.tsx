import React, { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton,
  InputAdornment, TextField, Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { apiPrivate, errorMessage } from '../api/axios';
import PageHeader from '../components/PageHeader';
import { useToast } from '../contexts/ToastContext';
import { useVendors } from '../lib/queries';
import { date, money } from '../lib/format';
import type { Vendor } from '../lib/types';

const vendorSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  email: z.string().trim().email('Invalid email').or(z.literal('')),
  phone: z.string(),
  gstNumber: z.string(),
  website: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  country: z.string(),
  notes: z.string(),
});

type VendorForm = z.infer<typeof vendorSchema>;
const EMPTY: VendorForm = { name: '', email: '', phone: '', gstNumber: '', website: '', addressLine1: '', city: '', country: '', notes: '' };

const Vendors: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Vendor | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');
  const { data: vendors, isLoading } = useVendors();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VendorForm>({ resolver: zodResolver(vendorSchema), defaultValues: EMPTY });

  const open = (vendor: Vendor | 'new') => {
    reset(vendor === 'new' ? EMPTY : Object.fromEntries(Object.keys(EMPTY).map(k => [k, (vendor as any)[k] ?? ''])) as VendorForm);
    save.reset();
    setEditing(vendor);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['vendors'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const save = useMutation({
    mutationFn: (data: VendorForm) =>
      editing && editing !== 'new' ? apiPrivate.put(`/vendors/${editing.id}`, data) : apiPrivate.post('/vendors', data),
    onSuccess: () => {
      invalidate();
      toast(editing === 'new' ? 'Vendor added' : 'Vendor updated');
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiPrivate.delete(`/vendors/${id}`),
    onSuccess: () => {
      invalidate();
      toast('Vendor removed', 'info');
    },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (vendors ?? []).filter(v => !q || [v.name, v.email, v.gstNumber, v.city].some(x => x?.toLowerCase().includes(q)));
  }, [vendors, search]);

  const columns: GridColDef<Vendor>[] = [
    { field: 'name', headerName: 'Vendor', flex: 1.4, minWidth: 180, renderCell: ({ value }) => <Box sx={{ fontWeight: 600 }}>{value}</Box> },
    { field: 'gstNumber', headerName: 'Tax ID', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 170 },
    { field: 'invoiceCount', headerName: 'Invoices', type: 'number', width: 100 },
    { field: 'totalSpend', headerName: 'Approved spend', type: 'number', width: 150, valueFormatter: (v: number) => money(v) },
    { field: 'lastInvoiceDate', headerName: 'Last invoice', width: 130, valueFormatter: (v: string | null) => (v ? date(v) : '—') },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: ({ row }) => (
        <Tooltip title="Remove">
          <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleting(row); }} aria-label={`Remove ${row.name}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Vendors"
        subtitle="Added automatically when you approve invoices."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => open('new')}>Add vendor</Button>}
      />

      <Card>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>
        <Box sx={{ height: 'calc(100vh - 290px)', minHeight: 400 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            onRowClick={({ row }) => open(row)}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            localeText={{ noRowsLabel: 'No vendors yet' }}
          />
        </Box>
      </Card>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit(d => save.mutate(d))}>
          <DialogTitle>{editing === 'new' ? 'Add vendor' : 'Edit vendor'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={12}>
                <TextField fullWidth autoFocus label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" {...register('phone')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Tax ID / GSTIN" {...register('gstNumber')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Website" {...register('website')} /></Grid>
              <Grid size={12}><TextField fullWidth label="Address" {...register('addressLine1')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="City" {...register('city')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Country" {...register('country')} /></Grid>
              <Grid size={12}><TextField fullWidth multiline minRows={2} label="Notes" {...register('notes')} /></Grid>
            </Grid>
            {save.isError && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(save.error)}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button color="inherit" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={save.isPending}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)}>
        <DialogTitle>Remove {deleting?.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>Existing invoices keep their data.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { remove.mutate(deleting!.id); setDeleting(null); }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;
