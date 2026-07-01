import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Decorative Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(26,115,232,0.15) 0%, rgba(26,115,232,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 8, md: 15 }, pb: 8 }}>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ textAlign: 'center' }}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: 'rgba(26,115,232,0.1)', color: 'primary.main', px: 2, py: 1, borderRadius: 8, mb: 4 }}>
              <AutoAwesomeIcon sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>NVIDIA Powered AI</Typography>
            </Box>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.primary', mb: 3, fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1.1 }}>
              Automate your <br/>
              <span style={{ color: '#1a73e8' }}>Invoices & Receipts</span>
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 6, maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
              Stop manual data entry. Let advanced Vision AI automatically extract, validate, and organize your financial documents with unprecedented accuracy.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ py: 2, px: 6, fontSize: '1.1rem', borderRadius: 8 }}
              >
                Get Started for Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ py: 2, px: 6, fontSize: '1.1rem', borderRadius: 8, bgcolor: 'rgba(255,255,255,0.5)' }}
              >
                Sign In
              </Button>
            </Stack>
          </motion.div>
        </Box>

        {/* Feature Grid */}
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible" sx={{ mt: 15 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
            {[
              { icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Intelligent Extraction', desc: 'State of the art OCR pulls every line item effortlessly.' },
              { icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Lightning Fast', desc: 'Process hundreds of documents in parallel via background workers.' },
              { icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Enterprise Secure', desc: 'Role-based access and strict API rate limiting protect your data.' },
            ].map((feature, i) => (
              <motion.div variants={itemVariants} key={i} style={{ flex: 1 }}>
                <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', borderRadius: 4, textAlign: 'center', height: '100%' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                </Box>
              </motion.div>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
