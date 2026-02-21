"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useAccounts } from "@/lib/hooks";

function riskColor(score: number): "error" | "warning" | "success" | "default" {
  if (score >= 80) return "error";
  if (score >= 50) return "warning";
  if (score >= 20) return "success";
  return "default";
}

export default function AccountsPage() {
  const router = useRouter();
  const accounts = useAccounts();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.5 }}>
          Accounts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor customer accounts and risk assessments
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {accounts.isLoading ? (
            <Box>
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height={56} sx={{ mb: 0.5 }} />
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Account ID</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(accounts.data || []).map((acc) => (
                    <TableRow
                      key={acc.id}
                      hover
                      onClick={() => router.push(`/app/accounts/${acc.id}`)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                          {acc.account_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{acc.customer_name}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${acc.balance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={acc.risk_score}
                          size="small"
                          color={riskColor(acc.risk_score)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={acc.status}
                          size="small"
                          color={acc.status === "active" ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!accounts.data || accounts.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No accounts found.
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
