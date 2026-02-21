"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import ShieldIcon from "@mui/icons-material/Shield";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useAuth } from "@/lib/auth-context";
import { useLogin } from "@/lib/hooks";

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuth, loginDemo } = useAuth();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginMutation.mutateAsync({ email, password });
      await setAuth(data.access_token);
      router.push("/app/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Invalid credentials. Please try again.";
      setError(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <ShieldIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 800 }}>
              PolicyGuard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              AML Compliance Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ py: 1.5, borderRadius: 2.5, fontSize: "0.9rem" }}
            >
              {loginMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="OR" size="small" sx={{ fontSize: "0.7rem", fontWeight: 700 }} />
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              loginDemo();
              router.push("/app/dashboard");
            }}
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              fontSize: "0.9rem",
              borderColor: "divider",
              color: "text.primary",
              borderWidth: 1.5,
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                borderWidth: 1.5,
              },
            }}
          >
            Demo Login
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "center", mt: 1.5, fontSize: "0.72rem" }}
          >
            Explore with pre-loaded sample data -- no backend required
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
