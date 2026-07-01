import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: { xs: '6rem', md: '10rem' }, color: 'primary.main', mb: 2, textShadow: '0px 10px 30px rgba(26,115,232,0.3)' }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 500 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/')}>
        Return Home
      </Button>
    </Box>
  );
};

export default NotFound;
