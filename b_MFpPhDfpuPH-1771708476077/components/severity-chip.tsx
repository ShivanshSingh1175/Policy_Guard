"use client";

import React from "react";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { severityColors, statusColors } from "@/lib/theme";

interface SeverityChipProps {
  value: string;
  type?: "severity" | "status";
  size?: "small" | "medium";
}

export default function SeverityChip({ value, type = "severity", size = "small" }: SeverityChipProps) {
  const colorMap = type === "severity" ? severityColors : statusColors;
  const bg = colorMap[value] || "#6B7280";
  return (
    <Chip
      label={value.charAt(0).toUpperCase() + value.slice(1)}
      size={size}
      sx={{
        bgcolor: alpha(bg, 0.12),
        color: bg,
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: "0.02em",
        border: `1px solid ${alpha(bg, 0.2)}`,
      }}
    />
  );
}
