import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
          {children}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
