import React, { useMemo, useState } from 'react';
import { Box, Button, Card, Chip, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/PageHeader';
import { useIssuedInvoices } from '../lib/queries';
import { date, money, ISSUED_STATUS, relativeTime, type IssuedStatus } from '../lib/format';
import type { IssuedInvoiceSummary } from '../lib/types';

const FILTERS: { key: string; label: string; match: (s: IssuedStatus) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'draft', label: 'Drafts', match: s => s === 'DRAFT' },
  { key: 'sent', label: 'Sent', match: s => s === 'SENT' },
  { key: 'paid', label: 'Paid', match: s => s === 'PAID' },
];

const columns: GridColDef<IssuedInvoiceSummary>[] = [
  {
    field: 'customer',
    headerName: 'Customer',
    flex: 1.5,
    minWidth: 200,
    valueGetter: (_v, row) => row.customer?.name || '',
    renderCell: ({ row }) => (
      <Box sx={{ lineHeight: 1.3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.customer?.name}</Typography>
        <Typography variant="caption" color="text.secondary">#{row.number}</Typography>
      </Box>
    ),
  },
  { field: 'issueDate', headerName: 'Issued', width: 130, valueGetter: (v: string) => (v ? new Date(v) : null), renderCell: ({ row }) => date(row.issueDate) },
  { field: 'dueDate', headerName: 'Due', width: 130, valueGetter: (v: string | null) => (v ? new Date(v) : null), renderCell: ({ row }) => (row.dueDate ? date(row.dueDate) : '—') },
  {
    field: 'total',
    headerName: 'Amount',
    width: 150,
    type: 'number',
    valueGetter: (v: string) => Number(v),
    renderCell: ({ row }) => <Typography sx={{ fontWeight: 600 }}>{money(row.total, row.currency)}</Typography>,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 110,
    renderCell: ({ row }) => {
      const meta = ISSUED_STATUS[row.status];
      return <Chip size="small" color={meta.color} variant={row.status === 'PAID' ? 'filled' : 'outlined'} label={meta.label} />;
    },
  },
  {
    field: 'createdAt',
    headerName: 'Updated',
    width: 130,
    valueGetter: (v: string) => new Date(v),
    renderCell: ({ row }) => <Typography variant="body2" color="text.secondary">{relativeTime(row.createdAt)}</Typography>,
  },
];

const IssuedInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useIssuedInvoices();

  const filterKey = FILTERS.some(f => f.key === params.get('status')) ? params.get('status')! : 'all';
  const filter = FILTERS.find(f => f.key === filterKey)!;

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map(f => [f.key, data?.filter(i => f.match(i.status)).length ?? 0])),
    [data],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      i => filter.match(i.status) && (!q || [i.customer?.name, i.number].some(v => v?.toLowerCase().includes(q))),
    );
  }, [data, filter, search]);

  return (
    <Box>
      <PageHeader
        title="Issued invoices"
        subtitle="Create invoices and send them to your customers."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/issued/new')}>New invoice</Button>}
      />

      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, pt: 1, flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={filterKey}
            onChange={(_e, key) => setParams(key === 'all' ? {} : { status: key }, { replace: true })}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ flexGrow: 1, minWidth: 0 }}
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

        <Box sx={{ height: 'calc(100vh - 290px)', minHeight: 420 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            rowHeight={58}
            onRowClick={({ row }) => navigate(`/issued/${row.id}`)}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            localeText={{ noRowsLabel: data?.length ? 'No matching invoices' : 'No invoices yet. Create one to get started.' }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default IssuedInvoices;
