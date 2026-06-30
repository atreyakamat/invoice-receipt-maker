import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPublic } from '../api/axios';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token found in URL.');
      return;
    }

    const verify = async () => {
      try {
        await apiPublic.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Verification failed. Token may be expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      {status === 'loading' && (
        <>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Verifying your email address...</Typography>
        </>
      )}

      {status === 'success' && (
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your email has been verified successfully!
          </Alert>
          <Button variant="contained" onClick={() => navigate('/login')} fullWidth>
            Proceed to Login
          </Button>
        </Box>
      )}

      {status === 'error' && (
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
          <Button variant="outlined" onClick={() => navigate('/login')} fullWidth>
            Back to Login
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VerifyEmail;
