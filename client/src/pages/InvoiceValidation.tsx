import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';

const InvoiceValidation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comments, setComments] = useState('');
  const [formData, setFormData] = useState<any>({});

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await apiPrivate.get(`/invoices/${id}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        vendorName: invoice.aiResult?.vendorName || invoice.vendor?.name || '',
        invoiceNumber: invoice.aiResult?.invoiceNumber || invoice.invoiceNumber || '',
        invoiceDate: invoice.aiResult?.invoiceDate || invoice.invoiceDate || '',
        total: invoice.aiResult?.total || invoice.total || 0,
      });
    }
  }, [invoice]);

  const validateMutation = useMutation({
    mutationFn: async ({ status }: { status: 'APPROVED' | 'REJECTED' }) => {
      await apiPrivate.post(`/invoices/${id}/validate`, {
        status,
        comments,
        finalData: status === 'APPROVED' ? formData : {}
      });
    },
    onSuccess: () => navigate('/invoices'),
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load invoice</Alert>;
  if (!invoice) return <Alert severity="warning">Invoice not found</Alert>;

  const handleApprove = () => validateMutation.mutate({ status: 'APPROVED' });
  const handleReject = () => validateMutation.mutate({ status: 'REJECTED' });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Invoice Validation</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
        {/* PDF Preview Area */}
        <Box>
          <Card sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e0e0e0' }}>
            {invoice.storageUrl ? (
              <Box component="img" src={`/${invoice.storageUrl}`} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Invoice preview" />
            ) : (
              <Typography color="textSecondary">No Document Preview Available</Typography>
            )}
          </Card>
        </Box>

        {/* AI Extracted Data Form */}
        <Box>
          <Card sx={{ height: '70vh', overflowY: 'auto' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Extracted Information</Typography>
              
              {invoice.validation?.score < 80 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Low confidence score ({invoice.validation.score}%). Please review carefully.
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField 
                    label="Vendor" 
                    value={formData.vendorName || ''} 
                    onChange={e => setFormData({...formData, vendorName: e.target.value})}
                    fullWidth size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField 
                    label="Invoice Number" 
                    value={formData.invoiceNumber || ''} 
                    onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
                    fullWidth size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField 
                    label="Invoice Date" 
                    value={formData.invoiceDate ? new Date(formData.invoiceDate).toISOString().split('T')[0] : ''}
                    onChange={e => setFormData({...formData, invoiceDate: e.target.value})}
                    fullWidth size="small" type="date"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField 
                    label="Total" 
                    value={formData.total || ''} 
                    onChange={e => setFormData({...formData, total: parseFloat(e.target.value) || 0})}
                    fullWidth size="small" type="number"
                  />
                </Box>

                <TextField
                  label="Comments"
                  multiline
                  rows={4}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Leave a comment for this validation..."
                  fullWidth
                  sx={{ mt: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" color="success" fullWidth onClick={handleApprove} disabled={validateMutation.isPending}>
                    Approve
                  </Button>
                  <Button variant="outlined" color="error" fullWidth onClick={handleReject} disabled={validateMutation.isPending}>
                    Reject
                  </Button>
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
