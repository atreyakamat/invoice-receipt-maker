import React from 'react';
import { Box, Typography, Button, Container, Stack, Grid, Card, CardContent, useTheme, alpha } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TableChartIcon from '@mui/icons-material/TableChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import CalculateIcon from '@mui/icons-material/Calculate';
import InsightsIcon from '@mui/icons-material/Insights';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Framer Motion Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <Box sx={{ bgcolor: '#0f172a', color: 'white', overflow: 'hidden', position: 'relative' }}>
      {/* Background Animated Elements */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}
        />
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 15, md: 25 }, pb: { xs: 10, md: 15 } }}>
        <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible" sx={{ textAlign: 'center' }}>
          <motion.div variants={fadeInUp}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: alpha('#6366f1', 0.1), border: `1px solid ${alpha('#6366f1', 0.3)}`, color: '#818cf8', px: 2, py: 1, borderRadius: 8, mb: 4, backdropFilter: 'blur(10px)' }}>
              <AutoAwesomeIcon sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1 }}>POWERED BY NEXT-GEN LLMs</Typography>
            </Box>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography variant="h1" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '3rem', md: '5.5rem' }, lineHeight: 1.1, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bookkeeping, <br />
              <Box component="span" sx={{ background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                completely automated.
              </Box>
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Typography variant="h5" sx={{ color: '#94a3b8', mb: 6, maxWidth: 750, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
              Say goodbye to manual data entry. Upload your invoices and receipts, and our advanced AI instantly extracts, categorizes, and prepares them for your accounting software.
            </Typography>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/register')}
                sx={{ 
                  py: 2, px: 6, fontSize: '1.1rem', borderRadius: 8, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 10px 30px -10px rgba(99,102,241,0.5)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 40px -10px rgba(99,102,241,0.7)' },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Automating Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  py: 2, px: 6, fontSize: '1.1rem', borderRadius: 8, 
                  color: 'white', borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                }}
              >
                Sign In to Dashboard
              </Button>
            </Stack>
          </motion.div>
        </Box>
      </Container>

      {/* How it Works Section */}
      <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h6" sx={{ color: '#ec4899', fontWeight: 700, letterSpacing: 1.5, mb: 2 }}>THE WORKFLOW</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>How it works in 3 seconds.</Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <CloudUploadIcon sx={{ fontSize: 50, color: '#38bdf8' }}/>, title: '1. Upload or Email', desc: 'Drag and drop PDFs/images or simply forward your vendor emails directly to your unique intake address.' },
              { icon: <AutoAwesomeIcon sx={{ fontSize: 50, color: '#a855f7' }}/>, title: '2. AI Extraction', desc: 'Our Multi-modal LLMs analyze the document, extracting line items, taxes, dates, and vendor details instantly.' },
              { icon: <TableChartIcon sx={{ fontSize: 50, color: '#34d399' }}/>, title: '3. Sync & Export', desc: 'Approve the data with one click and export perfectly formatted CSVs or sync directly to Google Sheets.' }
            ].map((step, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div variants={fadeInUp} style={{ height: '100%' }}>
                  <Card sx={{ 
                    height: '100%', bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', 
                    border: '1px solid rgba(255,255,255,0.05)', color: 'white', borderRadius: 4,
                    transition: 'transform 0.3s ease, background 0.3s ease',
                    '&:hover': { transform: 'translateY(-10px)', bgcolor: 'rgba(255,255,255,0.05)' }
                  }}>
                    <CardContent sx={{ p: 5, textAlign: 'center' }}>
                      <Box sx={{ mb: 4 }}>{step.icon}</Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{step.title}</Typography>
                      <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>{step.desc}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Target Audience Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 10, md: 15 }, position: 'relative', zIndex: 1 }}>
        <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} sx={{ textAlign: 'center', mb: 10 }}>
          <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 700, letterSpacing: 1.5, mb: 2 }}>WHO IS IT FOR?</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>Built for scale. Designed for simplicity.</Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { icon: <CalculateIcon sx={{ fontSize: 40 }}/>, title: 'Freelancers', desc: 'Stop spending your weekends doing manual data entry. Upload your receipts and get ready for tax season instantly.', color: '#38bdf8' },
            { icon: <GroupsIcon sx={{ fontSize: 40 }}/>, title: 'Agencies & SMBs', desc: 'Centralize all your vendor invoices and team expenses. Set up approval workflows and never lose a receipt again.', color: '#a855f7' },
            { icon: <InsightsIcon sx={{ fontSize: 40 }}/>, title: 'Accountants', desc: 'Process hundreds of client invoices in bulk. Export clean, accurate, reconciled data straight into your ERP.', color: '#ec4899' },
          ].map((audience, i) => (
            <Grid item xs={12} md={4} key={i}>
              <motion.div variants={scaleIn} style={{ height: '100%' }}>
                <Box sx={{ 
                  height: '100%', p: 4, borderRadius: 4, 
                  background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)`,
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(audience.color, 0.1), color: audience.color, mb: 3 }}>
                    {audience.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{audience.title}</Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>{audience.desc}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 10, md: 15 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="md">
          <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
            <Card sx={{ 
              borderRadius: 6, p: { xs: 4, md: 8 }, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
              color: 'white'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>Ready to automate your finances?</Typography>
              <Typography variant="h6" sx={{ color: '#cbd5e1', mb: 6, fontWeight: 400 }}>
                Join thousands of businesses saving 90% of their time on bookkeeping. No credit card required.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  py: 2, px: 8, fontSize: '1.2rem', borderRadius: 8, 
                  background: 'white', color: '#0f172a', fontWeight: 700,
                  '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.05)' },
                  transition: 'all 0.3s ease'
                }}
              >
                Create Free Account
              </Button>
            </Card>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
