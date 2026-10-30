import React, { useState } from 'react';
import { Alert, Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { errorMessage } from '../api/axios';
import AuthShell from '../components/AuthShell';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading } = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data);
      navigate((location.state as any)?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed'));
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Welcome back.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" autoComplete="email" autoFocus fullWidth size="medium" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Password" type="password" autoComplete="current-password" fullWidth size="medium" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center">
            New here?{' '}
            <MuiLink component={Link} to="/register" sx={{ fontWeight: 600 }}>Create an account</MuiLink>
          </Typography>
        </Stack>
      </form>
    </AuthShell>
  );
};

export default Login;
