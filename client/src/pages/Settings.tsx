import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, TextField, Button, Divider, Alert, CircularProgress, Snackbar } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { apiPrivate } from '../api/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const orgSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  taxId: z.string().optional(),
});

const Settings: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [value, setValue] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register: regProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });

  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const res = await apiPrivate.get('/organization');
      return res.data;
    }
  });

  const { register: regOrg, handleSubmit: handleOrgSubmit, formState: { errors: orgErrors }, reset: resetOrg } = useForm({
    resolver: zodResolver(orgSchema),
  });

  React.useEffect(() => {
    if (orgData) {
      resetOrg({
        companyName: orgData.companyName || '',
        taxId: orgData.taxId || '',
      });
    }
  }, [orgData, resetOrg]);

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPrivate.put('/auth/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      setSuccessMsg('Profile updated successfully');
    }
  });

  const orgMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPrivate.put('/organization', data);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg('Organization updated successfully');
    }
  });

  const onProfileSubmit = (data: any) => profileMutation.mutate(data);
  const onOrgSubmit = (data: any) => orgMutation.mutate(data);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Settings</Typography>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={(_e, val) => setValue(val)} aria-label="settings tabs">
            <Tab label="Profile" />
            <Tab label="Organization" />
          </Tabs>
        </Box>
        
        <CustomTabPanel value={value} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField 
                    fullWidth 
                    label="First Name" 
                    {...regProfile('firstName')}
                    error={!!profileErrors.firstName}
                    helperText={profileErrors.firstName?.message as string}
                  />
                  <TextField 
                    fullWidth 
                    label="Last Name" 
                    {...regProfile('lastName')}
                    error={!!profileErrors.lastName}
                    helperText={profileErrors.lastName?.message as string}
                  />
                </Box>
                <TextField fullWidth label="Email" value={user?.email || ''} disabled />
                <Box>
                  <Button type="submit" variant="contained" disabled={profileMutation.isPending}>
                    {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
                {profileMutation.isError && <Alert severity="error">Failed to update profile</Alert>}
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Typography variant="h6" color="error" gutterBottom>Danger Zone</Typography>
              <Button variant="outlined" color="error" onClick={logout}>Sign Out</Button>
            </CardContent>
          </Card>
        </CustomTabPanel>
        
        <CustomTabPanel value={value} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Organization Details</Typography>
              {orgLoading ? <CircularProgress /> : (
                <Box component="form" onSubmit={handleOrgSubmit(onOrgSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField 
                      fullWidth 
                      label="Company Name" 
                      {...regOrg('companyName')}
                      error={!!orgErrors.companyName}
                      helperText={orgErrors.companyName?.message as string}
                    />
                    <TextField 
                      fullWidth 
                      label="Tax ID / GST" 
                      {...regOrg('taxId')}
                    />
                  </Box>
                  <Box>
                    <Button type="submit" variant="contained" disabled={orgMutation.isPending}>
                      {orgMutation.isPending ? 'Updating...' : 'Update Organization'}
                    </Button>
                  </Box>
                  {orgMutation.isError && <Alert severity="error">Failed to update organization</Alert>}
                </Box>
              )}
            </CardContent>
          </Card>
        </CustomTabPanel>
      </Box>

      <Snackbar open={!!successMsg} autoHideDuration={6000} onClose={() => setSuccessMsg(null)}>
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
