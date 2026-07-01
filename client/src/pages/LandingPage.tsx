import React, { useRef } from 'react';
import { Box, Typography, Button, Container, Stack, Grid, Card, CardContent, useTheme, alpha } from '@mui/material';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TableChartIcon from '@mui/icons-material/TableChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

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

const InteractiveHero = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position tracking for background parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.05); // Dampen movement
    mouseY.set(y * 0.05);
  };
  
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  return (
    <Box 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      sx={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        pt: { xs: 15, md: 0 },
        pb: { xs: 10, md: 0 },
        overflow: 'hidden' 
      }}
    >
      {/* Dynamic Background Orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          x: smoothX,
          y: smoothY,
          zIndex: 0
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          x: useTransform(smoothX, x => -x),
          y: useTransform(smoothY, y => -y),
          zIndex: 0
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '40%',
          left: '40%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 0
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={fadeInUp}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(37, 99, 235, 0.1)', 
                  border: `1px solid rgba(37, 99, 235, 0.3)`, 
                  color: '#60A5FA', 
                  px: 2, py: 1, 
                  borderRadius: 8, 
                  mb: 4, 
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.1)'
                }}>
                  <AutoAwesomeIcon sx={{ fontSize: 20, mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1 }}>GENERATIVE AI EXTRACTOR</Typography>
                </Box>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h1" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '3.5rem', md: '4.5rem' }, lineHeight: 1.1, color: 'white' }}>
                  Invoices, <br />
                  <Box component="span" sx={{ 
                    background: 'linear-gradient(to right, #60A5FA, #F97316)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    pb: 1
                  }}>
                    magically synced.
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h5" sx={{ color: '#94a3b8', mb: 6, fontWeight: 400, lineHeight: 1.6, maxWidth: 500 }}>
                  Experience the fastest way to process receipts. Drop a PDF and let our Multi-modal AI perfectly extract every line item in seconds.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ChevronRightIcon />}
                    onClick={() => navigate('/register')}
                    sx={{ 
                      py: 2, px: 5, fontSize: '1.1rem', borderRadius: 8, 
                      bgcolor: '#2563EB',
                      color: 'white',
                      boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.6)',
                      '&:hover': { 
                        bgcolor: '#1D4ED8', 
                        transform: 'translateY(-2px) scale(1.02)', 
                        boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.8)' 
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    Start Automating
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ 
                      py: 2, px: 5, fontSize: '1.1rem', borderRadius: 8, 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': { 
                        borderColor: 'white', 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Login to Dashboard
                  </Button>
                </Stack>
              </motion.div>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
             {/* Mock Interactive Scanning Animation */}
             <motion.div 
               variants={scaleIn} 
               initial="hidden" 
               animate="visible"
               style={{ perspective: 1000 }}
             >
               <motion.div
                 animate={{ rotateY: [-5, 5, -5], rotateX: [5, -5, 5] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               >
                 <Box sx={{ 
                   position: 'relative',
                   width: '100%',
                   maxWidth: 450,
                   mx: 'auto',
                   aspectRatio: '3/4',
                   borderRadius: 4,
                   background: 'rgba(30, 41, 59, 0.7)',
                   backdropFilter: 'blur(20px)',
                   border: '1px solid rgba(255,255,255,0.1)',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                   overflow: 'hidden',
                   p: 3,
                   display: 'flex',
                   flexDirection: 'column',
                   cursor: 'pointer'
                 }}>
                   {/* Scanning Laser */}
                   <motion.div
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     style={{
                       position: 'absolute',
                       left: 0,
                       right: 0,
                       height: '3px',
                       background: 'linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,1) 50%, rgba(56,189,248,0) 100%)',
                       boxShadow: '0 0 20px 5px rgba(56,189,248,0.4)',
                       zIndex: 10
                     }}
                   />
                   
                   {/* Mock Receipt Header */}
                   <Box sx={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', pb: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Box>
                       <Box sx={{ width: 100, height: 24, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, mb: 1 }} />
                       <Box sx={{ width: 150, height: 16, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
                     </Box>
                     <DocumentScannerIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
                   </Box>
                   
                   {/* Mock Line Items */}
                   <Stack spacing={2} sx={{ flex: 1 }}>
                     {[...Array(4)].map((_, i) => (
                       <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                         <Box sx={{ width: `${Math.random() * 40 + 30}%`, height: 16, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                         <Box sx={{ width: 60, height: 16, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                       </Box>
                     ))}
                   </Stack>
                   
                   {/* Mock Total */}
                   <Box sx={{ borderTop: '2px solid rgba(255,255,255,0.1)', pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>TOTAL</Typography>
                     <Typography sx={{ color: '#F97316', fontWeight: 800, fontSize: '1.5rem' }}>$1,249.00</Typography>
                   </Box>
                   
                   {/* Extraction Overlay */}
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: [0, 1, 0] }}
                     transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 1] }}
                     style={{
                       position: 'absolute',
                       inset: 0,
                       background: 'rgba(37, 99, 235, 0.1)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       pointerEvents: 'none'
                     }}
                   >
                     <Box sx={{ 
                       bgcolor: 'rgba(15, 23, 42, 0.9)', 
                       px: 3, py: 1.5, 
                       borderRadius: 8, 
                       border: '1px solid #38bdf8',
                       color: '#38bdf8',
                       fontWeight: 700,
                       boxShadow: '0 0 20px rgba(56,189,248,0.3)'
                     }}>
                       AI Extracted
                     </Box>
                   </motion.div>

                 </Box>
               </motion.div>
             </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -10 }}
    style={{ height: '100%' }}
  >
    <Card sx={{ 
      height: '100%', 
      bgcolor: 'rgba(30, 41, 59, 0.5)', 
      backdropFilter: 'blur(24px)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      color: 'white', 
      borderRadius: 6,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      overflow: 'hidden',
      position: 'relative',
      '&:hover': { 
        bgcolor: 'rgba(30, 41, 59, 0.8)',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
      }
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0, right: 0, width: 150, height: 150,
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        transform: 'translate(30%, -30%)'
      }} />
      <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          mb: 4, 
          display: 'inline-flex',
          p: 2,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>{icon}</Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.7 }}>{desc}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: 'white', overflow: 'hidden' }}>
      
      <InteractiveHero />

      {/* Workflow Section */}
      <Box sx={{ py: { xs: 15, md: 25 }, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="subtitle2" sx={{ color: '#F97316', fontWeight: 700, letterSpacing: 1.5, mb: 2 }}>SEAMLESS WORKFLOW</Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, color: 'white', mb: 3 }}>Zero manual entry.</Typography>
            <Typography sx={{ color: '#94a3b8', maxWidth: 600, mx: 'auto', fontSize: '1.2rem' }}>
              We've re-imagined the accounting workflow. What used to take hours now happens instantly.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard 
                icon={<CloudUploadIcon sx={{ fontSize: 40, color: '#38bdf8' }}/>} 
                title="1. Auto-Ingest" 
                desc="Forward emails to your dedicated inbox or drop files into the dashboard. We handle PDFs, JPGs, and PNGs." 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard 
                icon={<AutoAwesomeIcon sx={{ fontSize: 40, color: '#a855f7' }}/>} 
                title="2. AI Extraction" 
                desc="Our LLMs process complex, multi-page, non-standard receipts. It extracts line items, tax rates, and categorizes automatically." 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FeatureCard 
                icon={<TableChartIcon sx={{ fontSize: 40, color: '#34d399' }}/>} 
                title="3. One-Click Export" 
                desc="Review the extracted data and push directly to QuickBooks, Xero, or export cleanly formatted CSVs." 
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Target Audience Section */}
      <Box sx={{ py: { xs: 15, md: 20 }, position: 'relative', zIndex: 1, bgcolor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 4 }}>
                  Built for modern teams.
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', mb: 4, lineHeight: 1.8 }}>
                  Whether you're a freelancer trying to survive tax season, or an accounting firm processing thousands of invoices, our platform scales with you.
                </Typography>
                
                <Stack spacing={4}>
                  {[
                    { icon: <CalculateIcon/>, title: 'Freelancers', desc: 'Snap a picture and forget about it until tax day.', color: '#38bdf8' },
                    { icon: <GroupsIcon/>, title: 'Agencies', desc: 'Centralize approvals and team expenses in one place.', color: '#a855f7' },
                    { icon: <InsightsIcon/>, title: 'Accountants', desc: 'Bulk process client data with 99.9% accuracy.', color: '#F97316' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ 
                        width: 50, height: 50, borderRadius: 3, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        bgcolor: alpha(item.color, 0.1), color: item.color, flexShrink: 0 
                      }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                        <Typography sx={{ color: '#94a3b8' }}>{item.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={scaleIn}
                style={{ position: 'relative' }}
              >
                 <Box sx={{
                    position: 'absolute',
                    inset: -20,
                    background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(40px)',
                    zIndex: 0
                 }}/>
                 <Box sx={{ 
                    position: 'relative',
                    zIndex: 1,
                    width: '100%', 
                    height: 500, 
                    borderRadius: 6,
                    background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                 }}>
                   {/* Abstract visualization of data processing */}
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                     style={{
                       width: 600, height: 600,
                       border: '1px dashed rgba(255,255,255,0.1)',
                       borderRadius: '50%',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center'
                     }}
                   >
                     <motion.div
                       animate={{ rotate: -360 }}
                       transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                       style={{
                         width: 400, height: 400,
                         border: '1px solid rgba(56,189,248,0.2)',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}
                     >
                       <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.5)', filter: 'blur(20px)' }} />
                     </motion.div>
                   </motion.div>
                 </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 15, md: 25 }, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {/* Huge background glow for CTA */}
        <Box sx={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw', height: '500px',
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, rgba(15,23,42,0) 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}/>
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
            <Card sx={{ 
              borderRadius: 8, p: { xs: 5, md: 10 }, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
              border: '1px solid rgba(56,189,248,0.2)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(30px)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', transform: 'translate(-30%, 30%)' }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>Ready to upgrade your accounting?</Typography>
                <Typography sx={{ color: '#cbd5e1', mb: 6, fontSize: '1.2rem', maxWidth: 600, mx: 'auto' }}>
                  Join thousands of forward-thinking businesses. Setup takes 2 minutes. No credit card required.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href="/register"
                  sx={{ 
                    py: 2.5, px: 8, fontSize: '1.2rem', borderRadius: 8, 
                    background: 'white', color: '#0f172a', fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.05)', boxShadow: '0 15px 35px rgba(255,255,255,0.3)' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Create Free Account
                </Button>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default LandingPage;
