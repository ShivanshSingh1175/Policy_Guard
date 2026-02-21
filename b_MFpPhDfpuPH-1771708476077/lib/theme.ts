import { createTheme, alpha } from "@mui/material/styles";

export function getTheme(mode: "light" | "dark") {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1E3A5F",
        light: "#2D5A8E",
        dark: "#0F2440",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#0F766E",
        light: "#14B8A6",
        dark: "#0A5C56",
        contrastText: "#FFFFFF",
      },
      error: { main: "#DC2626" },
      warning: { main: "#EA580C" },
      success: { main: "#16A34A" },
      info: { main: "#2563EB" },
      background: {
        default: isLight ? "#F8FAFC" : "#0C1222",
        paper: isLight ? "#FFFFFF" : "#141B2D",
      },
      text: {
        primary: isLight ? "#0F172A" : "#E2E8F0",
        secondary: isLight ? "#64748B" : "#94A3B8",
      },
      divider: isLight ? "#E2E8F0" : "#1E293B",
    },
    typography: {
      fontFamily: '"Geist", "Inter", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600, fontSize: "0.95rem" },
      body2: { fontSize: "0.875rem" },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${isLight ? "#E2E8F0" : "#1E293B"}`,
            background: isLight ? "#FFFFFF" : "#141B2D",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              borderColor: isLight ? "#CBD5E1" : "#334155",
              boxShadow: isLight
                ? "0 4px 16px rgba(0,0,0,0.06)"
                : "0 4px 16px rgba(0,0,0,0.25)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            fontWeight: 600,
            borderRadius: 10,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          contained: {
            background: isLight
              ? "linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 100%)"
              : "linear-gradient(135deg, #2D5A8E 0%, #1E3A5F 100%)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isLight ? "#F1F5F9" : "#1E293B",
          },
          head: {
            fontWeight: 700,
            textTransform: "uppercase" as const,
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            color: isLight ? "#64748B" : "#64748B",
            backgroundColor: isLight ? "#F8FAFC" : "#0C1222",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isLight
                ? alpha("#1E3A5F", 0.03)
                : alpha("#1E3A5F", 0.12),
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: "none" },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${isLight ? "#E2E8F0" : "#1E293B"}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 8 },
          bar: { borderRadius: 8 },
        },
      },
    },
  });
}

// Severity color mapping
export const severityColors: Record<string, string> = {
  low: "#3B82F6",
  medium: "#F59E0B",
  high: "#EA580C",
  critical: "#DC2626",
};

// Status color mapping
export const statusColors: Record<string, string> = {
  open: "#3B82F6",
  confirmed: "#EA580C",
  dismissed: "#6B7280",
  remediated: "#16A34A",
};

// Chart color palette (theme-aware)
export function getChartColors(mode: "light" | "dark") {
  return {
    primary: mode === "light" ? "#1E3A5F" : "#60A5FA",
    secondary: mode === "light" ? "#0F766E" : "#2DD4BF",
    accent: mode === "light" ? "#7C3AED" : "#A78BFA",
    grid: mode === "light" ? "#E2E8F0" : "#1E293B",
    text: mode === "light" ? "#64748B" : "#64748B",
    tooltipBg: mode === "light" ? "#FFFFFF" : "#1E293B",
    tooltipBorder: mode === "light" ? "#E2E8F0" : "#334155",
    tooltipText: mode === "light" ? "#0F172A" : "#E2E8F0",
    area: mode === "light" ? "rgba(30, 58, 95, 0.08)" : "rgba(96, 165, 250, 0.08)",
  };
}
