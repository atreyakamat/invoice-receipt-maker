import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import { apiPrivate, errorMessage } from '../api/axios';
import PageHeader from '../components/PageHeader';
import { useInvoices } from '../lib/queries';
import { money } from '../lib/format';

type Scope = 'approved' | 'all';

const Exports: React.FC = () => {
  const [scope, setScope] = useState<Scope>('approved');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState<'csv' | 'excel' | null>(null);
  const [error, setError] = useState('');
  const { data: invoices } = useInvoices();

  // Mirrors the server-side filter so the count is shown before downloading.
  const matching = useMemo(
    () =>
      (invoices ?? []).filter(i => {
        const statusOk = scope === 'all' ? ['COMPLETED', 'VALIDATION', 'REJECTED'].includes(i.status) : i.status === 'COMPLETED';
        const d = i.invoiceDate.slice(0, 10);
        return statusOk && (!from || d >= from) && (!to || d <= to);
      }),
    [invoices, scope, from, to],
  );
  const currencies = new Set(matching.map(i => i.currency));
  const sum = matching.reduce((s, i) => s + Number(i.total), 0);

  const download = async (format: 'csv' | 'excel') => {
    setBusy(format);
    setError('');
    try {
      const res = await apiPrivate.get(`/exports/${format}`, { params: { status: scope, from: from || undefined, to: to || undefined }, responseType: 'blob' });
      const name = /filename=([^;]+)/.exec(res.headers['content-disposition'] || '')?.[1] || `invoices.${format === 'csv' ? 'csv' : 'xlsx'}`;
      const url = URL.createObjectURL(res.data);
      const a = Object.assign(document.createElement('a'), { href: url, download: name });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(errorMessage(err, 'Export failed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Exports" subtitle="Accounting-ready files of your reviewed invoices." />

      <Card sx={{ maxWidth: 720 }} data-tour="export-card">
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Include</Typography>
          <ToggleButtonGroup exclusive value={scope} onChange={(_e, v) => v && setScope(v)} size="small" sx={{ mb: 3 }}>
            <ToggleButton value="approved" sx={{ px: 2 }}>Approved only</ToggleButton>
            <ToggleButton value="all" sx={{ px: 2 }}>All reviewed</ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Invoice date</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField type="date" label="To" value={to} onChange={e => setTo(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            {(from || to) && (
              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button size="small" color="inherit" onClick={() => { setFrom(''); setTo(''); }}>Clear dates</Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', mb: 3 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {matching.length} invoice{matching.length === 1 ? '' : 's'}
              {matching.length > 0 && currencies.size === 1 && ` · ${money(sum, [...currencies][0])}`}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<DescriptionOutlinedIcon />} onClick={() => download('csv')} disabled={!!busy || !matching.length}>
              {busy === 'csv' ? 'Preparing…' : 'Download CSV'}
            </Button>
            <Button variant="outlined" startIcon={<GridOnOutlinedIcon />} onClick={() => download('excel')} disabled={!!busy || !matching.length}>
              {busy === 'excel' ? 'Preparing…' : 'Download Excel'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Exports;
