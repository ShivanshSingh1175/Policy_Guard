import { Grid, Typography, Card, CardContent, Box, Chip, CircularProgress, Fade, Grow } from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Rule as RuleIcon,
  TrendingUp as TrendingUpIcon,
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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'LOW': return '#4CAF50';
    case 'MEDIUM': return '#FF9800';
    case 'HIGH': return '#F44336';
    case 'CRITICAL': return '#D32F2F';
    default: return '#2872A1';
  }
};

export default function DashboardPage() {
  const { data: metrics, isLoading } = useDashboard();

  const severityBarData = metrics ? [
    { severity: 'LOW', count: metrics.violations_by_severity.LOW },
    { severity: 'MEDIUM', count: metrics.violations_by_severity.MEDIUM },
    { severity: 'HIGH', count: metrics.violations_by_severity.HIGH },
    { severity: 'CRITICAL', count: metrics.violations_by_severity.CRITICAL },
  ] : [];

  return (
    <Box sx={{ animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Dashboard
        </Typography>
        <Chip
          icon={<TrendingUpIcon />}
          label="Live"
          color="success"
          sx={{
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { title: 'Total Violations', value: metrics?.total_violations || 0, icon: <WarningIcon />, color: '#FF9800', delay: 0 },
          { title: 'Open Violations', value: metrics?.open_violations || 0, icon: <ErrorIcon />, color: '#F44336', delay: 100 },
          { title: 'Critical Issues', value: metrics?.critical_violations || 0, icon: <ErrorIcon />, color: '#D32F2F', delay: 200 },
          { title: 'Active Rules', value: metrics?.enabled_rules || 0, icon: <RuleIcon />, color: '#4CAF50', delay: 300 },
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
                />
              </div>
            </Grow>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Fade in timeout={800}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: '#2872A1' }} />
                  Violations Trend (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={violationsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#132F4C',
                        border: '1px solid rgba(40, 114, 161, 0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="violations"
                      stroke="#2872A1"
                      strokeWidth={3}
                      dot={{ fill: '#2872A1', r: 5 }}
                      activeDot={{ r: 8 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={6}>
          <Fade in timeout={1000}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ color: '#FF9800' }} />
                  Violations by Severity
                </Typography>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', height: 300, alignItems: 'center' }}>
                    <CircularProgress sx={{ color: '#2872A1' }} />
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={severityBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="severity" stroke="rgba(255,255,255,0.7)" />
                      <YAxis stroke="rgba(255,255,255,0.7)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#132F4C',
                          border: '1px solid rgba(40, 114, 161, 0.3)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#2872A1"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      <Fade in timeout={1200}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Recent Violations
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(40, 114, 161, 0.3)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Rule</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Record ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Severity</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Detected At</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                        <CircularProgress size={24} sx={{ color: '#2872A1' }} />
                      </td>
                    </tr>
                  ) : (
                    <>
                      <tr
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(40, 114, 161, 0.1)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <td style={{ padding: '16px', fontWeight: 500 }}>Large Cash Transactions</td>
                        <td style={{ padding: '16px', fontFamily: 'monospace', color: '#3A8BC2' }}>txn_12345</td>
                        <td style={{ padding: '16px' }}>
                          <Chip label="HIGH" sx={{ backgroundColor: '#F44336', fontWeight: 600 }} size="small" />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Chip label="OPEN" color="error" size="small" />
                        </td>
                        <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)' }}>2024-02-20 14:30</td>
                      </tr>
                      <tr
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(40, 114, 161, 0.1)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <td style={{ padding: '16px', fontWeight: 500 }}>Structuring Detection</td>
                        <td style={{ padding: '16px', fontFamily: 'monospace', color: '#3A8BC2' }}>acc_67890</td>
                        <td style={{ padding: '16px' }}>
                          <Chip label="CRITICAL" sx={{ backgroundColor: '#D32F2F', fontWeight: 600 }} size="small" />
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Chip label="OPEN" color="error" size="small" />
                        </td>
                        <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)' }}>2024-02-20 14:35</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

