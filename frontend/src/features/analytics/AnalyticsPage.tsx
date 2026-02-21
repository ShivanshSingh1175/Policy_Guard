import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Tooltip as MuiTooltip,
  Skeleton,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  useTrends,
  useTopRisks,
  useControlHealth,
  useFrameworkCoverage,
} from '../../api/hooks/useAnalytics';
import { SeverityChip } from '../../components/common/SeverityChip';
import { PageHeader } from '../../components/common/PageHeader';

export default function AnalyticsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: trends, isLoading: trendsLoading, error: trendsError } = useTrends(7);
  const { data: risks, isLoading: risksLoading, error: risksError } = useTopRisks();
  const { data: health, isLoading: healthLoading } = useControlHealth();
  const { data: coverage } = useFrameworkCoverage();

  const isLoading = trendsLoading || risksLoading || healthLoading;
  const error = trendsError || risksError;

  // Format trends for Recharts
  const trendsData =
    trends?.map((t: any) => ({
      ...t,
      date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    })) || [];

  const topRulesData =
    risks?.top_rules.map((r) => ({
      rule: r.rule_name,
      violations: r.violation_count,
    })) || [];

  const topAccountsData = risks?.top_accounts || [];

  const getHealthColor = (rate: number) => {
    if (rate === 0) return theme.palette.success.main;
    if (rate < 0.1) return theme.palette.success.light;
    if (rate < 0.3) return theme.palette.warning.main;
    if (rate < 0.6) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }>
          Failed to load analytics data. Please check your connection and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Compliance Analytics"
        subtitle="Detailed metrics on control effectiveness and risk exposure"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Analytics' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Coverage Summary */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rounded" height={100} />
                </Grid>
              ))
            ) : (
              coverage?.frameworks.map((f: any) => (
                <Grid item xs={12} sm={6} md={3} key={f.framework}>
                  <Card sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                        {f.framework} Coverage
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {f.enabled_count}/{f.rule_count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active Monitoring Rules
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {/* Violations Timeline */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Violation Trends (Last 7 Days)
              </Typography>
              <Box sx={{ height: 350, mt: 2 }}>
                {trendsLoading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                      <XAxis
                        dataKey="date"
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
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '12px',
                          boxShadow: theme.shadows[4]
                        }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="LOW" stroke={theme.palette.success.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="MEDIUM" stroke={theme.palette.info.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="HIGH" stroke={theme.palette.warning.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="CRITICAL" stroke={theme.palette.error.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Control Health Heatmap */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Control Health Matrix
              </Typography>
              {healthLoading ? (
                <Skeleton variant="rounded" height={200} />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Control ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Rule Name</th>
                        <th style={{ padding: '16px', textAlign: 'center', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Violations</th>
                        <th style={{ padding: '16px', textAlign: 'center', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Avg / Scan</th>
                        <th style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {health?.map((h) => (
                        <tr
                          key={h.rule_id}
                          style={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <td style={{ padding: '16px', color: theme.palette.primary.main, fontWeight: 700, fontFamily: 'monospace' }}>{h.control_id || 'N/A'}</td>
                          <td style={{ padding: '16px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{h.rule_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{h.framework}</Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{h.total_violations}</Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <Typography variant="body2">{h.average_violations_per_scan}</Typography>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                bgcolor: alpha(getHealthColor(h.average_violations_per_scan), 0.1),
                                color: getHealthColor(h.average_violations_per_scan),
                                border: `1px solid ${alpha(getHealthColor(h.average_violations_per_scan), 0.2)}`,
                                textTransform: 'uppercase'
                              }}
                            >
                              {h.average_violations_per_scan > 0.5 ? 'Critical' : h.average_violations_per_scan > 0.2 ? 'Warning' : 'Healthy'}
                            </Box>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Risks */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Top 5 Active Risks (Rules)
              </Typography>
              <Box sx={{ height: 300 }}>
                {risksLoading ? (
                  <Skeleton variant="rounded" height="100%" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRulesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="rule" type="category" width={140} stroke={theme.palette.text.secondary} fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="violations" radius={[0, 4, 4, 0]}>
                        {topRulesData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? theme.palette.error.main : index === 1 ? theme.palette.warning.main : theme.palette.primary.main}
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

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Highest Risk Accounts
              </Typography>
              {risksLoading ? (
                <Skeleton variant="rounded" height={300} />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Account ID</th>
                        <th style={{ padding: '16px', textAlign: 'center', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Violations</th>
                        <th style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAccountsData.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ padding: '32px', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">No risk data available yet.</Typography>
                          </td>
                        </tr>
                      ) : (
                        topAccountsData.map((account) => (
                          <tr key={account.account_id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '16px', fontFamily: 'monospace', color: theme.palette.primary.main, fontWeight: 700 }}>{account.account_id}</td>
                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{account.violation_count}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <SeverityChip
                                severity={
                                  (account.risk_score && account.risk_score > 50) ? 'CRITICAL' :
                                    (account.risk_score && account.risk_score > 30) ? 'HIGH' : 'MEDIUM'
                                }
                                label={`${account.risk_score || 0}%`}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
