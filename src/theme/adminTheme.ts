import { createTheme } from '@mui/material/styles';

export const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#881337',
      dark: '#70102d',
      light: '#fff1f2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#b91c1c',
      light: '#fecdd3',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#16a34a',
      light: '#ecfdf5',
    },
    warning: {
      main: '#d97706',
      light: '#fffbeb',
    },
    error: {
      main: '#dc2626',
      light: '#fef2f2',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: { fontWeight: 700, color: '#0f172a' },
    h6: { fontWeight: 600, color: '#0f172a' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(136, 19, 55, 0.25)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& th': {
            color: '#64748b',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #e2e8f0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(136, 19, 55, 0.02) !important',
          },
        },
      },
    },
  },
});

export default adminTheme;
