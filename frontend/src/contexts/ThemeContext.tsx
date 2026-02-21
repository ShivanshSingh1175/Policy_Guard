import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

// Severity colors for consistent use across components
export const severityColors = {
  CRITICAL: '#D32F2F',
  HIGH: '#F57C00',
  MEDIUM: '#FFA726',
  LOW: '#66BB6A',
};

export const statusColors = {
  ACTIVE: '#4CAF50',
  PENDING: '#FF9800',
  INACTIVE: '#9E9E9E',
  ERROR: '#F44336',
  COMPLETED: '#4CAF50',
  RUNNING: '#2196F3',
  FAILED: '#F44336',
};

const getTheme = (mode: ThemeMode): Theme => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: {
              main: '#2872A1',
              light: '#3A8BC2',
              dark: '#1D5A7F',
              contrastText: '#FFFFFF',
            },
            secondary: {
              main: '#00BCD4',
              light: '#4DD0E1',
              dark: '#0097A7',
              contrastText: '#FFFFFF',
            },
            background: {
              default: '#F5F7FA',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#1A2027',
              secondary: '#5F6C7B',
            },
            divider: 'rgba(0, 0, 0, 0.08)',
          }
        : {
            // Dark mode
            primary: {
              main: '#2872A1',
              light: '#3A8BC2',
              dark: '#1D5A7F',
              contrastText: '#FFFFFF',
            },
            secondary: {
              main: '#00BCD4',
              light: '#4DD0E1',
              dark: '#0097A7',
              contrastText: '#FFFFFF',
            },
            background: {
              default: '#0A1929',
              paper: '#132F4C',
            },
            text: {
              primary: '#FFFFFF',
              secondary: 'rgba(255, 255, 255, 0.7)',
            },
            divider: 'rgba(255, 255, 255, 0.12)',
          }),
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
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'dark' ? '#2872A1 #0A1929' : '#2872A1 #F5F7FA',
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
              backgroundColor: mode === 'dark' ? '#0A1929' : '#F5F7FA',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(20px)',
            border: mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.08)' 
              : '1px solid rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'dark'
                ? '0px 12px 24px rgba(40, 114, 161, 0.25)'
                : '0px 12px 24px rgba(0, 0, 0, 0.15)',
              borderColor: mode === 'dark'
                ? 'rgba(40, 114, 161, 0.3)'
                : 'rgba(40, 114, 161, 0.2)',
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
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark'
              ? 'rgba(19, 47, 76, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0A1929' : '#FFFFFF',
            borderRight: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.08)',
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
            borderColor: mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
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
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
