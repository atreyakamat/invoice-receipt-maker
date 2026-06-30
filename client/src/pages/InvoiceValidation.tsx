import React from 'react';
import { Box, Typography, Card, CardContent, Button, Checkbox, TextField, Alert } from '@mui/material';

const InvoiceValidation: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Invoice Validation</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        {/* PDF Preview Area */}
        <Box>
          <Card sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e0e0e0' }}>
            <Typography color="textSecondary">PDF Document Preview Placeholder</Typography>
          </Card>
        </Box>

        {/* AI Extracted Data Form */}
        <Box>
          <Card sx={{ height: '70vh', overflowY: 'auto' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Extracted Information</Typography>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                Tax differs from calculated subtotal based on items.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField label="Vendor" defaultValue="Adobe" fullWidth size="small" />
                  <Checkbox defaultChecked color="success" />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField label="Invoice Number" defaultValue="INV001" fullWidth size="small" />
                  <Checkbox defaultChecked color="success" />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField label="Invoice Date" defaultValue="01-06-2026" fullWidth size="small" />
                  <Checkbox defaultChecked color="success" />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField label="Total" defaultValue="1450" fullWidth size="small" />
                  <Checkbox defaultChecked color="success" />
                </Box>

                <TextField
                  label="Comments"
                  multiline
                  rows={4}
                  placeholder="Leave a comment for this validation..."
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" color="success" fullWidth>Approve</Button>
                  <Button variant="outlined" color="error" fullWidth>Reject</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceValidation;
