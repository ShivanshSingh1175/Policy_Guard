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
    ListItemText,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    AccountBalance as AccountIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAccounts, useAccountDetail } from '../../api/hooks/useAccounts';
import { SeverityChip } from '../../components/common/SeverityChip';

export default function AccountsPage() {
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const { data: accounts, isLoading, error } = useAccounts();
    const { data: detail, isLoading: detailLoading } = useAccountDetail(selectedAccountId);

    const handleOpenDetail = (accountId: string) => {
        setSelectedAccountId(accountId);
    };

    const handleCloseDetail = () => {
        setSelectedAccountId(null);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load accounts. Please try again later.</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <PageHeader
                title="Accounts"
                subtitle="Manage and monitor account risk scores based on policy compliance"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Accounts' },
                ]}
            />

            <Card
                sx={{
                    background: 'linear-gradient(135deg, rgba(40, 114, 161, 0.05) 0%, rgba(19, 47, 76, 1) 100%)',
                }}
            >
                <CardContent>
                    <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Account ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Balance</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Risk Score</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts?.map((account) => (
                                    <tr
                                        key={account._id}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(40, 114, 161, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <td style={{ padding: '12px' }}>{account.account_id}</td>
                                        <td style={{ padding: '12px' }}>{account.account_type}</td>
                                        <td style={{ padding: '12px' }}>${account.balance?.toLocaleString()}</td>
                                        <td style={{ padding: '12px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: `${Math.min(account.risk_score || 0, 100)}%`,
                                                            height: '100%',
                                                            bgcolor:
                                                                (account.risk_score || 0) > 50
                                                                    ? '#F44336'
                                                                    : (account.risk_score || 0) > 20
                                                                        ? '#FF9800'
                                                                        : '#4CAF50',
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {account.risk_score || 0}
                                                </Typography>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <SeverityChip
                                                severity={account.status === 'ACTIVE' ? 'LOW' : 'HIGH'}
                                                label={account.status}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDetail(account.account_id)}
                                                sx={{ color: '#2872A1' }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </CardContent>
            </Card>

            <Drawer
                anchor="right"
                open={!!selectedAccountId}
                onClose={handleCloseDetail}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 450 }, bgcolor: '#0A1929', color: 'white' },
                }}
            >
                <Box sx={{ p: 0 }}>
                    <Box
                        sx={{
                            p: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, #132F4C 0%, #0A1929 100%)',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountIcon sx={{ color: '#2872A1' }} />
                            <Typography variant="h6">Account Details</Typography>
                        </Box>
                        <IconButton onClick={handleCloseDetail} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : detail ? (
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <CardContent>
                                            <Typography variant="overline" color="text.secondary">
                                                Account Information
                                            </Typography>
                                            <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                                                {detail.account_id}
                                            </Typography>
                                            <Grid container sx={{ mt: 2 }} spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Type
                                                    </Typography>
                                                    <Typography variant="body2">{detail.account_type}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Balance
                                                    </Typography>
                                                    <Typography variant="body2">${detail.balance?.toLocaleString()}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Transactions
                                                    </Typography>
                                                    <Typography variant="body2">{detail.transaction_count}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Typography variant="body2">{detail.status}</Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <CardContent>
                                            <Typography variant="overline" color="text.secondary" gutterBottom>
                                                Risk Analysis
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: detail.risk_score.risk_score > 30 ? '#F44336' : '#4CAF50' }}>
                                                    {detail.risk_score.risk_score}
                                                </Typography>
                                                <SeverityChip severity={detail.risk_score.risk_level} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Calculated at: {new Date(detail.risk_score.calculated_at).toLocaleString()}
                                            </Typography>

                                            <Box sx={{ mt: 3 }}>
                                                <Typography variant="body2" gutterBottom>Severity Breakdown</Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="#F44336">{detail.risk_score.high_severity_count}</Typography>
                                                        <Typography variant="caption">High</Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="#FF9800">{detail.risk_score.medium_severity_count}</Typography>
                                                        <Typography variant="caption">Med</Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1 }}>
                                                        <Typography variant="h6" color="#4CAF50">{detail.risk_score.low_severity_count}</Typography>
                                                        <Typography variant="caption">Low</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ px: 1, mb: 1 }}>Recent Violations</Typography>
                                    <List>
                                        {detail.recent_violations.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No violations detected for this account.</Typography>
                                        ) : (
                                            detail.recent_violations.map((v) => (
                                                <ListItem key={v.id} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, mb: 1 }}>
                                                    <ListItemText
                                                        primary={v.rule_name}
                                                        secondary={new Date(v.created_at).toLocaleDateString()}
                                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                    />
                                                    <SeverityChip severity={v.severity as any} />
                                                </ListItem>
                                            ))
                                        )}
                                    </List>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <Box sx={{ p: 3 }}>
                            <Typography>No data found.</Typography>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
}
