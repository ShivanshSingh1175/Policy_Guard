import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as ImplementedIcon,
  RadioButtonUnchecked as NotImplementedIcon,
  TrendingUp as CoverageIcon,
  PlayArrow as ImplementIcon,
} from '@mui/icons-material';
import { PageHeader } from '../../components/common/PageHeader';
import { useCoverage, useRecommendations, useImplementRecommendation, useImportDataset } from '../../api/hooks/useCoverage';
import { SeverityChip } from '../../components/common/SeverityChip';

export default function CoveragePage() {
  const theme = useTheme();
  const { data: coverage, isLoading: coverageLoading } = useCoverage();
  const { data: recommendations, isLoading: recsLoading, refetch } = useRecommendations();
  const implementMutation = useImplementRecommendation();
  const importMutation = useImportDataset();

  const handleImplement = async (id: string) => {
    await implementMutation.mutateAsync(id);
    refetch();
  };

  const handleImport = async () => {
    await importMutation.mutateAsync();
    refetch();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return theme.palette.error.main;
      case 'HIGH': return theme.palette.warning.main;
      case 'MEDIUM': return theme.palette.info.main;
      case 'LOW': return theme.palette.success.main;
      default: return theme.palette.text.secondary;
    }
  };

  if (coverageLoading || recsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Dataset Coverage"
        subtitle="Track implementation of compliance recommendations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/app/dashboard' },
          { label: 'Coverage' },
        ]}
        action={
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importMutation.isPending}
            startIcon={importMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Dataset'}
          </Button>
        }
      />

      {/* Coverage Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {coverage?.coverage_percent || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coverage
                  </Typography>
                </Box>
                <CoverageIcon sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={coverage?.coverage_percent || 0}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {coverage?.implemented_controls || 0} / {coverage?.total_recommendations || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Implemented Controls
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {(coverage?.total_recommendations || 0) - (coverage?.implemented_controls || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Implementation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recommendations Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Compliance Recommendations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Control ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Violations</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations?.map((rec) => (
                  <TableRow key={rec.id} hover>
                    <TableCell>
                      <Chip label={rec.control_id} size="small" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {rec.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rec.regulatory_reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rec.risk_level}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRiskColor(rec.risk_level), 0.2),
                          color: getRiskColor(rec.risk_level),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {rec.implemented ? (
                        <Chip
                          icon={<ImplementedIcon />}
                          label="Implemented"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<NotImplementedIcon />}
                          label="Not Implemented"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {rec.violations_detected > 0 ? (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rec.violations_detected}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {!rec.implemented && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ImplementIcon />}
                          onClick={() => handleImplement(rec.id)}
                          disabled={implementMutation.isPending}
                        >
                          Implement
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
