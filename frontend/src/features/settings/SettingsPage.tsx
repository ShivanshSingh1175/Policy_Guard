import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Tabs,
    Tab,
    useTheme,
    alpha,
    Paper,
    Chip,
    Alert,
} from '@mui/material';
import {
    Notifications as NotificationIcon,
    Schedule as ScheduleIcon,
    Security as SecurityIcon,
    Email as EmailIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    VpnKey as KeyIcon,
    CloudDownload as DownloadIcon,
    History as HistoryIcon,
    Info as InfoIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAlertConfigs, useScanSchedules } from '../../api/hooks/useSettings';

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

export default function SettingsPage() {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const { data: alerts } = useAlertConfigs();
    const { data: schedules } = useScanSchedules();

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <PageHeader
                title="Account Settings"
                subtitle="Manage your platform configuration, automated cycles, and security perimeter"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/app/dashboard' },
                    { label: 'Settings' },
                ]}
            />

            <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 700,
                            minHeight: 64,
                            fontSize: '0.95rem'
                        },
                    }}
                >
                    <Tab icon={<NotificationIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Alert Intelligence" />
                    <Tab icon={<ScheduleIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Scan Cycles" />
                    <Tab icon={<SecurityIcon sx={{ mr: 1, fontSize: 20 }} />} iconPosition="start" label="Platform Security" />
                </Tabs>
            </Box>

            <CustomTabPanel value={tabValue} index={0}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Card>
                            <CardContent>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Notification Channels</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Real-time alerts for critical policy violations as they are detected.
                                    </Typography>
                                </Box>

                                <List sx={{ mb: 3 }}>
                                    {alerts?.length === 0 ? (
                                        <Alert severity="info" variant="outlined">No active alert channels configured.</Alert>
                                    ) : (
                                        alerts?.map((alert) => (
                                            <Paper key={alert.id} variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
                                                <ListItem disableGutters>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{alert.channel}</Typography>
                                                                <Chip label={alert.min_severity} size="small" color={alert.min_severity === 'CRITICAL' ? 'error' : 'warning'} variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                                                            </Box>
                                                        }
                                                        secondary={`Push alerts for ${alert.min_severity} findings and above`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Switch checked={alert.enabled} size="small" />
                                                            <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                                        </Box>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            </Paper>
                                        ))
                                    )}
                                </List>

                                <Button
                                    startIcon={<AddIcon />}
                                    variant="contained"
                                    fullWidth
                                    sx={{ py: 1.5, boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}` }}
                                >
                                    Configure New Alerting Route
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <EmailIcon color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Security Report Digest</Typography>
                                </Box>
                                <Alert severity="info" icon={<InfoIcon fontSize="small" />} sx={{ mb: 3, bgcolor: 'transparent' }}>
                                    Weekly summaries are sent every Monday at 09:00 UTC.
                                </Alert>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Recipient List"
                                    placeholder="security-leads@company.com"
                                    defaultValue="shivansh@policyguard.ai"
                                    sx={{ mb: 3 }}
                                />
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enable Daily Delta Reports</Typography>}
                                    sx={{ mb: 3 }}
                                />
                                <Button variant="outlined" fullWidth>Update Recipients</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={1}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Automated Surveillance Cycles</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Manage the frequency and depth of automated compliance scans.
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{ borderRadius: 2 }}
                            >
                                Create Schedule
                            </Button>
                        </Box>

                        <List>
                            {schedules?.length === 0 ? (
                                <Box sx={{ py: 8, textAlign: 'center' }}>
                                    <ScheduleIcon sx={{ fontSize: 48, color: theme.palette.action.disabled, mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>No Active Cycles</Typography>
                                    <Typography variant="body2" color="text.secondary">Automate your compliance by creating a scan schedule.</Typography>
                                </Box>
                            ) : (
                                schedules?.map((s) => (
                                    <Paper key={s.id} variant="outlined" sx={{ p: 2, mb: 2, borderLeft: `4px solid ${s.enabled ? theme.palette.success.main : theme.palette.action.disabled}` }}>
                                        <ListItem disableGutters>
                                            <ListItemText
                                                primary={<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.name}</Typography>}
                                                secondary={
                                                    <Box sx={{ mt: 0.5, display: 'flex', gap: 2 }}>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <HistoryIcon fontSize="inherit" /> Every {s.frequency}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <TrendingUpIcon fontSize="inherit" /> Next: {s.next_run || 'TBD'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Chip label={s.enabled ? 'ACTIVE' : 'PAUSED'} size="small" variant="outlined" color={s.enabled ? 'success' : 'default'} />
                                                <Switch checked={s.enabled} color="success" />
                                            </Box>
                                        </ListItem>
                                    </Paper>
                                ))
                            )}
                        </List>
                    </CardContent>
                </Card>
            </CustomTabPanel>

            <CustomTabPanel value={tabValue} index={2}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <KeyIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Integrations & API</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Issue secure tokens for service-to-service communication. API keys provide full read/write access to your company perimeter.
                                </Typography>

                                <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Active Production Key</Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>pk_live_********************8a3b</Typography>
                                        </Box>
                                        <IconButton color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Paper>

                                <Button variant="outlined" fullWidth startIcon={<AddIcon />}>Generate Service Token</Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <HistoryIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Vault Retention</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Define how long investigation records and evidence snapshots are retained in the primary vault.
                                </Typography>

                                <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                                    <InputLabel>Record Retention Policy</InputLabel>
                                    <Select value={90} label="Record Retention Policy">
                                        <MenuItem value={30}>30 Days (Fast Purge)</MenuItem>
                                        <MenuItem value={90}>90 Days (Standard)</MenuItem>
                                        <MenuItem value={365}>365 Days (Compliance Long-term)</MenuItem>
                                        <MenuItem value={0}>Indefinite (Custom Tier)</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                                    <Button variant="contained" color="secondary" fullWidth startIcon={<DownloadIcon />}>
                                        Export Audit Log
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px dashed ${theme.palette.error.main}` }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="error" sx={{ fontWeight: 800 }}>Danger Zone</Typography>
                                    <Typography variant="caption" color="text.secondary">Irreversible actions on company data perimeter.</Typography>
                                </Box>
                                <Button color="error" variant="text" sx={{ fontWeight: 700 }}>Wipe Peripheral Data</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </CustomTabPanel>
        </Box>
    );
}
