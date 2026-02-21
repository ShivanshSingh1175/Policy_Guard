"use client";

import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  usePolicies,
  useUploadPolicy,
  useExtractRules,
  useRules,
  useToggleRule,
} from "@/lib/hooks";
import type { Rule } from "@/lib/types";
import SeverityChip from "@/components/severity-chip";
import { format } from "date-fns";

export default function PoliciesPage() {
  const policies = usePolicies();
  const uploadPolicy = useUploadPolicy();
  const extractRules = useExtractRules();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const rules = useRules(selectedPolicyId ?? undefined);
  const toggleRule = useToggleRule();
  const [ruleDrawer, setRuleDrawer] = useState<Rule | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    try {
      await uploadPolicy.mutateAsync(file);
    } catch {
      setUploadError("Failed to upload policy. Please try again.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleExtract = async (policyId: string) => {
    try {
      await extractRules.mutateAsync(policyId);
    } catch {
      // handled by query error
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Policies & Rules
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload policy documents and manage extracted compliance rules
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Upload section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <CloudUploadIcon sx={{ color: "primary.main", fontSize: 28 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" color="text.primary">
                    Upload Policy Document
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload a PDF policy document to extract compliance rules automatically.
                  </Typography>
                </Box>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleUpload}
                />
                <Button
                  variant="contained"
                  startIcon={
                    uploadPolicy.isPending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <UploadFileIcon />
                    )
                  }
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadPolicy.isPending}
                >
                  {uploadPolicy.isPending ? "Uploading..." : "Upload PDF"}
                </Button>
              </Box>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
              {uploadPolicy.isPending && <LinearProgress sx={{ mt: 2 }} />}
            </CardContent>
          </Card>
        </Grid>

        {/* Policies table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "text.primary" }}>
                Policies
              </Typography>
              {policies.isLoading ? (
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
                        <TableCell>Name</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>Rules</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(policies.data || []).map((p) => (
                        <TableRow
                          key={p.id}
                          hover
                          selected={selectedPolicyId === p.id}
                          onClick={() => setSelectedPolicyId(p.id)}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {p.name || p.file_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(p.uploaded_at), "MMM d, yyyy")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={p.rules_count} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.status}
                              size="small"
                              color={p.status === "processed" ? "success" : "default"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={
                                extractRules.isPending ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <AutoFixHighIcon />
                                )
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExtract(p.id);
                              }}
                              disabled={extractRules.isPending}
                            >
                              Extract Rules
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!policies.data || policies.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                              No policies uploaded yet. Upload a PDF to get started.
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

        {/* Rules list for selected policy */}
        {selectedPolicyId && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="subtitle1" color="text.primary">
                    Rules for Selected Policy
                  </Typography>
                  <Button size="small" onClick={() => setSelectedPolicyId(null)}>
                    Clear Selection
                  </Button>
                </Box>
                {rules.isLoading ? (
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
                          <TableCell>Name</TableCell>
                          <TableCell>Collection</TableCell>
                          <TableCell>Severity</TableCell>
                          <TableCell>Enabled</TableCell>
                          <TableCell>Last Modified</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(rules.data || []).map((rule) => (
                          <TableRow
                            key={rule.id}
                            hover
                            onClick={() => setRuleDrawer(rule)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {rule.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={rule.collection} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <SeverityChip value={rule.severity} />
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule.enabled}
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                onChange={() =>
                                  toggleRule.mutate({
                                    ruleId: rule.id,
                                    enabled: !rule.enabled,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(rule.updated_at), "MMM d, yyyy")}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!rules.data || rules.data.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                No rules found. Try extracting rules from the policy.
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
        )}
      </Grid>

      {/* Rule detail drawer */}
      <Drawer
        anchor="right"
        open={!!ruleDrawer}
        onClose={() => setRuleDrawer(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 3 } }}
      >
        {ruleDrawer && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" color="text.primary">
                Rule Detail
              </Typography>
              <IconButton onClick={() => setRuleDrawer(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: "text.primary" }}>
              {ruleDrawer.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.primary" }}>
              {ruleDrawer.description}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <SeverityChip value={ruleDrawer.severity} />
              <Chip
                label={ruleDrawer.enabled ? "Enabled" : "Disabled"}
                size="small"
                color={ruleDrawer.enabled ? "success" : "default"}
                variant="outlined"
              />
            </Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              MongoDB Pipeline
            </Typography>
            <Box
              component="pre"
              sx={{
                bgcolor: "background.default",
                p: 2,
                borderRadius: 2,
                overflow: "auto",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                border: 1,
                borderColor: "divider",
                color: "text.primary",
              }}
            >
              {ruleDrawer.pipeline || "No pipeline available"}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
