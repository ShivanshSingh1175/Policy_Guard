import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  IconButton,
  Drawer,
  Divider,
  List,
  ListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Paper,
  Tooltip,
  Avatar,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Send as SendIcon,
  AssignmentInd as AssignIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import {
  useViolations,
  useUpdateViolation,
  useAddViolationComment,
  useAssignViolation
} from '../../api/hooks/useViolations';
import { useCreateCase } from '../../api/hooks/useCases';
import type { Violation } from '../../types';
import { SeverityChip } from '../../components/common/SeverityChip';
import { StatusChip } from '../../components/common/StatusChip';
import { PageHeader } from '../../components/common/PageHeader';

export default function ViolationsPage() {
  const theme = useTheme();
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [commentText, setCommentText] = useState('');

  const { data: violations, isLoading, error } = useViolations({
    severity: severityFilter || undefined,
    status: statusFilter || undefined,
  });

  const updateViolation = useUpdateViolation();
  const addComment = useAddViolationComment();
  const assignViolation = useAssignViolation();
  const createCase = useCreateCase();

  const handleOpenDetail = (violation: Violation) => {
    setSelectedViolation(violation);
  };

  const handleCloseDetail = () => {
    setSelectedViolation(null);
    setCommentText('');
  };

  const handleStatusChange = (newStatus: Violation['status']) => {
    if (selectedViolation) {
      updateViolation.mutate({ id: selectedViolation.id, status: newStatus });
    }
  };

  const handleAddComment = () => {
    if (selectedViolation && commentText.trim()) {
      addComment.mutate(
        { violationId: selectedViolation.id, comment: commentText },
        { onSuccess: () => setCommentText('') }
      );
    }
  };

  const handleCreateCase = () => {
    if (selectedViolation) {
      createCase.mutate({
        title: `Case: ${selectedViolation.rule_name} - ${selectedViolation.document_id}`,
        primary_account_id: selectedViolation.document_data?.account_id || selectedViolation.document_id,
        severity: selectedViolation.severity,
        violation_ids: [selectedViolation.id],
      });
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load violations. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Violations"
        subtitle="Review and manage compliance exceptions detected by the policy engine"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Violations' },
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filter by Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Filter by Severity"
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <MenuItem value="">All Severities</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="DISMISSED">Dismissed</MenuItem>
                <MenuItem value="FALSE_POSITIVE">False Positive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Rule / Control</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Record ID</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Severity</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Assignee</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations?.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                        <Typography color="text.secondary">No violations found matching your criteria.</Typography>
                      </td>
                    </tr>
                  ) : (
                    violations?.map((v) => (
                      <tr
                        key={v.id}
                        style={{ borderBottom: `1px solid ${theme.palette.divider}`, transition: 'background-color 0.2s' }}
                        onClick={() => handleOpenDetail(v)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.04);
                          e.currentTarget.style.cursor = 'pointer';
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{v.rule_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{v.collection}</Typography>
                        </td>
                        <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 600, color: theme.palette.primary.main }}>{v.document_id}</td>
                        <td style={{ padding: '16px' }}><SeverityChip severity={v.severity as any} /></td>
                        <td style={{ padding: '16px' }}>
                          <StatusChip status={v.status === 'OPEN' ? 'ERROR' : v.status === 'CONFIRMED' ? 'PENDING' : 'COMPLETED'} />
                        </td>
                        <td style={{ padding: '16px' }}>
                          {v.assigned_to_user_name ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: theme.palette.primary.main }}>
                                {v.assigned_to_user_name.charAt(0)}
                              </Avatar>
                              <Typography variant="caption">{v.assigned_to_user_name}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDetail(v); }}>
                            <VisibilityIcon fontSize="small" color="primary" />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={!!selectedViolation}
        onClose={handleCloseDetail}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 600 },
            bgcolor: theme.palette.background.default,
            backgroundImage: 'none'
          }
        }}
      >
        {selectedViolation && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Violation Analysis</Typography>
                <Typography variant="caption" color="text.secondary">ID: {selectedViolation.id}</Typography>
              </Box>
              <IconButton onClick={handleCloseDetail}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>{selectedViolation.rule_name}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <SeverityChip severity={selectedViolation.severity as any} />
                  <StatusChip status={selectedViolation.status === 'OPEN' ? 'ERROR' : 'COMPLETED'} />
                </Box>

                <Alert severity="info" variant="outlined" sx={{ mb: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedViolation.explanation || 'No AI-generated explanation available for this violation.'}
                  </Typography>
                </Alert>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Data Source</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedViolation.collection}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Record ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedViolation.document_id}</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Evidence Reference</Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? '#0D1117' : '#F6F8FA',
                  mb: 4,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  borderRadius: 2
                }}
              >
                <pre style={{ margin: 0 }}>{JSON.stringify(selectedViolation.document_data, null, 2)}</pre>
              </Paper>

              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Investigation Actions</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange('CONFIRMED')}
                  disabled={selectedViolation.status === 'CONFIRMED'}
                >
                  Confirm Issue
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleStatusChange('DISMISSED')}
                  disabled={selectedViolation.status === 'DISMISSED'}
                >
                  Dismiss
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCase}
                  disabled={createCase.isPending}
                  sx={{ boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}` }}
                >
                  Create Case
                </Button>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Collaboration & Audit Log</Typography>
              <List sx={{ mb: 3 }}>
                {selectedViolation.comments?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
                    No comments yet. Be the first to add an investigation note.
                  </Typography>
                ) : (
                  selectedViolation.comments?.map((c, i) => (
                    <Box key={i} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.action.hover, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>{c.user_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(c.created_at).toLocaleString()}</Typography>
                      </Box>
                      <Typography variant="body2">{c.comment}</Typography>
                    </Box>
                  ))
                )}
              </List>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a note..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  multiline
                />
                <IconButton
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                    borderRadius: 2,
                    height: 40,
                    width: 40
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
