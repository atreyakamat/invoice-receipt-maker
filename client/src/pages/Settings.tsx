import React, { useEffect } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTour } from '../components/tour/TourContext';
import { apiPrivate, errorMessage } from '../api/axios';
import { useMeta } from '../lib/queries';
import { CURRENCIES } from '../lib/format';
import PageHeader from '../components/PageHeader';

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <Card sx={{ mb: 2.5 }}>
    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6">{title}</Typography>
          {description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>}
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>{children}</Grid>
      </Grid>
    </CardContent>
  </Card>
);

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Required'),
  lastName: z.string().trim().min(1, 'Required'),
});

const orgSchema = z.object({
  companyName: z.string().trim().min(1, 'Required'),
  legalName: z.string(),
  taxId: z.string(),
  email: z.string().trim().email('Invalid email').or(z.literal('')),
  phone: z.string(),
  currency: z.string().length(3),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine(d => d.newPassword === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const { start: startTour } = useTour();
  const queryClient = useQueryClient();
  const { data: meta } = useMeta();

  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  });
  const org = useForm<z.infer<typeof orgSchema>>({ resolver: zodResolver(orgSchema) });
  const password = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const { data: orgData } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => (await apiPrivate.get('/organization')).data,
  });

  useEffect(() => {
    if (orgData) {
      org.reset({
        companyName: orgData.companyName || '',
        legalName: orgData.legalName || '',
        taxId: orgData.taxId || '',
        email: orgData.email || '',
        phone: orgData.phone || '',
        currency: orgData.currency || 'USD',
      });
    }
  }, [orgData]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => (await apiPrivate.put('/auth/me', data)).data,
    onSuccess: data => {
      updateUser(data);
      profile.reset(profile.getValues());
      toast('Profile saved');
    },
  });

  const saveOrg = useMutation({
    mutationFn: async (data: z.infer<typeof orgSchema>) => (await apiPrivate.put('/organization', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast('Organization saved');
    },
  });

  const savePassword = useMutation({
    mutationFn: (data: z.infer<typeof passwordSchema>) =>
      apiPrivate.put('/auth/me/password', { currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      password.reset();
      toast('Password changed');
    },
  });

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <PageHeader title="Settings" />

      <Section title="Profile">
        <Box component="form" onSubmit={profile.handleSubmit(d => saveProfile.mutate(d))}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First name" {...profile.register('firstName')} error={!!profile.formState.errors.firstName} helperText={profile.formState.errors.firstName?.message} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last name" {...profile.register('lastName')} error={!!profile.formState.errors.lastName} helperText={profile.formState.errors.lastName?.message} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Email" value={user?.email || ''} disabled />
            </Grid>
          </Grid>
          {saveProfile.isError && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(saveProfile.error)}</Alert>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={saveProfile.isPending || !profile.formState.isDirty}>Save</Button>
        </Box>
      </Section>

      <Section title="Organization" description="Currency is the default for new documents and dashboard totals.">
        <Box component="form" onSubmit={org.handleSubmit(d => saveOrg.mutate(d))}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Company name" {...org.register('companyName')} error={!!org.formState.errors.companyName} helperText={org.formState.errors.companyName?.message} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Legal name" {...org.register('legalName')} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Tax ID / GSTIN" {...org.register('taxId')} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Currency"
                value={org.watch('currency') || 'USD'}
                onChange={e => org.setValue('currency', e.target.value, { shouldDirty: true })}
              >
                {Array.from(new Set([org.watch('currency') || 'USD', ...CURRENCIES])).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Billing email" {...org.register('email')} error={!!org.formState.errors.email} helperText={org.formState.errors.email?.message} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" {...org.register('phone')} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
          </Grid>
          {saveOrg.isError && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(saveOrg.error)}</Alert>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={saveOrg.isPending || !org.formState.isDirty}>Save</Button>
        </Box>
      </Section>

      <Section title="Password">
        <Box component="form" onSubmit={password.handleSubmit(d => savePassword.mutate(d))}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth type="password" label="Current password" autoComplete="current-password" {...password.register('currentPassword')} error={!!password.formState.errors.currentPassword} helperText={password.formState.errors.currentPassword?.message} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="password" label="New password" autoComplete="new-password" {...password.register('newPassword')} error={!!password.formState.errors.newPassword} helperText={password.formState.errors.newPassword?.message} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth type="password" label="Confirm" autoComplete="new-password" {...password.register('confirm')} error={!!password.formState.errors.confirm} helperText={password.formState.errors.confirm?.message} />
            </Grid>
          </Grid>
          {savePassword.isError && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(savePassword.error)}</Alert>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={savePassword.isPending}>Change password</Button>
        </Box>
      </Section>

      <Section title="Extraction" description="How fields are read from your documents.">
        {meta && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {meta.aiEnabled ? <AutoAwesomeOutlinedIcon color="primary" /> : <RuleOutlinedIcon color="action" />}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>{meta.aiEnabled ? 'AI extraction' : 'Rule-based extraction'}</Typography>
                {meta.aiModel && <Chip size="small" label={meta.aiModel} />}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {meta.aiEnabled
                  ? 'OCR text is sent to the configured model. Line items and categories are detected.'
                  : 'Runs fully offline. Set AI_API_KEY on the server for line items and higher accuracy.'}
              </Typography>
            </Box>
          </Box>
        )}
      </Section>

      <Section title="Product tour">
        <Button variant="outlined" onClick={startTour}>Replay tour</Button>
      </Section>
    </Box>
  );
};

export default Settings;
