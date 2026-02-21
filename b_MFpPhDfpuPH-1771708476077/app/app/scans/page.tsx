"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
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
import Skeleton from "@mui/material/Skeleton";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import { useScans, useScanDetail, useRunScan, useExportScan } from "@/lib/hooks";
import { format } from "date-fns";

const statusColor: Record<string, "success" | "warning" | "error" | "default"> = {
  completed: "success",
  running: "warning",
  failed: "error",
};

export default function ScansPage() {
  const scans = useScans();
  const runScan = useRunScan();
  const exportScan = useExportScan();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const scanDetail = useScanDetail(detailId);

  const handleRunScan = async () => {
    setConfirmOpen(false);
    try {
      await runScan.mutateAsync();
    } catch {
      // error handled by query
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
            Scans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Run compliance scans and review scan history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={
            runScan.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PlayArrowIcon />
            )
          }
          onClick={() => setConfirmOpen(true)}
          disabled={runScan.isPending}
        >
          {runScan.isPending ? "Running..." : "Run Scan Now"}
        </Button>
      </Box>

      {/* Scan history */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, color: "text.primary" }}>
            Scan History
          </Typography>
          {scans.isLoading ? (
            <Box>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={56} sx={{ mb: 0.5 }} />
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Started At</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Violations</TableCell>
                    <TableCell align="right">Export</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(scans.data || []).map((scan) => (
                    <TableRow
                      key={scan.id}
                      hover
                      onClick={() => setDetailId(scan.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {format(new Date(scan.started_at), "MMM d, yyyy HH:mm")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {scan.duration_seconds != null
                            ? `${scan.duration_seconds}s`
                            : "--"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scan.status}
                          size="small"
                          color={statusColor[scan.status] || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scan.total_violations}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          <Button
                            size="small"
                            startIcon={<FileDownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportScan.mutate({ scanId: scan.id, format: "csv" });
                            }}
                          >
                            CSV
                          </Button>
                          <Button
                            size="small"
                            startIcon={<FileDownloadIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              exportScan.mutate({ scanId: scan.id, format: "json" });
                            }}
                          >
                            JSON
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!scans.data || scans.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No scans have been run yet.
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

      {/* Run Scan confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Run Compliance Scan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will execute all enabled rules against your data. The scan may take a few minutes depending on the number of rules and records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRunScan}>
            Run All Enabled Rules
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scan detail drawer */}
      <Drawer
        anchor="right"
        open={!!detailId}
        onClose={() => setDetailId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 480 }, p: 3 } }}
      >
        {detailId && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" color="text.primary">
                Scan Detail
              </Typography>
              <IconButton onClick={() => setDetailId(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {scanDetail.isLoading ? (
              <Box>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height={48} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : scanDetail.data ? (
              <>
                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                  <Chip
                    label={scanDetail.data.status}
                    color={statusColor[scanDetail.data.status] || "default"}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(scanDetail.data.started_at), "MMM d, yyyy HH:mm:ss")}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
                  <strong>Duration:</strong> {scanDetail.data.duration_seconds ?? "--"}s
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "text.primary" }}>
                  <strong>Total Violations:</strong> {scanDetail.data.total_violations}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, color: "text.primary" }}>
                  Rules Executed
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rule</TableCell>
                      <TableCell align="right">Violations</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(scanDetail.data.rule_results || []).map((r) => (
                      <TableRow key={r.rule_id}>
                        <TableCell>
                          <Typography variant="body2">{r.rule_name}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.violations_found}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Could not load scan details.
              </Typography>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
