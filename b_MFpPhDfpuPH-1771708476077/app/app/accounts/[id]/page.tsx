"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAccountDetail } from "@/lib/hooks";
import SeverityChip from "@/components/severity-chip";
import { format } from "date-fns";

function riskColor(score: number): "error" | "warning" | "success" | "default" {
  if (score >= 80) return "error";
  if (score >= 50) return "warning";
  if (score >= 20) return "success";
  return "default";
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: account, isLoading } = useAccountDetail(id);
  const [tab, setTab] = React.useState(0);

  if (isLoading) {
    return (
      <Box>
        <Skeleton height={60} width={300} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!account) {
    return (
      <Box>
        <Typography variant="h6" color="text.secondary">
          Account not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/app/accounts")}
        sx={{ mb: 2 }}
      >
        Back to Accounts
      </Button>

      {/* Top card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h5" sx={{ mb: 1, color: "text.primary" }}>
                {account.customer_name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", color: "text.secondary", mb: 2 }}
              >
                {account.account_id}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={`Risk: ${account.risk_score}`}
                  color={riskColor(account.risk_score)}
                  variant="outlined"
                />
                <Chip
                  label={account.status}
                  color={account.status === "active" ? "success" : "default"}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: { md: "right" } }}>
                <Typography variant="body2" color="text.secondary">
                  Balance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
                  ${account.balance.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label="Transactions" />
          <Tab label="Violations" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(account.transactions || []).map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(tx.date), "MMM d, yyyy")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tx.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{tx.description}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: tx.amount >= 0 ? "success.main" : "error.main" }}
                        >
                          {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!account.transactions || account.transactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No transactions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Rule</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(account.violations || []).map((v) => (
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
                        <SeverityChip value={v.severity} />
                      </TableCell>
                      <TableCell>
                        <SeverityChip value={v.status} type="status" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!account.violations || account.violations.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No violations for this account.
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
    </Box>
  );
}
