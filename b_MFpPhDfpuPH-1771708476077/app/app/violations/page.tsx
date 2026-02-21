"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  useViolations,
  useViolationDetail,
  useUpdateViolation,
  useRemediateViolation,
} from "@/lib/hooks";
import type { ViolationSeverity, ViolationStatus } from "@/lib/types";
import SeverityChip from "@/components/severity-chip";
import { format } from "date-fns";

const severities: ViolationSeverity[] = ["low", "medium", "high", "critical"];
const statuses: ViolationStatus[] = ["open", "confirmed", "dismissed", "remediated"];

export default function ViolationsPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const violations = useViolations(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  );
  const detail = useViolationDetail(selectedId);
  const updateViolation = useUpdateViolation();
  const remediate = useRemediateViolation();

  const handleStatusChange = async (id: string, status: string) => {
    await updateViolation.mutateAsync({ id, status });
  };

  const handleRemediate = async () => {
    if (!selectedId || !note.trim()) return;
    await remediate.mutateAsync({ id: selectedId, note: note.trim() });
    setNote("");
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Violations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review, investigate, and remediate compliance violations
        </Typography>
      </Box>

      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ""}
                label="Severity"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, severity: e.target.value }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {severities.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ""}
                label="Status"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Account ID"
              value={filters.account_id || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, account_id: e.target.value }))
              }
              sx={{ width: 180 }}
            />

            <TextField
              size="small"
              label="From"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.from_date || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from_date: e.target.value }))
              }
            />

            <TextField
              size="small"
              label="To"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.to_date || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to_date: e.target.value }))
              }
            />

            <Button
              size="small"
              onClick={() => setFilters({})}
              sx={{ ml: "auto" }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Violations table */}
      <Card>
        <CardContent>
          {violations.isLoading ? (
            <Box>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>Rule</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(violations.data || []).map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(v.created_at), "MMM d, HH:mm")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {v.rule_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {v.account_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <SeverityChip value={v.severity} />
                      </TableCell>
                      <TableCell>
                        <SeverityChip value={v.status} type="status" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedId(v.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!violations.data || violations.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No violations match the current filters.
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

      {/* Violation detail drawer */}
      <Drawer
        anchor="right"
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, p: 3 } }}
      >
        {selectedId && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" color="text.primary">
                Violation Detail
              </Typography>
              <IconButton onClick={() => setSelectedId(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {detail.isLoading ? (
              <Box>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : detail.data ? (
              <>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <SeverityChip value={detail.data.severity} />
                  <SeverityChip value={detail.data.status} type="status" />
                </Box>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Rule
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: "text.primary" }}>
                  {detail.data.rule_name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Account
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 2, fontFamily: "monospace", color: "text.primary" }}
                >
                  {detail.data.account_id}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Explanation
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "text.primary" }}>
                  {detail.data.explanation}
                </Typography>

                {/* Snapshot */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Snapshot
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    bgcolor: "background.default",
                    p: 2,
                    borderRadius: 2,
                    overflow: "auto",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    border: 1,
                    borderColor: "divider",
                    mb: 2,
                    maxHeight: 200,
                    color: "text.primary",
                  }}
                >
                  {JSON.stringify(detail.data.snapshot, null, 2)}
                </Box>

                {/* Suggested remediation */}
                {detail.data.suggestions && detail.data.suggestions.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Suggested Remediation
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {detail.data.suggestions.map((s, i) => (
                        <Alert key={i} severity="info" sx={{ mb: 1 }}>
                          {s}
                        </Alert>
                      ))}
                    </Box>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Status actions */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: "text.primary" }}>
                  Change Status
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {detail.data.status === "open" && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() =>
                          handleStatusChange(detail.data!.id, "confirmed")
                        }
                        disabled={updateViolation.isPending}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleStatusChange(detail.data!.id, "dismissed")
                        }
                        disabled={updateViolation.isPending}
                      >
                        Dismiss
                      </Button>
                    </>
                  )}
                  {detail.data.status === "confirmed" && (
                    <Chip label="Confirmed - add remediation note below" size="small" color="warning" />
                  )}
                  {detail.data.status === "dismissed" && (
                    <Chip label="Dismissed" size="small" />
                  )}
                  {detail.data.status === "remediated" && (
                    <Chip label="Remediated" size="small" color="success" />
                  )}
                </Box>

                {/* Remediation note */}
                <Typography variant="subtitle2" sx={{ mb: 1, color: "text.primary" }}>
                  Log Remediation Action
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Describe the remediation action taken..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleRemediate}
                  disabled={!note.trim() || remediate.isPending}
                >
                  {remediate.isPending ? "Submitting..." : "Submit Remediation"}
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Could not load violation details.
              </Typography>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
