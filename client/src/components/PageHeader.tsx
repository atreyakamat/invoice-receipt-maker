import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, actions }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="h3" component="h1">{title}</Typography>
      {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>{actions}</Box>}
  </Box>
);

export default PageHeader;
