"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./theme";

interface ThemeContextType {
  mode: "light" | "dark";
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleMode: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("policyguard_theme");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("policyguard_theme", next);
      return next;
    });
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
