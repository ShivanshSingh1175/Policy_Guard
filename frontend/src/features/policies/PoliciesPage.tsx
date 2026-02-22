import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
} from '@mui/material';
import {
  Upload as UploadIcon,
  AutoFixHigh as ExtractIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as PolicyIcon,
  Rule as RuleIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import {
  usePolicies,
  useUploadPolicy,
  useUpdatePolicy,
  useDeletePolicy,
  useExtractRules
} from '../../api/hooks/usePolicies';
import { useRules, useToggleRule } from '../../api/hooks/useRules';
import { SeverityChip } from '../../components/common/SeverityChip';
import { PageHeader } from '../../components/common/PageHeader';

export default function PoliciesPage() {
  const navigate = useNavigate();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<{ id: string, name: string, description: string } | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const { data: rules, isLoading: rulesLoading, isFetching: rulesFetching } = useRules(selectedPolicyId || undefined);

  const uploadPolicy = useUploadPolicy();
  const updatePolicy = useUpdatePolicy();
  const deletePolicy = useDeletePolicy();
  const extractRules = useExtractRules();
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

  const handleExtractRules = (policyId: string) => {
    setScanResult(null);
    extractRules.mutate(
      { id: policyId, autoScan: true },
      {
        onSuccess: (data) => {
          if (data.scan_summary) {
            setScanResult(data);
          }
        }
      }
    );
  };

  const handleEditPolicy = (policy: any) => {
    setEditingPolicy({ id: policy.id, name: policy.name, description: policy.description || '' });
    setEditDialogOpen(true);
  };

  const handleSavePolicy = () => {
    if (editingPolicy) {
      updatePolicy.mutate(editingPolicy, {
        onSuccess: () => setEditDialogOpen(false)
      });
    }
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy and all its rules?')) {
      deletePolicy.mutate(policyId, {
        onSuccess: () => {
          if (selectedPolicyId === policyId) setSelectedPolicyId(null);
        }
      });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Policies & Rules"
        subtitle="Upload policy documents and manage extracted compliance rules"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Policies & Rules' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            component="label"
            disabled={uploadPolicy.isPending}
            sx={{
              px: 3,
              py: 1.2,
              boxShadow: '0 4px 14px 0 rgba(40, 114, 161, 0.39)',
            }}
          >
            {uploadPolicy.isPending ? 'Uploading...' : 'Upload Policy PDF'}
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Policies Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <PolicyIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Policy Documents</Typography>
              </Box>

              {policiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box sx={{ p: 1 }}>
                  {policies?.length === 0 ? (
                    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No policies uploaded yet.
                      </Typography>
                    </Box>
                  ) : (
                    policies?.map((policy) => (
                      <Card
                        key={policy.id}
                        elevation={0}
                        sx={{
                          mb: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          bgcolor: selectedPolicyId === policy.id ? 'rgba(40, 114, 161, 0.08)' : 'transparent',
                          border: selectedPolicyId === policy.id ? '1px solid #2872A1' : '1px solid transparent',
                          '&:hover': {
                            bgcolor: 'rgba(40, 114, 161, 0.04)',
                            '& .policy-actions': { opacity: 1 }
                          },
                        }}
                        onClick={() => setSelectedPolicyId(policy.id)}
                      >
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ pr: 6 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
                                {policy.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {policy.description}
                              </Typography>
                            </Box>

                            <Box
                              className="policy-actions"
                              sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                gap: 0.5
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip title="Edit Policy">
                                <IconButton size="small" onClick={() => handleEditPolicy(policy)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Policy">
                                <IconButton size="small" color="error" onClick={() => handleDeletePolicy(policy.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip label={`v${policy.version}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(policy.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Rules Column */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RuleIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Extracted Rules & Mapping
                  </Typography>
                </Box>

                {selectedPolicyId && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={extractRules.isPending ? <CircularProgress size={16} /> : <ExtractIcon />}
                    disabled={extractRules.isPending}
                    onClick={() => handleExtractRules(selectedPolicyId)}
                  >
                    {extractRules.isPending ? 'Extracting...' : 'Extract Rules'}
                  </Button>
                )}
              </Box>

              {scanResult && (
                <Alert
                  severity="success"
                  icon={<SuccessIcon />}
                  sx={{ m: 2 }}
                  action={
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate('/app/violations')}
                    >
                      View Violations
                    </Button>
                  }
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Rules extracted: {scanResult.rules_created} | Initial scan completed
                  </Typography>
                  <Typography variant="body2">
                    {scanResult.scan_summary.total_violations} violations found
                    {scanResult.scan_summary.high > 0 && ` (${scanResult.scan_summary.high} High`}
                    {scanResult.scan_summary.medium > 0 && `, ${scanResult.scan_summary.medium} Medium`}
                    {scanResult.scan_summary.low > 0 && `, ${scanResult.scan_summary.low} Low`}
                    {scanResult.scan_summary.high > 0 && ')'}
                  </Typography>
                </Alert>
              )}

              {!selectedPolicyId ? (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Select a policy to view its compliance rules
                  </Typography>
                </Box>
              ) : rulesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Box sx={{ p: 0 }}>
                  {rules?.length === 0 ? (
                    <Box sx={{ py: 10, px: 3, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>No rules extracted yet</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Use our AI engine to transform this policy document into executable monitoring rules.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<ExtractIcon />}
                        onClick={() => handleExtractRules(selectedPolicyId)}
                        disabled={extractRules.isPending}
                      >
                        Run AI Rule Extraction
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(0,0,0,0.54)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Rule Name</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(0,0,0,0.54)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Mapping</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(0,0,0,0.54)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Severity</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: 'rgba(0,0,0,0.54)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules?.map((rule) => (
                            <tr
                              key={rule.id}
                              style={{
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <td style={{ padding: '16px' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{rule.name}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300 }}>
                                  {rule.description}
                                </Typography>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Chip
                                    label={rule.framework || 'AML'}
                                    size="small"
                                    sx={{ width: 'fit-content', height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(40, 114, 161, 0.1)', color: '#2872A1' }}
                                  />
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                    {rule.control_id || '-'}
                                  </Typography>
                                </Box>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <SeverityChip severity={rule.severity as any} />
                              </td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <Switch
                                  size="small"
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
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Policy Metadata</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <TextField
              label="Policy Name"
              fullWidth
              value={editingPolicy?.name || ''}
              onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={editingPolicy?.description || ''}
              onChange={(e) => setEditingPolicy(prev => prev ? { ...prev, description: e.target.value } : null)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePolicy}
            disabled={updatePolicy.isPending}
          >
            {updatePolicy.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
