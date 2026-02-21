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
    <Box>
      <Typography variant="h4" gutterBottom>
        Scans
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
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
                    <tr key={scan.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
