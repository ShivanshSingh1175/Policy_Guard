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
        Policies & Rules
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Policies</Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  component="label"
                  disabled={uploadPolicy.isPending}
                  sx={{
                    background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D5A7F 0%, #2872A1 100%)',
                    },
                  }}
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
                        bgcolor: selectedPolicyId === policy.id ? 'rgba(40, 114, 161, 0.2)' : 'background.paper',
                        border: selectedPolicyId === policy.id ? '2px solid #2872A1' : '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          borderColor: '#2872A1',
                          boxShadow: '0px 4px 12px rgba(40, 114, 161, 0.2)',
                        },
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
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
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
                        <tr
                          key={rule.id}
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
