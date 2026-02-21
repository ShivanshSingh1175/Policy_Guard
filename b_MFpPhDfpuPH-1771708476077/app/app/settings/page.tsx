"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import { useAuth } from "@/lib/auth-context";
import {
  useAlertSettings,
  useSaveAlertSettings,
  useSchedules,
  useSaveSchedule,
} from "@/lib/hooks";
import type { AlertSettings, ViolationSeverity } from "@/lib/types";

const severities: ViolationSeverity[] = ["low", "medium", "high", "critical"];

export default function SettingsPage() {
  const { user } = useAuth();
  const alertSettings = useAlertSettings();
  const saveAlerts = useSaveAlertSettings();
  const schedules = useSchedules();
  const saveSchedule = useSaveSchedule();

  const [alerts, setAlerts] = useState<AlertSettings>({
    email: "",
    slack_webhook: "",
    webhook_url: "",
    min_severity: "high",
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    frequency: "hourly",
    interval_hours: 24,
    enabled: true,
  });

  useEffect(() => {
    if (alertSettings.data) {
      setAlerts(alertSettings.data);
    }
  }, [alertSettings.data]);

  const handleSaveAlerts = async () => {
    try {
      await saveAlerts.mutateAsync(alerts);
      setSnackMsg("Alert settings saved successfully.");
      setSnackOpen(true);
    } catch {
      setSnackMsg("Failed to save alert settings.");
      setSnackOpen(true);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await saveSchedule.mutateAsync(newSchedule);
      setScheduleDialog(false);
      setSnackMsg("Schedule created successfully.");
      setSnackOpen(true);
    } catch {
      setSnackMsg("Failed to create schedule.");
      setSnackOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure alerts, scan schedules, and organization details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Company / User info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "text.primary" }}>
                Organization
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <BusinessIcon sx={{ color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {user?.company_name || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PersonIcon sx={{ color: "primary.main" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User / Role
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {user?.email || "N/A"}
                  </Typography>
                  <Chip label={user?.role || "admin"} size="small" variant="outlined" sx={{ ml: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alert configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "text.primary" }}>
                Alert Configuration
              </Typography>
              {alertSettings.isLoading ? (
                <Box>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} height={56} sx={{ mb: 1 }} />
                  ))}
                </Box>
              ) : (
                <>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={alerts.email}
                    onChange={(e) =>
                      setAlerts((prev) => ({ ...prev, email: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Slack Webhook URL"
                    value={alerts.slack_webhook}
                    onChange={(e) =>
                      setAlerts((prev) => ({ ...prev, slack_webhook: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Webhook URL"
                    value={alerts.webhook_url}
                    onChange={(e) =>
                      setAlerts((prev) => ({ ...prev, webhook_url: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Min Severity</InputLabel>
                    <Select
                      value={alerts.min_severity}
                      label="Min Severity"
                      onChange={(e) =>
                        setAlerts((prev) => ({
                          ...prev,
                          min_severity: e.target.value as ViolationSeverity,
                        }))
                      }
                    >
                      {severities.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleSaveAlerts}
                    disabled={saveAlerts.isPending}
                  >
                    {saveAlerts.isPending ? "Saving..." : "Save Alert Settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Scan schedules */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                <Typography variant="subtitle1" color="text.primary">
                  Scan Schedules
                </Typography>
                <Button variant="outlined" size="small" onClick={() => setScheduleDialog(true)}>
                  Add Schedule
                </Button>
              </Box>
              {schedules.isLoading ? (
                <Box>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} height={56} sx={{ mb: 0.5 }} />
                  ))}
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Interval (hours)</TableCell>
                        <TableCell>Enabled</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(schedules.data || []).map((sch) => (
                        <TableRow key={sch.id} hover>
                          <TableCell>
                            <Chip label={sch.frequency} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{sch.interval_hours}h</Typography>
                          </TableCell>
                          <TableCell>
                            <Switch checked={sch.enabled} size="small" disabled />
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!schedules.data || schedules.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                              No schedules configured.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Schedule dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Scan Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSchedule.frequency}
                label="Frequency"
                onChange={(e) =>
                  setNewSchedule((prev) => ({ ...prev, frequency: e.target.value }))
                }
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Interval (hours)"
              type="number"
              value={newSchedule.interval_hours}
              onChange={(e) =>
                setNewSchedule((prev) => ({
                  ...prev,
                  interval_hours: parseInt(e.target.value) || 1,
                }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSchedule} disabled={saveSchedule.isPending}>
            {saveSchedule.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSnackOpen(false)} sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
