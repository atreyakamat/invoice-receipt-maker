import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 28 }: { size?: number }) => (
  <Box
    component="svg"
    viewBox="0 0 32 32"
    sx={{ width: size, height: size, flexShrink: 0 }}
    aria-hidden
  >
    <rect width="32" height="32" rx="8" fill="var(--mui-palette-primary-main)" />
    <path d="M10 8h9l4 4v12a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" fill="#fff" opacity=".95" />
    <path d="M12.5 15h7M12.5 18h7M12.5 21h4" stroke="var(--mui-palette-primary-main)" strokeWidth="1.6" strokeLinecap="round" />
  </Box>
);

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <Box component={Link} to="/dashboard" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.primary', textDecoration: 'none' }}>
    <LogoMark />
    {!compact && (
      <Typography sx={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
        InvoiceMaker
      </Typography>
    )}
  </Box>
);

export default Logo;
