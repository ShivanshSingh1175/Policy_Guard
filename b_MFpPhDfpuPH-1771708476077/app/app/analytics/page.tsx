"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { useTheme, alpha } from "@mui/material/styles";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardTrends, useControlHealth, useAccounts } from "@/lib/hooks";
import { getChartColors } from "@/lib/theme";
import ChartTooltip from "@/components/chart-tooltip";

export default function AnalyticsPage() {
  const theme = useTheme();
  const chartColors = getChartColors(theme.palette.mode);
  const trends = useDashboardTrends();
  const controlHealth = useControlHealth();
  const accounts = useAccounts();

  const topRisky = [...(accounts.data || [])]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);

  const topControls = [...(controlHealth.data || [])]
    .sort((a, b) => b.violation_rate - a.violation_rate)
    .slice(0, 10);

  const maxRate = topControls.length > 0 ? Math.max(...topControls.map((c) => c.violation_rate)) : 1;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compliance performance and risk analysis
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Violations trend */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Violations Trend
              </Typography>
              {trends.isLoading ? (
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={trends.data || []} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="analyticsTrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.secondary} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="none" stroke={chartColors.grid} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartColors.text }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartColors.text }} dx={-4} />
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} violations`} />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={chartColors.secondary}
                      strokeWidth={2.5}
                      fill="url(#analyticsTrendGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: chartColors.secondary, stroke: theme.palette.background.paper, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Control health */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Control Health (Violation Rates)
              </Typography>
              {controlHealth.isLoading ? (
                <Box>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
                  ))}
                </Box>
              ) : topControls.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {topControls.map((control) => {
                    const barColor =
                      control.violation_rate > 0.5
                        ? theme.palette.error.main
                        : control.violation_rate > 0.1
                        ? theme.palette.warning.main
                        : theme.palette.success.main;
                    return (
                      <Box key={control.rule_id}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary", fontSize: "0.8rem" }}>
                            {control.rule_name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: barColor }}>
                            {control.violation_count} ({(control.violation_rate * 100).toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((control.violation_rate / maxRate) * 100, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 4,
                            bgcolor: alpha(barColor, 0.08),
                            "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 4 },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No control health data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top risky accounts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Top Risky Accounts
              </Typography>
              {accounts.isLoading ? (
                <Box>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
                  ))}
                </Box>
              ) : topRisky.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Risk Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topRisky.map((acc) => (
                        <TableRow key={acc.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                              {acc.account_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{acc.customer_name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.85rem",
                                color:
                                  acc.risk_score >= 80
                                    ? "error.main"
                                    : acc.risk_score >= 50
                                    ? "warning.main"
                                    : "text.primary",
                              }}
                            >
                              {acc.risk_score}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No accounts data available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Control violations bar chart */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Control Violation Counts
              </Typography>
              {controlHealth.isLoading ? (
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topControls} margin={{ top: 8, right: 8, bottom: 40, left: -16 }}>
                    <CartesianGrid strokeDasharray="none" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                      dataKey="rule_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: chartColors.text }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: chartColors.text }} dx={-4} />
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} violations`} />} />
                    <Bar dataKey="violation_count" fill={chartColors.primary} radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
