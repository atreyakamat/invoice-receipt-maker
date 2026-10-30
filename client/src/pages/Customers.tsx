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
import { useCustomers } from '../lib/queries';
import { money } from '../lib/format';
import type { Customer } from '../lib/types';

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  email: z.string().trim().email('Invalid email').or(z.literal('')),
  phone: z.string(),
  taxId: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  notes: z.string(),
});

type Form = z.infer<typeof schema>;
const EMPTY: Form = { name: '', email: '', phone: '', taxId: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', notes: '' };

const Customers: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useCustomers();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  const open = (customer: Customer | 'new') => {
    reset(customer === 'new' ? EMPTY : (Object.fromEntries(Object.keys(EMPTY).map(k => [k, (customer as any)[k] ?? ''])) as Form));
    save.reset();
    setEditing(customer);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const save = useMutation({
    mutationFn: (data: Form) =>
      editing && editing !== 'new' ? apiPrivate.put(`/customers/${editing.id}`, data) : apiPrivate.post('/customers', data),
    onSuccess: () => {
      invalidate();
      toast(editing === 'new' ? 'Customer added' : 'Customer updated');
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiPrivate.delete(`/customers/${id}`),
    onSuccess: () => {
      invalidate();
      toast('Customer removed', 'info');
    },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (customers ?? []).filter(c => !q || [c.name, c.email, c.taxId, c.city].some(x => x?.toLowerCase().includes(q)));
  }, [customers, search]);

  const columns: GridColDef<Customer>[] = [
    { field: 'name', headerName: 'Customer', flex: 1.4, minWidth: 180, renderCell: ({ value }) => <Box sx={{ fontWeight: 600 }}>{value}</Box> },
    { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 180 },
    { field: 'invoiceCount', headerName: 'Invoices', type: 'number', width: 100 },
    { field: 'totalBilled', headerName: 'Billed', type: 'number', width: 130, valueFormatter: (v: number) => money(v) },
    { field: 'outstanding', headerName: 'Outstanding', type: 'number', width: 140, valueFormatter: (v: number) => money(v) },
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
        title="Customers"
        subtitle="People and businesses you invoice."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => open('new')}>Add customer</Button>}
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
            localeText={{ noRowsLabel: 'No customers yet' }}
          />
        </Box>
      </Card>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit(d => save.mutate(d))}>
          <DialogTitle>{editing === 'new' ? 'Add customer' : 'Edit customer'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={12}>
                <TextField fullWidth autoFocus label="Name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" {...register('email')} error={!!errors.email} helperText={errors.email?.message || 'Needed to send invoices via Gmail'} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" {...register('phone')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Tax ID / GSTIN" {...register('taxId')} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Country" {...register('country')} /></Grid>
              <Grid size={12}><TextField fullWidth label="Address line 1" {...register('addressLine1')} /></Grid>
              <Grid size={12}><TextField fullWidth label="Address line 2" {...register('addressLine2')} /></Grid>
              <Grid size={{ xs: 12, sm: 5 }}><TextField fullWidth label="City" {...register('city')} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="State / Region" {...register('state')} /></Grid>
              <Grid size={{ xs: 12, sm: 3 }}><TextField fullWidth label="Postal code" {...register('postalCode')} /></Grid>
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
          <DialogContentText>Issued invoices keep their data.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { remove.mutate(deleting!.id); setDeleting(null); }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
