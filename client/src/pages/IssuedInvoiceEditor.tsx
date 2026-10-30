import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, IconButton, LinearProgress, MenuItem, TextField, Tooltip, Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { apiPrivate, errorMessage } from '../api/axios';
import { useToast } from '../contexts/ToastContext';
import { useCustomers, useMeta } from '../lib/queries';
import { CURRENCIES, ISSUED_STATUS, money, toInputDate } from '../lib/format';
import type { Customer, IssuedInvoiceDetail } from '../lib/types';
import SendInvoiceDialog from '../components/SendInvoiceDialog';

interface FormValues {
  customerId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  terms: string;
  discount: string;
  shipping: string;
  items: { description: string; quantity: string; unitPrice: string; taxRate: string }[];
}

const n = (v: string | number | null | undefined) => {
  const x = parseFloat(String(v ?? ''));
  return Number.isFinite(x) ? x : 0;
};
const r2 = (x: number) => Math.round(x * 100) / 100;
const str = (v: string | number | null | undefined) => (v === null || v === undefined ? '' : String(Number(v)));

const EMPTY: FormValues = {
  customerId: '',
  number: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  currency: 'USD',
  notes: '',
  terms: 'Payment due within 30 days.',
  discount: '0',
  shipping: '0',
  items: [{ description: '', quantity: '1', unitPrice: '0', taxRate: '0' }],
};

const toForm = (invoice: IssuedInvoiceDetail): FormValues => ({
  customerId: invoice.customer.id,
  number: invoice.number,
  issueDate: toInputDate(invoice.issueDate),
  dueDate: toInputDate(invoice.dueDate),
  currency: invoice.currency,
  notes: invoice.notes || '',
  terms: invoice.terms || '',
  discount: str(invoice.discount),
  shipping: str(invoice.shipping),
  items: invoice.items.map(i => ({ description: i.description, quantity: str(i.quantity), unitPrice: str(i.unitPrice), taxRate: str(i.taxRate) })),
});

const toPayload = (v: FormValues) => ({
  customerId: v.customerId,
  number: v.number.trim() || undefined,
  issueDate: v.issueDate,
  dueDate: v.dueDate || null,
  currency: v.currency,
  notes: v.notes.trim() || null,
  terms: v.terms.trim() || null,
  discount: n(v.discount),
  shipping: n(v.shipping),
  items: v.items
    .filter(i => i.description.trim())
    .map(i => ({ description: i.description.trim(), quantity: n(i.quantity), unitPrice: n(i.unitPrice), taxRate: n(i.taxRate) })),
});

const Totals = ({ control, currency }: { control: Control<FormValues>; currency: string }) => {
  const [items, discount, shipping] = useWatch({ control, name: ['items', 'discount', 'shipping'] });
  const subtotal = r2(items.reduce((s, i) => s + n(i.quantity) * n(i.unitPrice), 0));
  const tax = r2(items.reduce((s, i) => s + n(i.quantity) * n(i.unitPrice) * (n(i.taxRate) / 100), 0));
  const total = r2(subtotal + tax + n(shipping) - n(discount));

  const row = (label: string, value: string, bold = false) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant={bold ? 'subtitle1' : 'body2'} color={bold ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: bold ? 700 : 400 }}>{label}</Typography>
      <Typography variant={bold ? 'subtitle1' : 'body2'} sx={{ fontWeight: bold ? 700 : 500 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, minWidth: 240 }}>
      {row('Subtotal', money(subtotal, currency))}
      {n(discount) > 0 && row('Discount', `− ${money(n(discount), currency)}`)}
      {tax > 0 && row('Tax', money(tax, currency))}
      {n(shipping) > 0 && row('Shipping', money(n(shipping), currency))}
      <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
        {row('Total', money(total, currency), true)}
      </Box>
    </Box>
  );
};

const IssuedInvoiceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const isNew = !id || id === 'new';

  const { data: customers } = useCustomers();
  const { data: meta } = useMeta();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['issued-invoice', id],
    queryFn: async () => (await apiPrivate.get<IssuedInvoiceDetail>(`/issued-invoices/${id}`)).data,
    enabled: !isNew,
  });

  const { control, handleSubmit, reset, watch, setError, formState } = useForm<FormValues>({ defaultValues: EMPTY });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Seed form from existing invoice; new invoices default to the org currency when available.
  useEffect(() => {
    if (!isNew && invoice) reset(toForm(invoice));
    if (isNew) reset({ ...EMPTY, currency: watch('currency') || 'USD' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, invoice?.id]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['issued-invoices'] });
    queryClient.invalidateQueries({ queryKey: ['issued-invoice', id] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const save = useMutation({
    mutationFn: (v: FormValues) =>
      isNew
        ? apiPrivate.post<IssuedInvoiceDetail>('/issued-invoices', toPayload(v))
        : apiPrivate.put<IssuedInvoiceDetail>(`/issued-invoices/${id}`, toPayload(v)),
    onSuccess: res => {
      refresh();
      toast('Saved');
      if (isNew) navigate(`/issued/${res.data.id}`, { replace: true });
      else reset(toForm(res.data));
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const setStatus = useMutation({
    mutationFn: (status: string) => apiPrivate.post(`/issued-invoices/${id}/status`, { status }),
    onSuccess: (_r, status) => {
      refresh();
      toast(status === 'PAID' ? 'Marked as paid' : status === 'CANCELLED' ? 'Cancelled' : 'Updated');
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const remove_ = useMutation({
    mutationFn: () => apiPrivate.delete(`/issued-invoices/${id}`),
    onSuccess: () => {
      refresh();
      toast('Deleted', 'info');
      navigate('/issued');
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const requireFields = (v: FormValues) => {
    let ok = true;
    if (!v.customerId) { setError('customerId', { message: 'Pick a customer' }); ok = false; }
    if (!v.issueDate) { setError('issueDate', { message: 'Required' }); ok = false; }
    if (!v.items.some(i => i.description.trim())) { setError('items', { message: 'Add at least one line item' } as any); ok = false; }
    return ok;
  };

  const onSave = handleSubmit(v => {
    setActionError('');
    if (requireFields(v)) save.mutate(v);
  });

  const selectedCustomer = useMemo<Customer | null>(
    () => customers?.find(c => c.id === watch('customerId')) ?? invoice?.customer ?? null,
    [customers, invoice, watch('customerId')],
  );

  const busy = save.isPending || setStatus.isPending || remove_.isPending;
  const status = invoice?.status;
  const canEdit = status !== 'PAID';
  const currency = watch('currency') || 'USD';

  if (!isNew && isLoading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/issued')} aria-label="Back" sx={{ ml: -1 }}><ArrowBackIcon /></IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" component="h1" noWrap>
              {isNew ? 'New invoice' : invoice?.number}
            </Typography>
            {status && (
              <Chip
                size="small"
                color={ISSUED_STATUS[status].color}
                variant={status === 'PAID' ? 'filled' : 'outlined'}
                label={ISSUED_STATUS[status].label}
              />
            )}
          </Box>
          {!isNew && invoice && (
            <Typography variant="body2" color="text.secondary">
              {invoice.customer.name}
              {invoice.sentAt && ` · Sent ${new Date(invoice.sentAt).toLocaleDateString()}`}
              {invoice.paidAt && ` · Paid ${new Date(invoice.paidAt).toLocaleDateString()}`}
            </Typography>
          )}
        </Box>
        {!isNew && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Preview PDF">
              <IconButton onClick={() => window.open(`${apiPrivate.defaults.baseURL}/issued-invoices/${id}/pdf`, '_blank')} aria-label="Preview PDF">
                <PictureAsPdfOutlinedIcon />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Delete">
                <IconButton onClick={() => setConfirmDelete(true)} disabled={busy} aria-label="Delete"><DeleteOutlineIcon /></IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {status === 'PAID' && <Alert severity="success" sx={{ mb: 2 }}>This invoice is marked as paid. Delete to re-edit.</Alert>}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Controller
                  control={control}
                  name="customerId"
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={customers ?? []}
                      getOptionLabel={c => c.name}
                      value={customers?.find(c => c.id === field.value) ?? null}
                      onChange={(_e, v) => field.onChange(v?.id ?? '')}
                      disabled={!canEdit}
                      noOptionsText="Add a customer first"
                      renderInput={params => <TextField {...params} label="Customer" error={!!fieldState.error} helperText={fieldState.error?.message} />}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Controller
                  control={control}
                  name="number"
                  render={({ field }) => <TextField {...field} label="Invoice number" placeholder="Auto" fullWidth disabled={!canEdit} />}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Controller
                  control={control}
                  name="issueDate"
                  render={({ field, fieldState }) => <TextField {...field} label="Issue date" type="date" fullWidth disabled={!canEdit} error={!!fieldState.error} helperText={fieldState.error?.message} slotProps={{ inputLabel: { shrink: true } }} />}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => <TextField {...field} label="Due date" type="date" fullWidth disabled={!canEdit} slotProps={{ inputLabel: { shrink: true } }} />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <TextField {...field} select label="Currency" fullWidth disabled={!canEdit}>
                      {Array.from(new Set([field.value, ...CURRENCIES])).filter(Boolean).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Line items</Typography>
                {canEdit && (
                  <Button size="small" startIcon={<AddIcon />} onClick={() => append({ description: '', quantity: '1', unitPrice: '0', taxRate: '0' })}>
                    Add line
                  </Button>
                )}
              </Box>
              {fields.map((f, i) => (
                <Box
                  key={f.id}
                  component={motion.div}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 56px 90px 32px', sm: 'minmax(0, 1fr) 72px 110px 90px 32px' },
                    gap: 1, mb: 1, alignItems: 'center',
                  }}
                >
                  <Controller control={control} name={`items.${i}.description`} render={({ field }) => <TextField {...field} placeholder="Description" fullWidth disabled={!canEdit} />} />
                  <Controller control={control} name={`items.${i}.quantity`} render={({ field }) => <TextField {...field} placeholder="Qty" type="number" disabled={!canEdit} slotProps={{ htmlInput: { step: '1', min: 0, style: { textAlign: 'right' } } }} />} />
                  <Controller control={control} name={`items.${i}.unitPrice`} render={({ field }) => <TextField {...field} placeholder="Price" type="number" disabled={!canEdit} slotProps={{ htmlInput: { step: '0.01', min: 0, style: { textAlign: 'right' } } }} />} />
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Controller control={control} name={`items.${i}.taxRate`} render={({ field }) => <TextField {...field} placeholder="Tax %" type="number" fullWidth disabled={!canEdit} slotProps={{ htmlInput: { step: '0.1', min: 0, max: 100, style: { textAlign: 'right' } } }} />} />
                  </Box>
                  <IconButton size="small" onClick={() => remove(i)} aria-label="Remove line" disabled={!canEdit || fields.length === 1}><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Controller control={control} name="discount" render={({ field }) => <TextField {...field} label="Discount" type="number" fullWidth disabled={!canEdit} slotProps={{ htmlInput: { step: '0.01', min: 0, style: { textAlign: 'right' } } }} />} />
                  </Grid>
                  <Grid size={6}>
                    <Controller control={control} name="shipping" render={({ field }) => <TextField {...field} label="Shipping" type="number" fullWidth disabled={!canEdit} slotProps={{ htmlInput: { step: '0.01', min: 0, style: { textAlign: 'right' } } }} />} />
                  </Grid>
                  <Grid size={12}>
                    <Controller control={control} name="notes" render={({ field }) => <TextField {...field} label="Notes to customer" fullWidth multiline minRows={2} disabled={!canEdit} />} />
                  </Grid>
                  <Grid size={12}>
                    <Controller control={control} name="terms" render={({ field }) => <TextField {...field} label="Payment terms" fullWidth disabled={!canEdit} />} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Totals control={control} currency={currency} />
              </Grid>
            </Grid>

            {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
            {meta && !customers?.length && (
              <Alert severity="info" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={() => navigate('/customers')}>Add customer</Button>}>
                Add a customer before creating invoices.
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
              {!isNew && status !== 'PAID' && status !== 'CANCELLED' && (
                <Button color="inherit" onClick={() => setStatus.mutate('CANCELLED')} disabled={busy}>Cancel invoice</Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              {canEdit && (
                <Button variant="outlined" onClick={onSave} disabled={busy || (!isNew && !formState.isDirty)} startIcon={save.isPending ? <CircularProgress size={16} /> : null}>
                  {isNew ? 'Save draft' : 'Save'}
                </Button>
              )}
              {!isNew && status === 'SENT' && (
                <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => setStatus.mutate('PAID')} disabled={busy}>
                  Mark as paid
                </Button>
              )}
              {!isNew && canEdit && (
                <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={() => setSendOpen(true)} disabled={busy || formState.isDirty || !selectedCustomer?.email}>
                  {status === 'SENT' ? 'Send again' : 'Send'}
                </Button>
              )}
            </Box>
            {!isNew && canEdit && formState.isDirty && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                Save before sending
              </Typography>
            )}
            {!isNew && canEdit && !formState.isDirty && !selectedCustomer?.email && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                Add an email address for {selectedCustomer?.name || 'this customer'} to send
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <SendInvoiceDialog
        open={sendOpen}
        invoiceId={id || null}
        invoiceNumber={invoice?.number || ''}
        customerEmail={selectedCustomer?.email || null}
        onClose={() => setSendOpen(false)}
        onSent={() => refresh()}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete invoice {invoice?.number}?</DialogTitle>
        <DialogContent><DialogContentText>This cannot be undone.</DialogContentText></DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { setConfirmDelete(false); remove_.mutate(); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IssuedInvoiceEditor;
