import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { apiPrivate } from '../api/axios';

/** Fetches the original file with auth and shows it inline (PDF viewer or zoomable image). */
const DocumentPreview = ({ invoiceId, mimeType, fileName }: { invoiceId: string; mimeType: string | null; fileName: string | null }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const isPdf = mimeType === 'application/pdf';

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    apiPrivate
      .get(`/invoices/${invoiceId}/file`, { responseType: 'blob' })
      .then(res => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([res.data], { type: mimeType || res.data.type }));
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [invoiceId, mimeType]);

  return (
    <Box sx={{ position: 'relative', height: '100%', bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
      {!url && !failed && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box>
      )}
      {failed && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Typography color="text.secondary">Preview unavailable</Typography>
        </Box>
      )}
      {url && isPdf && <Box component="iframe" src={url} title={fileName || 'Document'} sx={{ border: 0, width: '100%', height: '100%', display: 'block' }} />}
      {url && !isPdf && (
        <Box sx={{ height: '100%', overflow: 'auto', display: zoom ? 'block' : 'grid', placeItems: 'center', p: zoom ? 0 : 2 }}>
          <Box
            component="img"
            src={url}
            alt={fileName || 'Document'}
            onClick={() => setZoom(z => !z)}
            sx={{
              display: 'block',
              cursor: zoom ? 'zoom-out' : 'zoom-in',
              ...(zoom ? { width: '180%', maxWidth: 'none' } : { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: 3, borderRadius: 1 }),
            }}
          />
        </Box>
      )}
      {url && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 0.25 }}>
          {!isPdf && (
            <Tooltip title={zoom ? 'Fit' : 'Zoom'}>
              <IconButton size="small" onClick={() => setZoom(z => !z)}>{zoom ? <ZoomOutIcon fontSize="small" /> : <ZoomInIcon fontSize="small" />}</IconButton>
            </Tooltip>
          )}
          <Tooltip title="Open in new tab">
            <IconButton size="small" component="a" href={url} target="_blank" rel="noopener"><OpenInNewIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default DocumentPreview;
