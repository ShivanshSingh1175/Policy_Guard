import { createTheme } from '@mui/material/styles';

// Professional color palette based on #2872A1
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2872A1',      // Primary blue
      light: '#3A8BC2',     // Lighter blue
      dark: '#1D5A7F',      // Darker blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00BCD4',      // Cyan accent
      light: '#4DD0E1',     // Light cyan
      dark: '#0097A7',      // Dark cyan
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A1929',   // Deep navy background
      paper: '#132F4C',     // Card background
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Sora", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 800,
      fontSize: '3rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h5: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: '"Sora", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 2px 4px rgba(40, 114, 161, 0.15)',
    '0px 4px 8px rgba(40, 114, 161, 0.15)',
    '0px 8px 16px rgba(40, 114, 161, 0.15)',
    '0px 12px 24px rgba(40, 114, 161, 0.2)',
    '0px 16px 32px rgba(40, 114, 161, 0.2)',
    '0px 20px 40px rgba(40, 114, 161, 0.25)',
    '0px 24px 48px rgba(40, 114, 161, 0.25)',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#2872A1 #0A1929',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#2872A1',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#0A1929',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#132F4C',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 24px rgba(40, 114, 161, 0.25)',
            borderColor: 'rgba(40, 114, 161, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 16px rgba(40, 114, 161, 0.3)',
          },
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(40, 114, 161, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#132F4C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(19, 47, 76, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0A1929',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(40, 114, 161, 0.2)',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});
