import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

// Palette from docs/11-Material-UI-Design-System.md
export const palettes = {
  light: {
    primary: { main: '#1976D2', light: '#42A5F5', dark: '#1565C0' },
    secondary: { main: '#7B1FA2', light: '#BA68C8', dark: '#6A1B9A' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
    info: { main: '#0288D1' },
    background: { default: '#F6F7F9', paper: '#FFFFFF' },
    text: { primary: '#1A1D21', secondary: '#5F6670' },
    divider: 'rgba(16, 24, 40, 0.09)',
  },
  dark: {
    primary: { main: '#5AA9F5', light: '#90CAF9', dark: '#1976D2' },
    secondary: { main: '#CE93D8', light: '#E1BEE7', dark: '#AB47BC' },
    success: { main: '#66BB6A' },
    warning: { main: '#FFA726' },
    error: { main: '#F44336' },
    info: { main: '#29B6F6' },
    background: { default: '#0D1014', paper: '#151A20' },
    text: { primary: '#E8EAED', secondary: '#9AA3AE' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
};

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: { palette: palettes.light },
    dark: { palette: palettes.dark },
  },
  typography: {
    fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.02em' },
    h3: { fontWeight: 650, fontSize: '1.5rem', letterSpacing: '-0.02em' },
    h4: { fontWeight: 650, fontSize: '1.375rem', letterSpacing: '-0.015em' },
    h5: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.6875rem' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10 },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 14 } },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiAutocomplete: { defaultProps: { size: 'small' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTab: { styleOverrides: { root: { minHeight: 44, paddingInline: 12, minWidth: 0 } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 } } },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 'none',
          '--DataGrid-containerBackground': 'transparent',
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, color: theme.vars.palette.text.secondary, fontSize: 13 },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus': { outline: 'none' },
          '& .MuiDataGrid-row': { cursor: 'pointer' },
        }),
      },
    },
  },
});

export default theme;
