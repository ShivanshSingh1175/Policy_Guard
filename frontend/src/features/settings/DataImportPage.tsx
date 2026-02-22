import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  PlayArrow as ScanIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import {
  useImportTransactions,
  useImportAccounts,
  useImportPayroll,
  useDataStats,
} from '../../api/hooks/useDataImport';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ImportResultDisplay {
  success: boolean;
  rows_processed: number;
  rows_inserted: number;
  rows_failed: number;
  sample_errors: string[];
}

export default function DataImportPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [importResult, setImportResult] = useState<ImportResultDisplay | null>(null);

  const { data: stats } = useDataStats();
  const importTransactions = useImportTransactions();
  const importAccounts = useImportAccounts();
  const importPayroll = useImportPayroll();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setImportResult(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'transactions' | 'accounts' | 'payroll'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportResult(null);

    try {
      let result;
      if (type === 'transactions') {
        result = await importTransactions.mutateAsync(file);
      } else if (type === 'accounts') {
        result = await importAccounts.mutateAsync(file);
      } else {
        result = await importPayroll.mutateAsync(file);
      }

      setImportResult({
        success: true,
        ...result,
      });
    } catch (error: any) {
      setImportResult({
        success: false,
        rows_processed: 0,
        rows_inserted: 0,
        rows_failed: 0,
        sample_errors: [error.response?.data?.detail || error.message || 'Import failed'],
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const renderUploadSection = (
    type: 'transactions' | 'accounts' | 'payroll',
    title: string,
    description: string,
    columns: string[],
    isPending: boolean
  ) => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            borderColor: theme.palette.info.main,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Required CSV Columns:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {columns.map((col) => (
              <Chip
                key={col}
                label={col}
                size="small"
                sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Paper>

        <Button
          variant="contained"
          component="label"
          fullWidth
          startIcon={isPending ? null : <UploadIcon />}
          disabled={isPending}
          sx={{
            py: 1.5,
            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          {isPending ? 'Importing...' : 'Select CSV File'}
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={(e) => handleFileUpload(e, type)}
          />
        </Button>

        {isPending && <LinearProgress sx={{ mt: 2 }} />}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader
        title="Data Import"
        subtitle="Upload your company data via CSV files for compliance scanning"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Settings', href: '/app/settings' },
          { label: 'Data Import' },
        ]}
      />

      {stats && (
        <Alert
          severity="info"
          icon={<FileIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            Current data: {stats.transactions} transactions, {stats.accounts} accounts,{' '}
            {stats.payroll} payroll records
          </Typography>
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              minHeight: 64,
              fontSize: '0.95rem',
            },
          }}
        >
          <Tab label="Transactions" />
          <Tab label="Accounts" />
          <Tab label="Payroll" />
        </Tabs>
      </Box>

      {importResult && (
        <Alert
          severity={importResult.success ? 'success' : 'error'}
          icon={importResult.success ? <SuccessIcon /> : <ErrorIcon />}
          sx={{ mt: 3 }}
          action={
            importResult.success && importResult.rows_inserted > 0 ? (
              <Button
                size="small"
                startIcon={<ScanIcon />}
                onClick={() => navigate('/app/scans')}
              >
                Run Scan Now
              </Button>
            ) : undefined
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {importResult.success ? 'Import Completed' : 'Import Failed'}
          </Typography>
          <Typography variant="body2">
            Processed: {importResult.rows_processed} | Inserted: {importResult.rows_inserted} |
            Failed: {importResult.rows_failed}
          </Typography>
          {importResult.sample_errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Sample Errors:
              </Typography>
              <List dense sx={{ mt: 0.5 }}>
                {importResult.sample_errors.map((error, idx) => (
                  <ListItem key={idx} sx={{ py: 0, px: 0 }}>
                    <Typography variant="caption" color="error">
                      • {error}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Alert>
      )}

      <CustomTabPanel value={tabValue} index={0}>
        {renderUploadSection(
          'transactions',
          'Transaction Data',
          'Upload transaction records for AML and fraud detection scanning',
          [
            'date',
            'amount',
            'from_account',
            'to_account',
            'transaction_id (optional)',
            'currency (optional)',
            'type (optional)',
            'channel (optional)',
          ],
          importTransactions.isPending
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        {renderUploadSection(
          'accounts',
          'Account Data',
          'Upload account information for customer risk profiling',
          [
            'account_id',
            'customer_id (optional)',
            'customer_name (optional)',
            'country (optional)',
            'risk_score (optional)',
            'segment (optional)',
          ],
          importAccounts.isPending
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        {renderUploadSection(
          'payroll',
          'Payroll Data',
          'Upload payroll records for ghost employee and salary anomaly detection',
          [
            'employee_id',
            'name',
            'salary',
            'department (optional)',
            'bank_account (optional)',
            'pay_date (optional)',
          ],
          importPayroll.isPending
        )}
      </CustomTabPanel>
    </Box>
  );
}
