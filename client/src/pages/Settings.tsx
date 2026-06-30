import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, TextField, Button, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Settings</Typography>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
            <Tab label="Profile" />
            <Tab label="Organization" />
            <Tab label="Billing" />
          </Tabs>
        </Box>
        
        <CustomTabPanel value={value} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField fullWidth label="First Name" defaultValue={user?.firstName || ''} />
                  <TextField fullWidth label="Last Name" defaultValue={user?.lastName || ''} />
                </Box>
                <TextField fullWidth label="Email" defaultValue={user?.email || ''} disabled />
                <Box>
                  <Button variant="contained">Save Changes</Button>
                </Box>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField fullWidth label="Company Name" defaultValue="My Company" />
                  <TextField fullWidth label="Tax ID / GST" />
                </Box>
                <TextField fullWidth label="Address" multiline rows={3} />
                <Box>
                  <Button variant="contained">Update Organization</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </CustomTabPanel>
        
        <CustomTabPanel value={value} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Subscription Plan</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">Current Plan: <strong>Starter</strong></Typography>
                <Typography variant="body2" color="textSecondary">Next billing date: Jan 1, 2027</Typography>
              </Box>
              <Button variant="outlined">Manage Billing</Button>
            </CardContent>
          </Card>
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

export default Settings;
