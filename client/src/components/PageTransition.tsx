import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 4 }, maxWidth: 1360, mx: 'auto' }}>
          {children}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
