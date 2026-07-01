import { createTheme, alpha } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

const googleBlue = '#1a73e8';
const backgroundDefault = '#f8f9fa'; // Google-like off-white
const textPrimary = '#202124';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: googleBlue,
      light: alpha(googleBlue, 0.5),
      dark: '#1557b0',
    },
    secondary: {
      main: '#ea4335', // Google Red
    },
    background: {
      default: backgroundDefault,
      paper: '#ffffff',
    },
    text: {
      primary: textPrimary,
      secondary: '#5f6368',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '8px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': { borderWidth: '2px' }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.02)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
        elevation1: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.04)',
          }
        }
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '2px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#fafafa',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(26,115,232,0.04)',
          }
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          color: textPrimary,
          boxShadow: 'none',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          overflow: 'visible',
        }
      }
    }
  },
});

export default theme;
