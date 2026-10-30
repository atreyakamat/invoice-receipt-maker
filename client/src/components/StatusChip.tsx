import { Box, Chip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { STATUS, isProcessing, type InvoiceStatus } from '../lib/format';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const StatusChip = ({ status, size = 'small' }: { status: InvoiceStatus; size?: 'small' | 'medium' }) => {
  const meta = STATUS[status];
  return (
    <Chip
      size={size}
      color={meta.color}
      variant={status === 'COMPLETED' ? 'filled' : 'outlined'}
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {isProcessing(status) && (
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', animation: `${pulse} 1.2s ease-in-out infinite` }} />
          )}
          {meta.label}
        </Box>
      }
    />
  );
};

export default StatusChip;
