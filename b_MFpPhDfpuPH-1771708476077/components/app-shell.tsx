"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PolicyIcon from "@mui/icons-material/Policy";
import RadarIcon from "@mui/icons-material/Radar";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldIcon from "@mui/icons-material/Shield";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/lib/auth-context";
import { useThemeMode } from "@/lib/theme-context";

const DRAWER_WIDTH = 264;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/app/dashboard" },
  { label: "Policies & Rules", icon: <PolicyIcon />, path: "/app/policies" },
  { label: "Scans", icon: <RadarIcon />, path: "/app/scans" },
  { label: "Violations", icon: <WarningAmberIcon />, path: "/app/violations" },
  { label: "Accounts", icon: <AccountBalanceIcon />, path: "/app/accounts" },
  { label: "Analytics", icon: <BarChartIcon />, path: "/app/analytics" },
  { label: "Settings", icon: <SettingsIcon />, path: "/app/settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isDemo } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2.5,
            background: "linear-gradient(135deg, #1E3A5F 0%, #2D5A8E 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldIcon sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem", color: "text.primary", lineHeight: 1.2 }}>
            PolicyGuard
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem", letterSpacing: "0.04em" }}>
            AML COMPLIANCE
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                router.push(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                py: 1,
                transition: "all 0.15s ease",
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.08 : 0.2),
                  color: "primary.main",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.12 : 0.25) },
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
                "&:not(.Mui-selected):hover": {
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, "& .MuiSvgIcon-root": { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: isActive ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* User section */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: alpha(theme.palette.secondary.main, 0.15),
            color: "secondary.main",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </Avatar>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.8rem" }}>
            {user?.email || "user@company.com"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.7rem" }}>
              {user?.role || "admin"}
            </Typography>
            {isDemo && (
              <Chip
                label="DEMO"
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  bgcolor: alpha("#F59E0B", 0.15),
                  color: "#F59E0B",
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(12px)",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ minHeight: "56px !important" }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />
            <IconButton
              onClick={toggleMode}
              sx={{
                mr: 0.5,
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
            >
              {mode === "light" ? (
                <DarkModeIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              ) : (
                <LightModeIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              )}
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(theme.palette.secondary.main, 0.15),
                  color: "secondary.main",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: { minWidth: 180, mt: 1, borderRadius: 3, border: 1, borderColor: "divider" },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.company_name}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
                sx={{ gap: 1.5, py: 1 }}
              >
                <LogoutIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3.5 },
            bgcolor: "background.default",
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
