import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link as MuiLink, Stack } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  companyName: z.string().min(1, 'Company name is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      await authRegister(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blob */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(26,115,232,0.15) 0%, rgba(26,115,232,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ zIndex: 1, width: '100%', maxWidth: 500, p: 2 }}>
        <Card sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, textAlign: 'center', color: 'primary.main' }}>
              Create an Account
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
              Start automating your invoice intake today
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  {...register('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  {...register('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Stack>
              <TextField
                label="Company / Organization Name"
                fullWidth
                {...register('companyName')}
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 3 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ mb: 3, py: 1.5, fontSize: '1.1rem', borderRadius: 8 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
              <Typography variant="body2" align="center" color="text.secondary">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
                  Sign In
                </MuiLink>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Register;
