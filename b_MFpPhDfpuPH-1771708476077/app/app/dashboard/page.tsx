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
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GppBadIcon from "@mui/icons-material/GppBad";
import RuleIcon from "@mui/icons-material/Rule";
import ScheduleIcon from "@mui/icons-material/Schedule";
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
  Cell,
} from "recharts";
import {
  useDashboardSummary,
  useDashboardTrends,
  useSeverityDistribution,
  useViolations,
} from "@/lib/hooks";
import { severityColors, getChartColors } from "@/lib/theme";
import MetricCard from "@/components/metric-card";
import SeverityChip from "@/components/severity-chip";
import ChartTooltip from "@/components/chart-tooltip";
import { format } from "date-fns";

export default function DashboardPage() {
  const theme = useTheme();
  const chartColors = getChartColors(theme.palette.mode);
  const summary = useDashboardSummary();
  const trends = useDashboardTrends();
  const severity = useSeverityDistribution();
  const recentViolations = useViolations({ limit: "10" });

  const isLoading = summary.isLoading;
  const isError = summary.isError || trends.isError || severity.isError;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AML compliance monitoring overview
        </Typography>
      </Box>

      {isError && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          Some data could not be loaded. The backend may be unreachable.
        </Alert>
      )}

      {/* Metric cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <MetricCard
            title="Total Violations"
            value={summary.data?.total_violations ?? 0}
            icon={<WarningAmberIcon />}
            color="#2563EB"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <MetricCard
            title="Open Violations"
            value={summary.data?.open_violations ?? 0}
            icon={<ErrorOutlineIcon />}
            color="#EA580C"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <MetricCard
            title="High / Critical"
            value={summary.data?.high_critical_violations ?? 0}
            icon={<GppBadIcon />}
            color="#DC2626"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <MetricCard
            title="Active Rules"
            value={summary.data?.active_rules ?? 0}
            icon={<RuleIcon />}
            color="#0F766E"
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <MetricCard
            title="Last Scan"
            value={
              summary.data?.last_scan_time
                ? format(new Date(summary.data.last_scan_time), "MMM d, HH:mm")
                : "Never"
            }
            icon={<ScheduleIcon />}
            color="#64748B"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Violations Over Time
              </Typography>
              {trends.isLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends.data || []} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <defs>
                      <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.secondary} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="none"
                      stroke={chartColors.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: chartColors.text }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: chartColors.text }}
                      dx={-4}
                    />
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} violations`} />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={chartColors.secondary}
                      strokeWidth={2.5}
                      fill="url(#violationsGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: chartColors.secondary, stroke: theme.palette.background.paper, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1" sx={{ mb: 3, color: "text.primary" }}>
                Violations by Severity
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {severity.isLoading ? (
                  <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={severity.data || []}
                      margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid
                        strokeDasharray="none"
                        stroke={chartColors.grid}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="severity"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                        dy={8}
                        tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                        dx={-4}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {(severity.data || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={severityColors[entry.severity] || "#6B7280"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent violations */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5, color: "text.primary" }}>
            Recent Violations
          </Typography>
          {recentViolations.isLoading ? (
            <Box>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={48} sx={{ mb: 0.5, borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rule</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(recentViolations.data || []).slice(0, 10).map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {v.rule_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            color: "text.secondary",
                          }}
                        >
                          {v.account_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <SeverityChip value={v.severity} />
                      </TableCell>
                      <TableCell>
                        <SeverityChip value={v.status} type="status" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                          {format(new Date(v.created_at), "MMM d, HH:mm")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentViolations.data || recentViolations.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No violations found. Run a scan to detect compliance issues.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
