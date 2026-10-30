import React, { useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepContent,
  StepLabel, Stepper, Typography,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { apiPrivate, errorMessage } from '../api/axios';

interface Props {
  open: boolean;
  invoiceId: string | null;
  invoiceNumber: string;
  customerEmail: string | null;
  onClose: () => void;
  onSent: () => void;
}

const SendInvoiceDialog: React.FC<Props> = ({ open, invoiceId, invoiceNumber, customerEmail, onClose, onSent }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [gmailUrl, setGmailUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');

  // Reset state each time the dialog opens.
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setError('');
      setBusy(false);
      setDownloaded(false);
      setGmailUrl(null);
    }
  }, [open]);

  const close = () => {
    if (!busy) onClose();
  };

  const downloadAndCompose = async () => {
    if (!invoiceId) return;
    setBusy(true);
    setError('');
    try {
      // 1. Fetch the compose URL and PDF filename.
      const meta = await apiPrivate.get(`/issued-invoices/${invoiceId}/send-email`);
      const { url, pdfFileName: name } = meta.data as { url: string; pdfFileName: string };
      setPdfFileName(name);

      // 2. Download the PDF so the user can drag it into the Gmail draft.
      const pdf = await apiPrivate.get(`/issued-invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([pdf.data], { type: 'application/pdf' }));
      const a = Object.assign(document.createElement('a'), { href: blobUrl, download: name });
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      setDownloaded(true);

      // 3. Open Gmail compose in a new tab under the user's current Gmail session.
      setGmailUrl(url);
      window.open(url, '_blank', 'noopener,noreferrer');
      setStep(1);
    } catch (err) {
      setError(errorMessage(err, 'Could not open Gmail'));
    } finally {
      setBusy(false);
    }
  };

  const confirmSent = async () => {
    if (!invoiceId) return;
    setBusy(true);
    setError('');
    try {
      await apiPrivate.post(`/issued-invoices/${invoiceId}/status`, { status: 'SENT' });
      onSent();
      onClose();
    } catch (err) {
      setError(errorMessage(err, 'Could not mark as sent'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Send invoice {invoiceNumber} via Gmail</DialogTitle>
      <DialogContent>
        {!customerEmail && (
          <Alert severity="warning" sx={{ mb: 2 }}>Add an email address for this customer first.</Alert>
        )}
        {customerEmail && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Gmail opens in a new tab with the message to <Chip label={customerEmail} size="small" sx={{ fontWeight: 500 }} /> ready to send. You just drag the downloaded PDF into the draft.
            </Typography>
            <Stepper activeStep={step} orientation="vertical" sx={{ mt: 2 }}>
              <Step>
                <StepLabel>Download the PDF and open Gmail</StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    The invoice PDF saves to your downloads, and a Gmail compose window opens with the message prefilled.
                  </Typography>
                  <Button variant="contained" startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <OpenInNewIcon />} onClick={downloadAndCompose} disabled={busy}>
                    {busy ? 'Opening…' : 'Download and open Gmail'}
                  </Button>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Attach the PDF in Gmail</StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    In the Gmail tab, drag <strong>{pdfFileName}</strong> from your downloads into the message, then click Send.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {gmailUrl && (
                      <Button size="small" variant="text" startIcon={<OpenInNewIcon />} component="a" href={gmailUrl} target="_blank" rel="noopener">
                        Reopen Gmail
                      </Button>
                    )}
                    {downloaded && (
                      <Button size="small" variant="text" startIcon={<FileDownloadOutlinedIcon />} onClick={downloadAndCompose} disabled={busy}>
                        Download PDF again
                      </Button>
                    )}
                  </Box>
                  <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={confirmSent} disabled={busy}>
                    I sent it
                  </Button>
                </StepContent>
              </Step>
            </Stepper>
          </>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={close} disabled={busy}>{step === 1 ? 'Close' : 'Cancel'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendInvoiceDialog;
