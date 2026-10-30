import React from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Grid, LinearProgress, Skeleton, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { palettes } from '../theme';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { apiPrivate } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useUpload } from '../contexts/UploadContext';
import { useInvoices } from '../lib/queries';
import { money, relativeTime, isPlaceholderNumber, type InvoiceStatus } from '../lib/format';
import StatusChip from '../components/StatusChip';

interface Analytics {
  currency: string;
  totals: {
    documents: number; processing: number; needsReview: number; approved: number; failed: number;
    spend: number; spendThisMonth: number; avgConfidence: number | null;
  };
  monthly: { month: string; key: string; spend: number }[];
  topVendors: { name: string; total: number }[];
  categories: { name: string; total: number }[];
  recent: { id: string; invoiceNumber: string; vendorName: string | null; fileName: string | null; total: number; currency: string; status: InvoiceStatus; createdAt: string }[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const Kpi = ({ label, value, hint, onClick, accent }: { label: string; value: React.ReactNode; hint?: string; onClick?: () => void; accent?: string }) => {
  const content = (
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5, color: accent }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </CardContent>
  );
  return (
    <Card component={motion.div} variants={item} sx={{ height: '100%' }}>
      {onClick ? <CardActionArea onClick={onClick} sx={{ height: '100%' }}>{content}</CardActionArea> : content}
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { openUpload } = useUpload();
  const navigate = useNavigate();
  const { mode, systemMode } = useColorScheme();
  const palette = palettes[(mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light'];
  const { data: invoices } = useInvoices();
  const processing = invoices?.some(i => ['QUEUED', 'OCR', 'AI'].includes(i.status));

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', invoices?.map(i => i.status).join()],
    queryFn: async () => (await apiPrivate.get<Analytics>('/dashboard/analytics')).data,
    placeholderData: prev => prev,
  });

  const cur = data?.currency || 'USD';
  const t = data?.totals;
  const empty = t && t.documents === 0;
  const maxVendor = Math.max(1, ...(data?.topVendors.map(v => v.total) ?? [1]));

  return (
    <Box component={motion.div} variants={container} initial="hidden" animate="show">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1">Hi {user?.firstName}</Typography>
        {t && !empty && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {t.needsReview ? `${t.needsReview} document${t.needsReview === 1 ? '' : 's'} waiting for review` : 'All caught up'}
            {processing ? ' · processing in the background' : ''}
          </Typography>
        )}
      </Box>

      {empty && (
        <Card component={motion.div} variants={item} sx={{ mb: 3, borderStyle: 'dashed', borderWidth: 1.5 }}>
          <CardActionArea onClick={() => openUpload()} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
            <CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5" sx={{ mt: 1 }}>Upload your first invoice</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Drop a PDF or photo. Details are extracted for you to check.</Typography>
          </CardActionArea>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }} data-tour="kpis">
        {isLoading || !t ? (
          [0, 1, 2, 3].map(i => (
            <Grid key={i} size={{ xs: 6, md: 3 }}><Skeleton variant="rounded" height={104} /></Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi label="Spend this month" value={money(t.spendThisMonth, cur)} hint={`${money(t.spend, cur)} all time`} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi
                label="Needs review"
                value={t.needsReview}
                hint={t.processing ? `${t.processing} processing` : undefined}
                accent={t.needsReview ? 'var(--mui-palette-warning-main)' : undefined}
                onClick={() => navigate('/invoices?status=review')}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi label="Approved" value={t.approved} hint={`${t.documents} documents total`} onClick={() => navigate('/invoices?status=approved')} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Kpi
                label="Extraction confidence"
                value={t.avgConfidence === null ? '—' : `${Math.round(t.avgConfidence)}%`}
                hint={t.failed ? `${t.failed} failed` : 'average'}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card component={motion.div} variants={item} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Monthly spend</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Approved invoices, last 12 months</Typography>
              <Box sx={{ height: 260, ml: -2 }}>
                {data && (
                  <ResponsiveContainer>
                    <AreaChart data={data.monthly} margin={{ top: 5, right: 8, bottom: 0, left: 8 }}>
                      <defs>
                        <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={palette.primary.main} stopOpacity={0.28} />
                          <stop offset="100%" stopColor={palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={palette.divider} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: palette.text.secondary, fontSize: 12 }} />
                      <YAxis tickLine={false} axisLine={false} width={64} tick={{ fill: palette.text.secondary, fontSize: 12 }} tickFormatter={v => money(v, cur, true)} />
                      <Tooltip
                        formatter={v => [money(Number(v), cur), 'Spend']}
                        contentStyle={{ background: palette.background.paper, border: `1px solid ${palette.divider}`, borderRadius: 10, color: palette.text.primary }}
                        labelStyle={{ color: palette.text.secondary }}
                        cursor={{ stroke: palette.divider }}
                      />
                      <Area type="monotone" dataKey="spend" stroke={palette.primary.main} strokeWidth={2.25} fill="url(#spendFill)" animationDuration={700} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card component={motion.div} variants={item} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Top vendors</Typography>
              {data?.topVendors.length ? (
                data.topVendors.map(v => (
                  <Box key={v.name} sx={{ mb: 1.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{v.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>{money(v.total, cur)}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(v.total / maxVendor) * 100} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Approve invoices to see vendor spend.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card component={motion.div} variants={item}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Recent documents</Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/invoices')}>All invoices</Button>
              </Box>
              {data?.recent.length ? (
                data.recent.map(r => (
                  <Box
                    key={r.id}
                    onClick={() => navigate(`/invoices/${r.id}`)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2, py: 1.25, px: 1, mx: -1, borderRadius: 2, cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{r.vendorName || r.fileName || 'Document'}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {isPlaceholderNumber(r.invoiceNumber) ? r.fileName : r.invoiceNumber} · {relativeTime(r.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                      {r.total ? money(r.total, r.currency) : ''}
                    </Typography>
                    <StatusChip status={r.status} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>Nothing yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
