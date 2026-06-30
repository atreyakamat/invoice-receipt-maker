import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link as MuiLink } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
      <Card sx={{ maxWidth: 450, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Create an Account
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Company / Organization Name"
              fullWidth
              margin="normal"
              {...register('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login">
                Sign In
              </MuiLink>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
