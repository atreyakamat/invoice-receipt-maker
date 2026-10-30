import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { LogoMark } from './Logo';

const STEPS = [
  { icon: <CloudUploadOutlinedIcon />, title: 'Upload', text: 'PDFs and photos of invoices or receipts' },
  { icon: <FactCheckOutlinedIcon />, title: 'Review', text: 'Extracted fields next to the original' },
  { icon: <FileDownloadOutlinedIcon />, title: 'Export', text: 'Clean CSV or Excel for your books' },
];

const AuthShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.default' }}>
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 6,
        color: '#fff',
        background: 'linear-gradient(150deg, #0F3D7A 0%, #1976D2 55%, #5B2A86 130%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', right: -180, bottom: -200, background: 'radial-gradient(circle, rgba(255,255,255,.14), transparent 65%)' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, position: 'relative' }}>
        <LogoMark size={32} />
        <Typography sx={{ fontWeight: 700, fontSize: 19 }}>InvoiceMaker</Typography>
      </Box>
      <Box sx={{ position: 'relative', maxWidth: 420 }}>
        <Typography sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', mb: 4 }}>
          Invoices in, clean data out.
        </Typography>
        {STEPS.map((s, i) => (
          <Box
            key={s.title}
            component={motion.div}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center' }}
          >
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.14)' }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{s.title}</Typography>
              <Typography sx={{ opacity: 0.8, fontSize: 14 }}>{s.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Typography sx={{ opacity: 0.6, fontSize: 13, position: 'relative' }}>Self-hosted · your documents stay on your server</Typography>
    </Box>

    <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2.5, sm: 4 } }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} sx={{ width: '100%', maxWidth: 400 }}>
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.25, mb: 4 }}>
          <LogoMark />
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>InvoiceMaker</Typography>
        </Box>
        <Typography variant="h3" component="h1">{title}</Typography>
        {subtitle && <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3.5 }}>{subtitle}</Typography>}
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthShell;
