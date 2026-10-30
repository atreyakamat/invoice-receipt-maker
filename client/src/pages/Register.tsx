import React, { useState } from 'react';
import { Alert, Button, Link as MuiLink, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { errorMessage } from '../api/axios';
import { CURRENCIES } from '../lib/format';
import AuthShell from '../components/AuthShell';

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
  companyName: z.string().trim().min(1, 'Required'),
  currency: z.string().length(3),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const guessCurrency = () => {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    const map: Record<string, string> = { IN: 'INR', GB: 'GBP', AU: 'AUD', CA: 'CAD', SG: 'SGD', AE: 'AED', JP: 'JPY', CH: 'CHF', NZ: 'NZD', ZA: 'ZAR' };
    const eurozone = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'GR'];
    return map[region || ''] || (eurozone.includes(region || '') ? 'EUR' : 'USD');
  } catch {
    return 'USD';
  }
};

const Register: React.FC = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register: authRegister, user, loading } = useAuth();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { currency: guessCurrency() },
  });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await authRegister(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create account'));
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Takes a few seconds.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField label="First name" autoComplete="given-name" autoFocus fullWidth size="medium" {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
            <TextField label="Last name" autoComplete="family-name" fullWidth size="medium" {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField label="Company" autoComplete="organization" fullWidth size="medium" {...register('companyName')} error={!!errors.companyName} helperText={errors.companyName?.message} />
            <TextField select label="Currency" size="medium" value={watch('currency')} onChange={e => setValue('currency', e.target.value)} sx={{ width: 120, flexShrink: 0 }}>
              {CURRENCIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Email" type="email" autoComplete="email" fullWidth size="medium" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" autoComplete="new-password" fullWidth size="medium" {...register('password')} error={!!errors.password} helperText={errors.password?.message || 'At least 8 characters'} />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create account'}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center">
            Have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>Sign in</MuiLink>
          </Typography>
        </Stack>
      </form>
    </AuthShell>
  );
};

export default Register;
