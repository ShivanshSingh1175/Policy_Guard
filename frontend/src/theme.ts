import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Severity color system - consistent across light/dark modes
export const severityColors = {
  CRITICAL: {
    main: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
    bg: alpha('#DC2626', 0.1),
  },
  HIGH: {
    main: '#EA580C',
    light: '#F97316',
    dark: '#C2410C',
    bg: alpha('#EA580C', 0.1),
  },
  MEDIUM: {
    main: '#D97706',
    light: '#F59E0B',
    dark: '#B45309',
    bg: alpha('#D97706', 0.1),
  },
  LOW: {
    main: '#059669',
    light: '#10B981',
    dark: '#047857',
    bg: alpha('#059669', 0.1),
  },
};

// Create theme based on mode
export const createAppTheme = (mode: 'light' | 'dark') => {
  const isLight = mode === 'light';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#2872A1',
        light: '#3A8BC2',
        dark: '#1D5A7F',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#0891B2',
        light: '#06B6D4',
        dark: '#0E7490',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isLight ? '#F4F6F8' : '#0F172A',
        paper: isLight ? '#FFFFFF' : '#1E293B',
      },
      error: severityColors.CRITICAL,
      warning: severityColors.HIGH,
      info: {
        main: isLight ? '#0284C7' : '#38BDF8',
        light: isLight ? '#0EA5E9' : '#7DD3FC',
        dark: isLight ? '#075985' : '#0284C7',
      },
      success: severityColors.LOW,
      text: {
        primary: isLight ? '#111827' : '#E5E7EB',
        secondary: isLight ? '#6B7280' : '#9CA3AF',
        disabled: isLight ? '#D1D5DB' : '#6B7280',
      },
      divider: isLight ? '#E5E7EB' : '#334155',
      // Custom grey scale
      ...(isLight ? {
        grey: {
          50: '#F9FAFB',
          100: '#F4F6F8',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      } : {
        grey: {
          50: '#1E293B',
          100: '#334155',
          200: '#475569',
          300: '#64748B',
          400: '#94A3B8',
          500: '#CBD5E1',
          600: '#E2E8F0',
          700: '#F1F5F9',
          800: '#F8FAFC',
          900: '#FFFFFF',
        },
      }),
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', 'Sora', sans-serif",
      h1: {
        fontWeight: 800,
        fontSize: '3rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.75rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: 1.5,
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: {
        fontWeight: 400,
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: isLight ? [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 2px 4px rgba(40, 114, 161, 0.1)',
      '0px 4px 8px rgba(40, 114, 161, 0.12)',
      '0px 8px 16px rgba(40, 114, 161, 0.15)',
      '0px 12px 24px rgba(40, 114, 161, 0.18)',
      '0px 16px 32px rgba(40, 114, 161, 0.2)',
      '0px 20px 40px rgba(40, 114, 161, 0.22)',
      '0px 24px 48px rgba(40, 114, 161, 0.25)',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1)',
      '0px 4px 6px rgba(0, 0, 0, 0.1)',
      '0px 10px 15px rgba(0, 0, 0, 0.1)',
      '0px 20px 25px rgba(0, 0, 0, 0.1)',
      '0px 25px 50px rgba(0, 0, 0, 0.25)',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1)',
      '0px 4px 6px rgba(0, 0, 0, 0.1)',
      '0px 10px 15px rgba(0, 0, 0, 0.1)',
      '0px 20px 25px rgba(0, 0, 0, 0.1)',
    ] : [
      'none',
      '0px 2px 4px rgba(0, 0, 0, 0.3)',
      '0px 4px 8px rgba(0, 0, 0, 0.3)',
      '0px 8px 16px rgba(0, 0, 0, 0.3)',
      '0px 12px 24px rgba(0, 0, 0, 0.35)',
      '0px 16px 32px rgba(0, 0, 0, 0.4)',
      '0px 20px 40px rgba(0, 0, 0, 0.45)',
      '0px 24px 48px rgba(0, 0, 0, 0.5)',
      '0px 2px 4px rgba(40, 114, 161, 0.2)',
      '0px 4px 8px rgba(40, 114, 161, 0.2)',
      '0px 8px 16px rgba(40, 114, 161, 0.2)',
      '0px 12px 24px rgba(40, 114, 161, 0.25)',
      '0px 16px 32px rgba(40, 114, 161, 0.25)',
      '0px 20px 40px rgba(40, 114, 161, 0.3)',
      '0px 24px 48px rgba(40, 114, 161, 0.3)',
      '0px 2px 4px rgba(0, 0, 0, 0.3)',
      '0px 4px 8px rgba(0, 0, 0, 0.3)',
      '0px 8px 16px rgba(0, 0, 0, 0.3)',
      '0px 12px 24px rgba(0, 0, 0, 0.35)',
      '0px 16px 32px rgba(0, 0, 0, 0.4)',
      '0px 20px 40px rgba(0, 0, 0, 0.45)',
      '0px 24px 48px rgba(0, 0, 0, 0.5)',
      '0px 2px 4px rgba(0, 0, 0, 0.3)',
      '0px 4px 8px rgba(0, 0, 0, 0.3)',
      '0px 8px 16px rgba(0, 0, 0, 0.3)',
    ],
  };

  return createTheme({
    ...baseTheme,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isLight ? '#2872A1 #F4F6F8' : '#2872A1 #0F172A',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: '#2872A1',
              minHeight: 24,
              border: isLight ? '2px solid #F4F6F8' : '2px solid #0F172A',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#1D5A7F',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: isLight ? '#F4F6F8' : '#0F172A',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isLight 
                ? '0px 12px 24px rgba(40, 114, 161, 0.15)'
                : '0px 12px 24px rgba(40, 114, 161, 0.25)',
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            padding: '10px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          contained: ({ theme }) => ({
            boxShadow: isLight
              ? '0px 2px 8px rgba(40, 114, 161, 0.2)'
              : '0px 4px 12px rgba(40, 114, 161, 0.3)',
            '&:hover': {
              boxShadow: isLight
                ? '0px 4px 12px rgba(40, 114, 161, 0.3)'
                : '0px 8px 16px rgba(40, 114, 161, 0.4)',
            },
          }),
          outlined: ({ theme }) => ({
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }),
          elevation1: {
            boxShadow: isLight
              ? '0px 1px 3px rgba(0, 0, 0, 0.1)'
              : '0px 2px 4px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: isLight
              ? '0px 4px 6px rgba(0, 0, 0, 0.1)'
              : '0px 4px 8px rgba(0, 0, 0, 0.3)',
          },
          elevation3: {
            boxShadow: isLight
              ? '0px 10px 15px rgba(0, 0, 0, 0.1)'
              : '0px 8px 16px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: isLight
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: isLight
              ? theme.palette.background.paper
              : theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          filled: ({ theme }) => ({
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
          head: ({ theme }) => ({
            fontWeight: 600,
            backgroundColor: isLight
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.primary.main, 0.08),
          }),
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          }),
          bar: {
            borderRadius: 4,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            border: '1px solid',
          },
          standardError: ({ theme }) => ({
            backgroundColor: isLight
              ? alpha(severityColors.CRITICAL.main, 0.1)
              : alpha(severityColors.CRITICAL.main, 0.15),
            borderColor: severityColors.CRITICAL.main,
          }),
          standardWarning: ({ theme }) => ({
            backgroundColor: isLight
              ? alpha(severityColors.HIGH.main, 0.1)
              : alpha(severityColors.HIGH.main, 0.15),
            borderColor: severityColors.HIGH.main,
          }),
          standardInfo: ({ theme }) => ({
            backgroundColor: isLight
              ? alpha(theme.palette.info.main, 0.1)
              : alpha(theme.palette.info.main, 0.15),
            borderColor: theme.palette.info.main,
          }),
          standardSuccess: ({ theme }) => ({
            backgroundColor: isLight
              ? alpha(severityColors.LOW.main, 0.1)
              : alpha(severityColors.LOW.main, 0.15),
            borderColor: severityColors.LOW.main,
          }),
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: ({ theme }) => ({
            backgroundColor: isLight
              ? theme.palette.grey[900]
              : theme.palette.grey[700],
            fontSize: '0.875rem',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: isLight
              ? '0px 4px 12px rgba(0, 0, 0, 0.15)'
              : '0px 4px 12px rgba(0, 0, 0, 0.5)',
          }),
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-1px)',
              },
            },
          },
        },
      },
    },
  });
};

// Default theme (dark mode)
export const theme = createAppTheme('dark');

// Export helper for severity colors
export const getSeverityColor = (severity: string, theme: any) => {
  const severityKey = severity.toUpperCase() as keyof typeof severityColors;
  return severityColors[severityKey] || severityColors.LOW;
};
