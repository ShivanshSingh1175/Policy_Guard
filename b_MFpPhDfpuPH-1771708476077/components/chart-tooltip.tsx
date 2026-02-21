"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export default function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  const theme = useTheme();

  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        px: 2,
        py: 1.5,
        boxShadow: theme.palette.mode === "light"
          ? "0 4px 20px rgba(0,0,0,0.08)"
          : "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      {payload.map((entry, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: entry.color, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
