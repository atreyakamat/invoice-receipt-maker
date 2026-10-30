import React, { useMemo, useState } from 'react';
import { Box, Button, Card, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import { useInvoices } from '../lib/queries';
import { useUpload } from '../contexts/UploadContext';
import { date, isPlaceholderNumber, isProcessing, money, relativeTime, type InvoiceStatus } from '../lib/format';
import type { InvoiceSummary } from '../lib/types';

const FILTERS: { key: string; label: string; match: (s: InvoiceStatus) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'review', label: 'Needs review', match: s => s === 'VALIDATION' },
  { key: 'processing', label: 'Processing', match: isProcessing },
  { key: 'approved', label: 'Approved', match: s => s === 'COMPLETED' },
  { key: 'rejected', label: 'Rejected', match: s => s === 'REJECTED' },
  { key: 'failed', label: 'Failed', match: s => s === 'FAILED' },
];

const columns: GridColDef<InvoiceSummary>[] = [
  {
    field: 'vendorName',
    headerName: 'Document',
    flex: 1.6,
    minWidth: 220,
    valueGetter: (_v, row) => row.vendorName || row.fileName || '',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', minWidth: 0 }}>
        {row.mimeType === 'application/pdf' ? (
          <PictureAsPdfOutlinedIcon fontSize="small" sx={{ color: 'error.main', opacity: 0.8 }} />
        ) : (
          <ImageOutlinedIcon fontSize="small" sx={{ color: 'primary.main', opacity: 0.8 }} />
        )}
        <Box sx={{ minWidth: 0, lineHeight: 1.3 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {row.vendorName || (isProcessing(row.status) ? 'Reading…' : 'Unknown vendor')}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {isPlaceholderNumber(row.invoiceNumber) ? row.fileName : `#${row.invoiceNumber}`}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: 'invoiceDate',
    headerName: 'Date',
    width: 130,
    valueGetter: (v: string) => (v ? new Date(v) : null),
    renderCell: ({ row }) => (isProcessing(row.status) ? '—' : date(row.invoiceDate)),
  },
  { field: 'category', headerName: 'Category', width: 150, valueGetter: (v: string | null) => v || '' },
  {
    field: 'total',
    headerName: 'Total',
    width: 140,
    type: 'number',
    valueGetter: (v: string) => Number(v),
    renderCell: ({ row }) => (isProcessing(row.status) ? '—' : money(row.total, row.currency)),
  },
  {
    field: 'confidence',
    headerName: 'Confidence',
    width: 120,
    type: 'number',
    valueGetter: (v: string) => Number(v),
    renderCell: ({ row }) => {
      if (isProcessing(row.status) || row.status === 'FAILED') return '—';
      const c = Number(row.confidence);
      return (
        <Typography variant="body2" sx={{ fontWeight: 600, color: c >= 80 ? 'success.main' : c >= 50 ? 'warning.main' : 'error.main' }}>
          {Math.round(c)}%
        </Typography>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: ({ row }) => <StatusChip status={row.status} />,
  },
  {
    field: 'createdAt',
    headerName: 'Uploaded',
    width: 130,
    valueGetter: (v: string) => new Date(v),
    renderCell: ({ row }) => <Typography variant="body2" color="text.secondary">{relativeTime(row.createdAt)}</Typography>,
  },
];

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { openUpload } = useUpload();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useInvoices();

  const filterKey = FILTERS.some(f => f.key === params.get('status')) ? params.get('status')! : 'all';
  const filter = FILTERS.find(f => f.key === filterKey)!;

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map(f => [f.key, data?.filter(i => f.match(i.status)).length ?? 0])),
    [data],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      i =>
        filter.match(i.status) &&
        (!q || [i.vendorName, i.invoiceNumber, i.fileName, i.category].some(v => v?.toLowerCase().includes(q))),
    );
  }, [data, filter, search]);

  return (
    <Box>
      <PageHeader
        title="Invoices"
        actions={
          <Button variant="outlined" startIcon={<CloudUploadOutlinedIcon />} onClick={() => openUpload()}>
            Upload
          </Button>
        }
      />

      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, pt: 1, flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={filterKey}
            onChange={(_e, key) => setParams(key === 'all' ? {} : { status: key }, { replace: true })}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ flexGrow: 1, minWidth: 0 }}
            data-tour="status-tabs"
          >
            {FILTERS.filter(f => f.key === 'all' || counts[f.key] > 0 || f.key === filterKey).map(f => (
              <Tab
                key={f.key}
                value={f.key}
                label={
                  <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                    {f.label}
                    <Box component="span" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>{counts[f.key]}</Box>
                  </Box>
                }
              />
            ))}
          </Tabs>
          <TextField
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 240 }, mb: { xs: 1, sm: 0 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
        </Box>

        <Box sx={{ height: 'calc(100vh - 250px)', minHeight: 420 }} data-tour="invoice-table">
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            rowHeight={60}
            onRowClick={({ row }) => navigate(`/invoices/${row.id}`)}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              columns: { columnVisibilityModel: { category: true } },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            localeText={{ noRowsLabel: data?.length ? 'No matching documents' : 'No documents yet. Upload one to get started.' }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Invoices;
