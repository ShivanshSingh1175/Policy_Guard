"use client";

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  icon,
  color = "#1E3A5F",
  loading,
}: MetricCardProps) {
  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.75, fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase", display: "block" }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.1, fontSize: "1.75rem" }}
              >
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              "& .MuiSvgIcon-root": { color, fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
