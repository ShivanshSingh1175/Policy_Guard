import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme, severityColors as themeSeverityColors } from '../theme';

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

// Re-export severity colors for backward compatibility
export const severityColors = {
  CRITICAL: themeSeverityColors.CRITICAL.main,
  HIGH: themeSeverityColors.HIGH.main,
  MEDIUM: themeSeverityColors.MEDIUM.main,
  LOW: themeSeverityColors.LOW.main,
};

export const statusColors = {
  ACTIVE: '#4CAF50',
  PENDING: '#FF9800',
  INACTIVE: '#9E9E9E',
  ERROR: '#F44336',
  COMPLETED: '#4CAF50',
  RUNNING: '#2196F3',
  FAILED: '#F44336',
  OPEN: '#2196F3',
  IN_REVIEW: '#FF9800',
  CLOSED: '#4CAF50',
  CONFIRMED: '#F57C00',
  DISMISSED: '#9E9E9E',
  FALSE_POSITIVE: '#9E9E9E',
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

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
