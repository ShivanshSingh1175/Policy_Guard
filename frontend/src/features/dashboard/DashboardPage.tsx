import { Grid, Typography, Card, CardContent, Box, Chip, CircularProgress } from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Rule as RuleIcon,
} from '@mui/icons-material';
import { useDashboard } from '../../api/hooks/useDashboard';
import MetricCard from '../../components/common/MetricCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock chart data
const violationsTrendData = [
  { date: '2/14', violations: 12 },
  { date: '2/15', violations: 19 },
  { date: '2/16', violations: 15 },
  { date: '2/17', violations: 22 },
  { date: '2/18', violations: 18 },
  { date: '2/19', violations: 25 },
  { date: '2/20', violations: 23 },
];

export default function DashboardPage() {
  const { data: metrics, isLoading } = useDashboard();

  const severityBarData = metrics ? [
    { severity: 'LOW', count: metrics.violations_by_severity.LOW },
    { severity: 'MEDIUM', count: metrics.violations_by_severity.MEDIUM },
    { severity: 'HIGH', count: metrics.violations_by_severity.HIGH },
    { severity: 'CRITICAL', count: metrics.violations_by_severity.CRITICAL },
  ] : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Violations"
            value={metrics?.total_violations || 0}
            icon={<WarningIcon />}
            color="warning.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Violations"
            value={metrics?.open_violations || 0}
            icon={<ErrorIcon />}
            color="error.main"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Critical Issues"
            value={metrics?.critical_violations || 0}
            icon={<ErrorIcon />}
            color="error.dark"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Rules"
            value={metrics?.enabled_rules || 0}
            icon={<RuleIcon />}
            color="success.main"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Violations Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={violationsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="violations" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Violations by Severity
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Violations
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Rule</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Record ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Detected At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                      <CircularProgress size={24} />
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>Large Cash Transactions</td>
                      <td style={{ padding: '12px' }}>txn_12345</td>
                      <td style={{ padding: '12px' }}>
                        <Chip label="HIGH" color="warning" size="small" />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip label="OPEN" color="error" size="small" />
                      </td>
                      <td style={{ padding: '12px' }}>2024-02-20 14:30</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>Structuring Detection</td>
                      <td style={{ padding: '12px' }}>acc_67890</td>
                      <td style={{ padding: '12px' }}>
                        <Chip label="CRITICAL" color="error" size="small" />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip label="OPEN" color="error" size="small" />
                      </td>
                      <td style={{ padding: '12px' }}>2024-02-20 14:35</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
