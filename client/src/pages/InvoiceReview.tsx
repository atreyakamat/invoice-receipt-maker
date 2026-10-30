import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, LinearProgress, MenuItem, Step,
  StepLabel, Stepper, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import { apiPrivate, errorMessage } from '../api/axios';
import { useToast } from '../contexts/ToastContext';
import { useInvoices, useMeta, useVendors } from '../lib/queries';
import { CURRENCIES, isPlaceholderNumber, isProcessing, toInputDate } from '../lib/format';
import type { InvoiceDetail } from '../lib/types';
import StatusChip from '../components/StatusChip';
import DocumentPreview from '../components/DocumentPreview';

interface FormValues {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  category: string;
  subtotal: string;
  tax: string;
  discount: string;
  shipping: string;
  total: string;
  notes: string;
  items: { description: string; quantity: string; unitPrice: string; total: string }[];
}

const n = (v: string | number | null | undefined) => {
  const x = parseFloat(String(v ?? ''));
  return Number.isFinite(x) ? x : 0;
};
const r2 = (x: number) => Math.round(x * 100) / 100;
const str = (v: string | number | null | undefined) => (v === null || v === undefined ? '' : String(Number(v)));

const toForm = (inv: InvoiceDetail): FormValues => ({
  vendorName: inv.vendor?.name || inv.aiResult?.vendorName || '',
  invoiceNumber: isPlaceholderNumber(inv.invoiceNumber) ? '' : inv.invoiceNumber,
  invoiceDate: toInputDate(inv.invoiceDate),
  dueDate: toInputDate(inv.dueDate),
  currency: inv.currency,
  category: inv.category || '',
  subtotal: str(inv.subtotal),
  tax: str(inv.tax),
  discount: str(inv.discount),
  shipping: str(inv.shipping),
  total: str(inv.total),
  notes: inv.notes || '',
  items: inv.items.map(i => ({ description: i.description, quantity: str(i.quantity), unitPrice: str(i.unitPrice), total: str(i.total) })),
});

const toPayload = (v: FormValues) => ({
  vendorName: v.vendorName.trim(),
  invoiceNumber: v.invoiceNumber.trim(),
  invoiceDate: v.invoiceDate,
  dueDate: v.dueDate || null,
  currency: v.currency,
  category: v.category.trim() || null,
  subtotal: n(v.subtotal),
  tax: n(v.tax),
  discount: n(v.discount),
  shipping: n(v.shipping),
  total: n(v.total),
  notes: v.notes.trim() || null,
  items: v.items
    .filter(i => i.description.trim())
    .map(i => ({ description: i.description.trim(), quantity: n(i.quantity), unitPrice: n(i.unitPrice), total: n(i.total) })),
});

const STEPS = ['Uploaded', 'Reading text', 'Extracting fields', 'Ready'];
const stepIndex = { QUEUED: 0, OCR: 1, AI: 2 } as Record<string, number>;

const ProcessingState = ({ status }: { status: string }) => (
  <Card sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
    <CircularProgress size={36} sx={{ mb: 2 }} />
    <Typography variant="h5">Processing</Typography>
    <Typography color="text.secondary" sx={{ mb: 4 }}>This usually takes a few seconds. You can leave this page.</Typography>
    <Stepper activeStep={(stepIndex[status] ?? 0) + 1} alternativeLabel>
      {STEPS.map(s => (
        <Step key={s}><StepLabel>{s}</StepLabel></Step>
      ))}
    </Stepper>
  </Card>
);

/** Shows when subtotal + tax + shipping − discount doesn't match total, with a one-click fix. */
const TotalsCheck = ({ control, onFix }: { control: Control<FormValues>; onFix: (field: 'total' | 'subtotal', value: number) => void }) => {
  const [subtotal, tax, discount, shipping, total, items] = useWatch({ control, name: ['subtotal', 'tax', 'discount', 'shipping', 'total', 'items'] });
  const expected = r2(n(subtotal) + n(tax) + n(shipping) - n(discount));
  const itemsSum = r2(items.reduce((s, i) => s + n(i.total), 0));
  const hasItems = items.some(i => i.description.trim());

  if (hasItems && Math.abs(itemsSum - n(subtotal)) > 0.01) {
    return (
      <Alert severity="info" sx={{ mt: 2 }} action={<Button size="small" color="inherit" onClick={() => onFix('subtotal', itemsSum)}>Use {itemsSum.toFixed(2)}</Button>}>
        Line items add up to {itemsSum.toFixed(2)}
      </Alert>
    );
  }
  if (Math.abs(expected - n(total)) > 0.01) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }} action={<Button size="small" color="inherit" onClick={() => onFix('total', expected)}>Use {expected.toFixed(2)}</Button>}>
        Amounts add up to {expected.toFixed(2)}, not {n(total).toFixed(2)}
      </Alert>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 2, color: 'success.main' }}>
      <CheckIcon fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>Totals add up</Typography>
    </Box>
  );
};

const MoneyField = ({ control, name, label, bold }: { control: Control<FormValues>; name: 'subtotal' | 'tax' | 'discount' | 'shipping' | 'total'; label: string; bold?: boolean }) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <TextField
        {...field}
        label={label}
        type="number"
        fullWidth
        slotProps={{ htmlInput: { step: '0.01', min: 0, style: { textAlign: 'right', fontWeight: bold ? 700 : undefined } } }}
      />
    )}
  />
);

const InvoiceReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => (await apiPrivate.get<InvoiceDetail>(`/invoices/${id}`)).data,
    refetchInterval: q => (q.state.data && isProcessing(q.state.data.status) ? 1500 : false),
  });
  const { data: invoices } = useInvoices();
  const { data: vendors } = useVendors();
  const { data: meta } = useMeta();

  const processing = invoice ? isProcessing(invoice.status) : false;
  const { control, handleSubmit, reset, setValue, setError, getValues, formState } = useForm<FormValues>({
    defaultValues: invoice ? toForm(invoice) : undefined,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Load extracted values once processing finishes (or a different invoice is opened).
  const loadedKey = invoice && !processing ? `${invoice.id}:${invoice.status === 'FAILED' ? 'f' : 'ok'}` : null;
  useEffect(() => {
    if (invoice && loadedKey) reset(toForm(invoice));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedKey]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['vendors'] });
  };

  const nextToReview = useMemo(
    () => invoices?.find(i => i.status === 'VALIDATION' && i.id !== id)?.id,
    [invoices, id],
  );

  const save = useMutation({
    mutationFn: (v: FormValues) => apiPrivate.put(`/invoices/${id}`, toPayload(v)),
    onSuccess: (_r, v) => {
      reset(v);
      refresh();
      toast('Saved');
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const review = useMutation({
    mutationFn: ({ status, values }: { status: 'APPROVED' | 'REJECTED'; values?: FormValues }) =>
      apiPrivate.post(`/invoices/${id}/validate`, { status, data: values ? toPayload(values) : undefined }),
    onSuccess: (_r, { status }) => {
      refresh();
      toast(status === 'APPROVED' ? (nextToReview ? 'Approved · next document' : 'Approved') : 'Rejected', status === 'APPROVED' ? 'success' : 'info');
      navigate(nextToReview ? `/invoices/${nextToReview}` : '/invoices');
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const reprocess = useMutation({
    mutationFn: () => apiPrivate.post(`/invoices/${id}/reprocess`),
    onSuccess: refresh,
    onError: e => setActionError(errorMessage(e)),
  });

  const remove_ = useMutation({
    mutationFn: () => apiPrivate.delete(`/invoices/${id}`),
    onSuccess: () => {
      refresh();
      toast('Deleted', 'info');
      navigate('/invoices');
    },
    onError: e => setActionError(errorMessage(e)),
  });

  const requireFields = (v: FormValues, forApproval: boolean) => {
    let ok = true;
    if (!v.invoiceNumber.trim()) { setError('invoiceNumber', { message: 'Required' }); ok = false; }
    if (!v.invoiceDate) { setError('invoiceDate', { message: 'Required' }); ok = false; }
    if (forApproval && !v.vendorName.trim()) { setError('vendorName', { message: 'Required to approve' }); ok = false; }
    return ok;
  };

  const onSave = handleSubmit(v => {
    setActionError('');
    if (requireFields(v, false)) save.mutate(v);
  });
  const onApprove = handleSubmit(v => {
    setActionError('');
    if (requireFields(v, true)) review.mutate({ status: 'APPROVED', values: v });
  });
  const onReject = () => {
    setActionError('');
    review.mutate({ status: 'REJECTED' });
  };

  const busy = save.isPending || review.isPending || reprocess.isPending || remove_.isPending;
  const editable = invoice && !processing;

  // Ctrl/⌘+S saves, Ctrl/⌘+Enter approves.
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!editable || busy || !(e.ctrlKey || e.metaKey)) return;
      if (e.key === 's') { e.preventDefault(); onSave(); }
      if (e.key === 'Enter' && invoice?.status !== 'COMPLETED') { e.preventDefault(); onApprove(); }
    },
    [editable, busy, onSave, onApprove, invoice?.status],
  );
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  if (isLoading) return <LinearProgress />;
  if (error || !invoice) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/invoices')}>Back</Button>}>
        {errorMessage(error, 'Invoice not found')}
      </Alert>
    );
  }

  const warnings = (invoice.validation?.warnings ?? []).filter(Boolean);
  const confidence = Number(invoice.confidence);
  const reviewed = invoice.status === 'COMPLETED' || invoice.status === 'REJECTED';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/invoices')} aria-label="Back to invoices" sx={{ ml: -1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" component="h1" noWrap>
              {invoice.vendor?.name || invoice.aiResult?.vendorName || invoice.fileName || 'Document'}
            </Typography>
            <StatusChip status={invoice.status} />
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap>
            {invoice.fileName}
            {!processing && invoice.status !== 'FAILED' && ` · ${Math.round(confidence)}% confidence`}
            {invoice.aiJob?.model && !processing && ` · ${invoice.aiJob.model === 'rules' ? 'rule-based' : invoice.aiJob.model}`}
          </Typography>
        </Box>
        {editable && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Delete">
              <IconButton onClick={() => setConfirmDelete(true)} disabled={busy} aria-label="Delete"><DeleteOutlineIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Run extraction again">
              <IconButton onClick={() => reprocess.mutate()} disabled={busy} aria-label="Reprocess"><ReplayIcon /></IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 88 }, height: { xs: '55vh', md: 'calc(100vh - 140px)' } }}>
            <DocumentPreview invoiceId={invoice.id} mimeType={invoice.mimeType} fileName={invoice.fileName} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {processing ? (
            <ProcessingState status={invoice.status} />
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {invoice.status === 'FAILED' && (
                <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => reprocess.mutate()}>Retry</Button>}>
                  Processing failed{invoice.notes ? `: ${invoice.notes}` : ''}. Retry or enter the details manually.
                </Alert>
              )}
              {!reviewed && warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {warnings.map(w => <div key={w}>{w}</div>)}
                </Alert>
              )}
              {reviewed && (
                <Alert severity={invoice.status === 'COMPLETED' ? 'success' : 'info'} sx={{ mb: 2 }}>
                  {invoice.status === 'COMPLETED' ? 'Approved. Changes you save update the record.' : 'Rejected. You can still edit and approve.'}
                </Alert>
              )}

              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Controller
                        control={control}
                        name="vendorName"
                        render={({ field, fieldState }) => (
                          <Autocomplete
                            freeSolo
                            options={vendors?.map(v => v.name) ?? []}
                            value={field.value}
                            onChange={(_e, v) => field.onChange(v ?? '')}
                            onInputChange={(_e, v) => field.onChange(v)}
                            renderInput={params => (
                              <TextField {...params} label="Vendor" error={!!fieldState.error} helperText={fieldState.error?.message} autoFocus={isDesktop} />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="invoiceNumber"
                        render={({ field, fieldState }) => (
                          <TextField {...field} label="Invoice number" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Autocomplete
                            freeSolo
                            options={meta?.categories ?? []}
                            value={field.value}
                            onChange={(_e, v) => field.onChange(v ?? '')}
                            onInputChange={(_e, v) => field.onChange(v)}
                            renderInput={params => <TextField {...params} label="Category" />}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Controller
                        control={control}
                        name="invoiceDate"
                        render={({ field, fieldState }) => (
                          <TextField {...field} label="Invoice date" type="date" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} slotProps={{ inputLabel: { shrink: true } }} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Controller
                        control={control}
                        name="dueDate"
                        render={({ field }) => <TextField {...field} label="Due date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        control={control}
                        name="currency"
                        render={({ field }) => (
                          <TextField {...field} select label="Currency" fullWidth>
                            {Array.from(new Set([field.value, ...CURRENCIES])).filter(Boolean).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>Line items</Typography>
                      <Button size="small" startIcon={<AddIcon />} onClick={() => append({ description: '', quantity: '1', unitPrice: '', total: '' })}>
                        Add line
                      </Button>
                    </Box>
                    {fields.length === 0 && (
                      <Typography variant="body2" color="text.secondary">None. Optional.</Typography>
                    )}
                    {fields.map((f, i) => (
                      <Box
                        key={f.id}
                        component={motion.div}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 64px 96px 32px', sm: '1fr 72px 110px 110px 32px' }, gap: 1, mb: 1, alignItems: 'center' }}
                      >
                        <Controller control={control} name={`items.${i}.description`} render={({ field }) => <TextField {...field} placeholder="Description" fullWidth />} />
                        <Controller
                          control={control}
                          name={`items.${i}.quantity`}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              placeholder="Qty"
                              type="number"
                              onChange={e => {
                                field.onChange(e);
                                setValue(`items.${i}.total`, str(r2(n(e.target.value) * n(getValues(`items.${i}.unitPrice`)))));
                              }}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name={`items.${i}.unitPrice`}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              placeholder="Price"
                              type="number"
                              onChange={e => {
                                field.onChange(e);
                                setValue(`items.${i}.total`, str(r2(n(getValues(`items.${i}.quantity`)) * n(e.target.value))));
                              }}
                            />
                          )}
                        />
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                          <Controller control={control} name={`items.${i}.total`} render={({ field }) => <TextField {...field} placeholder="Amount" type="number" fullWidth />} />
                        </Box>
                        <IconButton size="small" onClick={() => remove(i)} aria-label="Remove line"><CloseIcon fontSize="small" /></IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}><MoneyField control={control} name="subtotal" label="Subtotal" /></Grid>
                    <Grid size={{ xs: 6, sm: 3 }}><MoneyField control={control} name="tax" label="Tax" /></Grid>
                    <Grid size={{ xs: 6, sm: 3 }}><MoneyField control={control} name="discount" label="Discount" /></Grid>
                    <Grid size={{ xs: 6, sm: 3 }}><MoneyField control={control} name="shipping" label="Shipping" /></Grid>
                    <Grid size={12}><MoneyField control={control} name="total" label="Total" bold /></Grid>
                  </Grid>
                  <TotalsCheck control={control} onFix={(field, value) => setValue(field, value.toFixed(2), { shouldDirty: true })} />

                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline minRows={2} sx={{ mt: 3 }} />}
                  />

                  {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}

                  <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                    {invoice.status !== 'REJECTED' && (
                      <Button color="inherit" onClick={onReject} disabled={busy}>Reject</Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant={invoice.status === 'COMPLETED' ? 'contained' : 'outlined'} onClick={onSave} disabled={busy || !formState.isDirty}>
                      Save
                    </Button>
                    {invoice.status !== 'COMPLETED' && (
                      <Tooltip title="Ctrl + Enter">
                        <span>
                          <Button variant="contained" color="success" onClick={onApprove} disabled={busy} startIcon={review.isPending ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}>
                            Approve
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {invoice.ocrResult?.rawText && (
                <Accordion disableGutters variant="outlined" sx={{ mt: 2, borderRadius: '14px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Extracted text</Typography>
                    <Chip size="small" label={`${Math.round(Number(invoice.ocrResult.confidence))}% OCR`} sx={{ ml: 1.5 }} />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 12.5, color: 'text.secondary', maxHeight: 320, overflow: 'auto' }}>
                      {invoice.ocrResult.rawText}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </motion.div>
          )}
        </Grid>
      </Grid>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete this document?</DialogTitle>
        <DialogContent>
          <DialogContentText>It will be removed from invoices, dashboards and exports.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { setConfirmDelete(false); remove_.mutate(); }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoiceReview;
