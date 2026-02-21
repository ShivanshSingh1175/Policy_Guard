import { useState } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { usePolicies, useUploadPolicy } from '../../api/hooks/usePolicies';
import { useRules, useToggleRule } from '../../api/hooks/useRules';

export default function PoliciesPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const { data: rules, isLoading: rulesLoading } = useRules(selectedPolicyId || undefined);
  const uploadPolicy = useUploadPolicy();
  const toggleRule = useToggleRule();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPolicy.mutate(file);
    }
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    toggleRule.mutate({ id: ruleId, enabled });
  };

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
        Policies & Rules
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Policies</Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  component="label"
                  disabled={uploadPolicy.isPending}
                >
                  Upload PDF
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                </Button>
              </Box>

              {uploadPolicy.isSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Policy uploaded successfully!
                </Alert>
              )}

              {policiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {policies?.map((policy) => (
                    <Card
                      key={policy.id}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: selectedPolicyId === policy.id ? 'action.selected' : 'background.paper',
                      }}
                      onClick={() => setSelectedPolicyId(policy.id)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1">{policy.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {policy.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip label={`v${policy.version}`} size="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(policy.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rules
              </Typography>

              {rulesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Collection</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Enabled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules?.map((rule) => (
                        <tr key={rule.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>
                            <Typography variant="body2">{rule.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rule.description}
                            </Typography>
                          </td>
                          <td style={{ padding: '12px' }}>{rule.collection}</td>
                          <td style={{ padding: '12px' }}>
                            <Chip
                              label={rule.severity}
                              color={getSeverityColor(rule.severity) as any}
                              size="small"
                            />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <Switch
                              checked={rule.enabled}
                              onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                              disabled={toggleRule.isPending}
                            />
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
      </Grid>
    </Box>
  );
}
