import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useScans, useRunScan } from '../../api/hooks/useScans';

export default function ScansPage() {
  const [collection, setCollection] = useState('all');
  const [onlyEnabled, setOnlyEnabled] = useState(true);
  const { data: scans, isLoading } = useScans();
  const runScan = useRunScan();

  const handleRunScan = () => {
    const collections = collection === 'all' ? undefined : [collection];
    runScan.mutate({ collections });
  };

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
        Scans
      </Typography>

      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Run New Scan
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Collection</InputLabel>
              <Select
                value={collection}
                label="Collection"
                onChange={(e) => setCollection(e.target.value)}
              >
                <MenuItem value="all">All Collections</MenuItem>
                <MenuItem value="transactions">Transactions</MenuItem>
                <MenuItem value="accounts">Accounts</MenuItem>
                <MenuItem value="customers">Customers</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={onlyEnabled}
                  onChange={(e) => setOnlyEnabled(e.target.checked)}
                />
              }
              label="Only enabled rules"
            />

            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunScan}
              disabled={runScan.isPending}
              sx={{
                background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D5A7F 0%, #2872A1 100%)',
                },
              }}
            >
              {runScan.isPending ? 'Running...' : 'Run Scan'}
            </Button>
          </Box>

          {runScan.isSuccess && (
            <Alert severity="success">
              Scan started successfully! Check scan history below for results.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Scan History
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Scan ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Started At</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Rules Checked</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Violations</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {scans?.map((scan) => (
                    <tr
                      key={scan.id}
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
                      <td style={{ padding: '12px' }}>{scan.id}</td>
                      <td style={{ padding: '12px' }}>
                        {new Date(scan.started_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={scan.status}
                          color={scan.status === 'COMPLETED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>{scan.rules_checked}</td>
                      <td style={{ padding: '12px' }}>{scan.violations_found}</td>
                      <td style={{ padding: '12px' }}>
                        {scan.duration_seconds ? `${scan.duration_seconds}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
