import { Box, Grid, Paper, Typography, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useCases } from '../../api/hooks/useCases';
import { useViolations } from '../../api/hooks/useViolations';
import { PageHeader } from '../../components/common/PageHeader';
import MetricCard from '../../components/common/MetricCard';
import { ErrorState } from '../../components/common/ErrorState';
import { Assignment, Warning, PriorityHigh } from '@mui/icons-material';

export default function MyWorkPage() {
  const { data: cases, isLoading: casesLoading, error: casesError } = useCases();
  const { data: violations, isLoading: violationsLoading, error: violationsError } = useViolations();

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?.id;

  if (casesLoading || violationsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (casesError || violationsError) {
    return <ErrorState message="Failed to load your work items" />;
  }

  const myCases = cases?.filter(c => c.assigned_to_user_id === currentUserId) || [];
  const myViolations = violations?.filter(v => v.assigned_to_user_id === currentUserId) || [];
  
  const criticalCases = myCases.filter(c => c.severity === 'CRITICAL' && c.status === 'OPEN');
  const criticalViolations = myViolations.filter(v => v.severity === 'CRITICAL' && v.status === 'OPEN');
  const criticalCount = criticalCases.length + criticalViolations.length;

  return (
    <Box>
      <PageHeader title="My Work" subtitle="Your assigned cases and violations" />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <MetricCard title="Open Cases" value={myCases.filter(c => c.status === 'OPEN').length} icon={<Assignment />} color="primary" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard title="Open Violations" value={myViolations.filter(v => v.status === 'OPEN').length} icon={<Warning />} color="warning" />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard title="Critical Items" value={criticalCount} icon={<PriorityHigh />} color="error" />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>My Cases</Typography>
            {myCases.length === 0 ? (
              <Typography color="text.secondary">No cases assigned to you</Typography>
            ) : (
              <List>
                {myCases.slice(0, 10).map((caseItem) => (
                  <ListItem key={caseItem.id} divider>
                    <ListItemText primary={caseItem.title} secondary={'Status: ' + caseItem.status} />
                    <Chip label={caseItem.severity} size="small" color={caseItem.severity === 'CRITICAL' ? 'error' : caseItem.severity === 'HIGH' ? 'warning' : caseItem.severity === 'MEDIUM' ? 'info' : 'default'} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>My Violations</Typography>
            {myViolations.length === 0 ? (
              <Typography color="text.secondary">No violations assigned to you</Typography>
            ) : (
              <List>
                {myViolations.slice(0, 10).map((violation) => (
                  <ListItem key={violation.id} divider>
                    <ListItemText primary={violation.rule_name || 'Violation'} secondary={'Document: ' + violation.document_id} />
                    <Chip label={violation.severity} size="small" color={violation.severity === 'CRITICAL' ? 'error' : violation.severity === 'HIGH' ? 'warning' : violation.severity === 'MEDIUM' ? 'info' : 'default'} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
