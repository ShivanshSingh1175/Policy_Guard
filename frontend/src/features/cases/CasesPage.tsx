import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
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
    Skeleton,
    useTheme,
    alpha,
    Tooltip,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    Assignment as CaseIcon,
    Send as SendIcon,
    History as HistoryIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useCases, useCase, useUpdateCase, useAddCaseComment } from '../../api/hooks/useCases';
import { SeverityChip } from '../../components/common/SeverityChip';
import { StatusChip } from '../../components/common/StatusChip';

export default function CasesPage() {
    const theme = useTheme();
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [commentText, setCommentText] = useState('');

    const { data: cases, isLoading, error } = useCases({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
    });
    const { data: detail, isLoading: detailLoading } = useCase(selectedCaseId);

    const updateCase = useUpdateCase();
    const addComment = useAddCaseComment();

    const handleOpenDetail = (caseId: string) => {
        setSelectedCaseId(caseId);
    };

    const handleCloseDetail = () => {
        setSelectedCaseId(null);
        setCommentText('');
    };

    const handleStatusChange = (newStatus: string) => {
        if (selectedCaseId) {
            updateCase.mutate({ id: selectedCaseId, status: newStatus });
        }
    };

    const handleAddComment = () => {
        if (selectedCaseId && commentText.trim()) {
            addComment.mutate(
                { id: selectedCaseId, comment: commentText },
                {
                    onSuccess: () => setCommentText(''),
                }
            );
        }
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="Investigation Cases" breadcrumbs={[{ label: 'Cases' }]} />
                <Alert severity="error" sx={{ mt: 2 }}>
                    Failed to load investigation cases. Please try again later.
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Investigation Cases"
                subtitle="Manage end-to-end compliance investigations and case lifecycle"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Cases' },
                ]}
            />

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Filter by Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Filter by Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="OPEN">Open</MenuItem>
                                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                                <MenuItem value="CLOSED">Closed</MenuItem>
                            </Select>
                        </FormControl>
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
                                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Case Title</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Primary Account</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Severity</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'left', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Created</th>
                                        <th style={{ padding: '16px', textAlign: 'right', color: theme.palette.text.secondary, fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cases?.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                                                <Typography color="text.secondary">No cases found matching your criteria.</Typography>
                                            </td>
                                        </tr>
                                    ) : (
                                        cases?.map((c) => (
                                            <tr
                                                key={c.id}
                                                style={{ borderBottom: `1px solid ${theme.palette.divider}`, transition: 'background-color 0.2s' }}
                                                onClick={() => handleOpenDetail(c.id)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.04);
                                                    e.currentTarget.style.cursor = 'pointer';
                                                }}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '16px' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.title}</Typography>
                                                </td>
                                                <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 600, color: theme.palette.primary.main }}>{c.primary_account_id || '-'}</td>
                                                <td style={{ padding: '16px' }}><SeverityChip severity={c.severity as any} /></td>
                                                <td style={{ padding: '16px' }}>
                                                    <StatusChip status={c.status === 'OPEN' ? 'ERROR' : c.status === 'IN_REVIEW' ? 'PENDING' : 'COMPLETED'} />
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDetail(c.id); }}>
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
                open={!!selectedCaseId}
                onClose={handleCloseDetail}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 600 },
                        bgcolor: theme.palette.background.default,
                        backgroundImage: 'none'
                    }
                }}
            >
                {detailLoading ? (
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Skeleton variant="text" width="60%" height={40} />
                        <Skeleton variant="rectangular" height={100} />
                        <Skeleton variant="rectangular" height={200} />
                    </Box>
                ) : detail ? (
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
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Case Investigation</Typography>
                                <Typography variant="caption" color="text.secondary">ID: {detail.id}</Typography>
                            </Box>
                            <IconButton onClick={handleCloseDetail}><CloseIcon /></IconButton>
                        </Box>

                        <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>{detail.title}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                    <SeverityChip severity={detail.severity as any} />
                                    <StatusChip status={detail.status === 'OPEN' ? 'ERROR' : detail.status === 'IN_REVIEW' ? 'PENDING' : 'COMPLETED'} />
                                </Box>
                            </Box>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Primary Account</Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{detail.primary_account_id || 'N/A'}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Current Assignee</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <PersonIcon fontSize="small" color="primary" />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{detail.assigned_to_user_name || 'Unassigned'}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Investigation Actions</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleStatusChange('OPEN')}
                                    disabled={detail.status === 'OPEN' || updateCase.isPending}
                                >
                                    Reopen Case
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleStatusChange('IN_REVIEW')}
                                    disabled={detail.status === 'IN_REVIEW' || updateCase.isPending}
                                >
                                    Start Review
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleStatusChange('CLOSED')}
                                    disabled={detail.status === 'CLOSED' || updateCase.isPending}
                                    sx={{ boxShadow: `0 4px 14px 0 ${alpha(theme.palette.success.main, 0.3)}` }}
                                >
                                    Close & Resolve
                                </Button>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Evidence Portfolio</Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                Linked violations being investigated in this case:
                            </Typography>
                            <Box sx={{ mb: 4 }}>
                                {detail.linked_violation_ids?.length === 0 ? (
                                    <Alert severity="info" variant="outlined">No violations linked to this case yet.</Alert>
                                ) : (
                                    detail.linked_violation_ids?.map((vid, idx) => (
                                        <Paper
                                            key={vid}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                mb: 1,
                                                bgcolor: alpha(theme.palette.action.hover, 0.3),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                EVIDENCE_{idx + 1}: {vid}
                                            </Typography>
                                            <IconButton size="small"><VisibilityIcon fontSize="inherit" /></IconButton>
                                        </Paper>
                                    ))
                                )}
                            </Box>

                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>Collaboration & Audit Log</Typography>
                            <List sx={{ mb: 3 }}>
                                {detail.comments?.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: 'italic' }}>
                                        No investigation notes available.
                                    </Typography>
                                ) : (
                                    detail.comments?.map((c, i) => (
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
                                    placeholder="Add investigation note..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    multiline
                                />
                                <IconButton
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim() || addComment.isPending}
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
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">Case information not found.</Typography>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}
