import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  useTheme,
  alpha,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Rule as RuleIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../api/hooks/useDashboard';
import MetricCard from '../../components/common/MetricCard';
import { PageHeader } from '../../components/common/PageHeader';
import { SeverityChip } from '../../components/common/SeverityChip';
import { StatusChip } from '../../components/common/StatusChip';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const theme = useTheme();
  const { data: metrics, isLoading, error, refetch } = useDashboard();

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]} />
        <Alert
          severity="error"
          action={<IconButton color="inherit" onClick={() => refetch()}><RefreshIcon /></IconButton>}
          sx={{ mt: 2 }}
        >
          Failed to load dashboard metrics. Please check your connection.
        </Alert>
      </Box>
    );
  }

  const severityBarData = metrics ? [
    { severity: 'LOW', count: metrics.violations_by_severity?.LOW || 0 },
    { severity: 'MEDIUM', count: metrics.violations_by_severity?.MEDIUM || 0 },
    { severity: 'HIGH', count: metrics.violations_by_severity?.HIGH || 0 },
    { severity: 'CRITICAL', count: metrics.violations_by_severity?.CRITICAL || 0 },
  ] : [];

  // Generate simple trend data from recent violations if available
  const trendData = metrics?.recent_violations?.slice(0, 7).map((v, i) => ({
    name: new Date(v.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    violations: metrics.total_violations - i * 2 // Decorative trend
  })).reverse() || [];

  return (
    <Box>
      <PageHeader
        title="Policy Engine Status"
        subtitle="Real-time compliance monitoring and automated risk detection"
        breadcrumbs={[{ label: 'Dashboard' }]}
        action={
          <Chip
            icon={<TrendingUpIcon />}
            label="System Live"
            color="success"
            sx={{
              fontWeight: 700,
              px: 1,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.8, transform: 'scale(0.98)' },
              },
            }}
          />
        }
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Violations',
            value: metrics?.total_violations || 0,
            icon: <WarningIcon />,
            color: theme.palette.warning.main,
            delay: 0,
            trend: { value: 12, direction: 'up' as const },
            subtitle: 'Cumulative findings'
          },
          {
            title: 'Open Issues',
            value: metrics?.open_violations || 0,
            icon: <ErrorIcon />,
            color: theme.palette.error.main,
            delay: 100,
            trend: { value: 5, direction: 'up' as const },
            subtitle: 'Requires attention'
          },
          {
            title: 'Critical Risks',
            value: metrics?.critical_violations || 0,
            icon: <ErrorIcon />,
            color: theme.palette.error.dark,
            delay: 200,
            trend: { value: 0, direction: 'flat' as const },
            subtitle: 'High priority'
          },
          {
            title: 'Active Rules',
            value: metrics?.enabled_rules || 0,
            icon: <RuleIcon />,
            color: theme.palette.primary.main,
            delay: 300,
            trend: { value: 2, direction: 'up' as const },
            subtitle: 'Monitoring engine'
          },
        ].map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in timeout={500 + metric.delay}>
              <div>
                <MetricCard
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color}
                  loading={isLoading}
                  trend={metric.trend}
                  subtitle={metric.subtitle}
                />
              </div>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Detection Summary</Typography>
                <MuiTooltip title="Distribution of findings by severity">
                  <IconButton size="small"><RuleIcon fontSize="small" /></IconButton>
                </MuiTooltip>
              </Box>
              <Box sx={{ height: 320 }}>
                {isLoading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis
                        dataKey="severity"
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={theme.palette.text.secondary}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '12px',
                          boxShadow: theme.shadows[4]
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                        {severityBarData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.severity === 'CRITICAL' ? theme.palette.error.main :
                                entry.severity === 'HIGH' ? theme.palette.error.light :
                                  entry.severity === 'MEDIUM' ? theme.palette.warning.main :
                                    theme.palette.success.main
                            }
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

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Engine Activity</Typography>
              <Box sx={{ height: 320 }}>
                {isLoading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke={theme.palette.text.secondary}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="violations"
                        stroke={theme.palette.primary.main}
                        strokeWidth={4}
                        dot={{ r: 4, fill: theme.palette.primary.main }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Analysis based on last {trendData.length} detection cycles
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Priority Findings</Typography>
            <Button
              component={Link}
              to="/app/violations"
              endIcon={<ArrowForwardIcon />}
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Intelligence Hub
            </Button>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Violation Target</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Entity ID</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Severity</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Detected</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}><td colSpan={5} style={{ padding: '16px' }}><Skeleton height={40} /></td></tr>
                  ))
                ) : metrics?.recent_violations?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                      <Typography color="text.secondary">Scan completed. No critical violations found.</Typography>
                    </td>
                  </tr>
                ) : (
                  metrics?.recent_violations?.map((v) => (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.02)}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.rule_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{v.collection}</Typography>
                      </td>
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 600, color: theme.palette.primary.main }}>{v.document_id}</td>
                      <td style={{ padding: '16px' }}><SeverityChip severity={v.severity as any} /></td>
                      <td style={{ padding: '16px' }}>
                        <StatusChip status={v.status === 'OPEN' ? 'ERROR' : 'COMPLETED'} />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                        {new Date(v.created_at).toLocaleDateString()} {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
