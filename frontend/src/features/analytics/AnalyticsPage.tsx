import { Grid2 as Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data
const violationsTrendData = [
  { date: '2/14', LOW: 5, MEDIUM: 8, HIGH: 4, CRITICAL: 2 },
  { date: '2/15', LOW: 7, MEDIUM: 10, HIGH: 6, CRITICAL: 3 },
  { date: '2/16', LOW: 4, MEDIUM: 7, HIGH: 5, CRITICAL: 2 },
  { date: '2/17', LOW: 8, MEDIUM: 12, HIGH: 7, CRITICAL: 4 },
  { date: '2/18', LOW: 6, MEDIUM: 9, HIGH: 5, CRITICAL: 3 },
  { date: '2/19', LOW: 9, MEDIUM: 13, HIGH: 8, CRITICAL: 5 },
  { date: '2/20', LOW: 7, MEDIUM: 11, HIGH: 6, CRITICAL: 4 },
];

const topRulesData = [
  { rule: 'Large Cash Transactions', violations: 45 },
  { rule: 'Structuring Detection', violations: 38 },
  { rule: 'Dormant Account Activity', violations: 28 },
  { rule: 'Sanctioned Entity', violations: 16 },
];

const topAccountsData = [
  { account: 'ACC001', violations: 12, last_violation: '2024-02-20' },
  { account: 'ACC002', violations: 9, last_violation: '2024-02-19' },
  { account: 'ACC003', violations: 8, last_violation: '2024-02-20' },
  { account: 'ACC004', violations: 7, last_violation: '2024-02-18' },
  { account: 'ACC005', violations: 6, last_violation: '2024-02-20' },
];

export default function AnalyticsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Violations Per Day by Severity
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={violationsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="LOW" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="MEDIUM" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="HIGH" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="CRITICAL" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Rules by Violation Count
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRulesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="rule" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="violations" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Risky Accounts
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Account ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Violations</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Last Violation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAccountsData.map((account) => (
                      <tr key={account.account} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px' }}>{account.account}</td>
                        <td style={{ padding: '12px' }}>{account.violations}</td>
                        <td style={{ padding: '12px' }}>{account.last_violation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
