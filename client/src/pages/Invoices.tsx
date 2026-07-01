import React, { useState } from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiPrivate } from '../api/axios';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Invoices: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, pageSize],
    queryFn: async () => {
      const response = await apiPrivate.get('/invoices', {
        params: { skip: page * pageSize, take: pageSize },
      });
      return response.data;
    }
  });

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 180 },
    { 
      field: 'vendor', 
      headerName: 'Vendor', 
      width: 200,
      valueGetter: (params: any) => params.row?.vendor?.name || 'Unknown'
    },
    { 
      field: 'invoiceDate', 
      headerName: 'Date', 
      width: 150,
      valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    { 
      field: 'total', 
      headerName: 'Total', 
      width: 130,
      valueFormatter: (params: any) => `$${(params.value || 0).toFixed(2)}`
    },
    { field: 'status', headerName: 'Status', width: 130 },
    { 
      field: 'confidence', 
      headerName: 'OCR Confidence', 
      width: 130,
      valueFormatter: (params: any) => `${((params.value || 0) * 100).toFixed(1)}%`
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/invoices/${params.row.id}/validate`)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3">
          Invoices
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/pdf,image/jpeg,image/png';
            input.multiple = true;
            input.onchange = async (e: any) => {
              const files = e.target.files;
              if (files.length > 0) {
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                  formData.append('documents', files[i]);
                }
                await apiPrivate.post('/invoices/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                window.location.reload();
              }
            };
            input.click();
          }}
        >
          Upload Documents
        </Button>
      </Box>

      <Card sx={{ height: 600, width: '100%', p: 0 }}>
        <DataGrid
          rows={data?.invoices || []}
          columns={columns}
          rowCount={data?.total || 0}
          loading={isLoading}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Card>
    </motion.div>
  );
};

export default Invoices;
