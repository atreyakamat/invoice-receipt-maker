import React, { Suspense, useState } from 'react';
import {
  AppBar, Avatar, LinearProgress, Badge, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Toolbar, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PageTransition from './PageTransition';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useUpload } from '../contexts/UploadContext';
import { useTour } from './tour/TourContext';
import { useInvoices } from '../lib/queries';

const DRAWER_WIDTH = 232;

const NAV = [
  { text: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: '/dashboard' },
  { text: 'Invoices', icon: <ReceiptLongOutlinedIcon />, path: '/invoices', badge: true },
  { text: 'Vendors', icon: <StorefrontOutlinedIcon />, path: '/vendors' },
  { text: 'Exports', icon: <FileDownloadOutlinedIcon />, path: '/exports' },
  { text: 'Settings', icon: <SettingsOutlinedIcon />, path: '/settings' },
];

const Layout: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { user, logout } = useAuth();
  const { openUpload } = useUpload();
  const { start: startTour } = useTour();
  const { mode, systemMode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: invoices } = useInvoices();

  const needsReview = invoices?.filter(i => i.status === 'VALIDATION').length ?? 0;
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5 }}>
        <Logo />
      </Toolbar>
      <List sx={{ px: 1.5, py: 1 }}>
        {NAV.map(item => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              selected={selected}
              onClick={() => setMobileOpen(false)}
              data-tour={`nav-${item.text.toLowerCase()}`}
              sx={{
                borderRadius: 2, mb: 0.5, py: 0.9,
                '&.Mui-selected': { bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.1)', color: 'primary.main' },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontWeight: selected ? 600 : 500, fontSize: 14.5 } } }} />
              {item.badge && needsReview > 0 && (
                <Badge badgeContent={needsReview} color="warning" sx={{ mr: 1.5, '& .MuiBadge-badge': { fontWeight: 700 } }} />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(var(--mui-palette-background-defaultChannel) / 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {!isDesktop && (
            <>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <MenuIcon />
              </IconButton>
              <Logo compact />
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {isDesktop ? (
            <Button variant="contained" startIcon={<CloudUploadOutlinedIcon />} onClick={() => openUpload()} data-tour="upload">
              Upload
            </Button>
          ) : (
            <IconButton color="primary" onClick={() => openUpload()} aria-label="Upload" data-tour="upload">
              <CloudUploadOutlinedIcon />
            </IconButton>
          )}
          <Tooltip title={resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')} aria-label="Toggle color mode">
              {resolvedMode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Product tour">
            <IconButton onClick={startTour} aria-label="Start product tour" data-tour="help">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={e => setMenuAnchor(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>{initials || '?'}</Avatar>
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 220, mt: 1, border: 1, borderColor: 'divider' } } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.firstName} {user?.lastName}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => { setMenuAnchor(null); navigate('/settings'); }}>
              <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={() => { setMenuAnchor(null); logout(); navigate('/login'); }}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isDesktop ? (
          <Drawer variant="permanent" open sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider' } }}>
            {drawer}
          </Drawer>
        ) : (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: 8 }}>
        <PageTransition>
          <Suspense fallback={<LinearProgress sx={{ borderRadius: 1 }} />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </Box>
    </Box>
  );
};

export default Layout;
