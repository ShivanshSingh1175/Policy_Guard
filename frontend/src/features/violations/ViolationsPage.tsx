import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useViolations, useUpdateViolation } from '../../api/hooks/useViolations';
import type { Violation } from '../../types';

export default function ViolationsPage() {
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [newStatus, setNewStatus] = useState<Violation['status']>('OPEN');
  const [reviewerNote, setReviewerNote] = useState('');

  const { data: violations, isLoading } = useViolations({
    severity: severityFilter || undefined,
    status: statusFilter || undefined,
  });
  const updateViolation = useUpdateViolation();

  const handleOpenDialog = (violation: Violation) => {
    setSelectedViolation(violation);
    setNewStatus(violation.status);
    setReviewerNote(violation.reviewer_note || '');
  };

  const handleCloseDialog = () => {
    setSelectedViolation(null);
    setReviewerNote('');
  };

  const handleUpdateViolation = () => {
    if (selectedViolation) {
      updateViolation.mutate(
        {
          id: selectedViolation.id,
          status: newStatus,
          reviewer_note: reviewerNote,
        },
        {
          onSuccess: () => {
            handleCloseDialog();
          },
        }
      );
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'CONFIRMED': return 'warning';
      case 'DISMISSED': return 'success';
      case 'FALSE_POSITIVE': return 'info';
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
        Violations
      </Typography>

      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={severityFilter}
                label="Severity"
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="DISMISSED">Dismissed</MenuItem>
                <MenuItem value="FALSE_POSITIVE">False Positive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
        }}
      >
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Rule</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Record ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Detected At</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations?.map((violation) => (
                    <tr
                      key={violation.id}
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
                      <td style={{ padding: '12px' }}>{violation.rule_name}</td>
                      <td style={{ padding: '12px' }}>{violation.document_id}</td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={violation.severity}
                          color={getSeverityColor(violation.severity) as any}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Chip
                          label={violation.status}
                          color={getStatusColor(violation.status) as any}
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        {new Date(violation.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(violation)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedViolation} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Violation Details</DialogTitle>
        <DialogContent>
          {selectedViolation && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Rule
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedViolation.rule_name}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                Explanation
              </Typography>
              <Typography variant="body2" gutterBottom>
                {selectedViolation.explanation || 'No explanation provided'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                Document Data
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                }}
              >
                {JSON.stringify(selectedViolation.document_data, null, 2)}
              </Box>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value as Violation['status'])}
                >
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="DISMISSED">Dismissed</MenuItem>
                  <MenuItem value="FALSE_POSITIVE">False Positive</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reviewer Note"
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateViolation}
            variant="contained"
            disabled={updateViolation.isPending}
            sx={{
              background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D5A7F 0%, #2872A1 100%)',
              },
            }}
          >
            {updateViolation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
