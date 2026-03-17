'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#4a9eff',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#00897b',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#5f6368',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'var(--font-prompt), sans-serif',
    h1: { fontWeight: 300, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 400 },
    overline: { fontWeight: 600, letterSpacing: '0.12em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: 'var(--font-prompt), sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            fontFamily: 'var(--font-prompt), sans-serif',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: 'var(--font-prompt), sans-serif',
        },
      },
    },
  },
});

export default theme;
