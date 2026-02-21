import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
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
    <Box sx={{ animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 4,
        }}
      >
        Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Violations Per Day by Severity
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
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
                  <Line type="monotone" dataKey="LOW" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4 }} animationDuration={1500} />
                  <Line type="monotone" dataKey="MEDIUM" stroke="#2196F3" strokeWidth={3} dot={{ r: 4 }} animationDuration={1500} />
                  <Line type="monotone" dataKey="HIGH" stroke="#FF9800" strokeWidth={3} dot={{ r: 4 }} animationDuration={1500} />
                  <Line type="monotone" dataKey="CRITICAL" stroke="#F44336" strokeWidth={3} dot={{ r: 4 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Top Rules by Violation Count
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRulesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
                  <YAxis dataKey="rule" type="category" width={150} stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#132F4C',
                      border: '1px solid rgba(40, 114, 161, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="violations" fill="#2872A1" radius={[0, 8, 8, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Top Risky Accounts
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(40, 114, 161, 0.3)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Account ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Violations</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Last Violation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAccountsData.map((account) => (
                      <tr
                        key={account.account}
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
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#3A8BC2' }}>{account.account}</td>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{account.violations}</td>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)' }}>{account.last_violation}</td>
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
