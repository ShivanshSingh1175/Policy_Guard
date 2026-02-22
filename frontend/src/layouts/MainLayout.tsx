import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Scanner as ScannerIcon,
  Warning as WarningIcon,
  AccountBalance as AccountIcon,
  Analytics as AnalyticsIcon,
  Assignment as CasesIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Explore as GuideIcon,
  AssignmentInd as AssignmentIndIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';
import { GuidedDemoDrawer } from '../components/common/GuidedDemoDrawer';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { text: 'My Work', icon: <AssignmentIndIcon />, path: '/app/my-work' },
  { text: 'Coverage', icon: <AssessmentIcon />, path: '/app/coverage' },
  { text: 'Policies & Rules', icon: <DescriptionIcon />, path: '/app/policies' },
  { text: 'Scans', icon: <ScannerIcon />, path: '/app/scans' },
  { text: 'Violations', icon: <WarningIcon />, path: '/app/violations' },
  { text: 'Accounts', icon: <AccountIcon />, path: '/app/accounts' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/app/analytics' },
  { text: 'Cases', icon: <CasesIcon />, path: '/app/cases' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/app/settings' },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [guidedDemoOpen, setGuidedDemoOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : {};
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return {};
    }
  };

  const user = getUser();

  const drawer = (
    <div>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #2872A1 0%, #1D5A7F 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
            P
          </Typography>
        </Box>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'white' }}>
          PolicyGuard
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(40, 114, 161, 0.3)' }} />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(40, 114, 161, 0.2)',
                  borderLeft: '4px solid #2872A1',
                  '&:hover': {
                    backgroundColor: 'rgba(40, 114, 161, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(40, 114, 161, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#2872A1' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {user.company_name || 'Compliance Platform'}
          </Typography>
          <Chip
            label={`${user.name} • ${user.role}`}
            sx={{
              mr: 2,
              backgroundColor: 'rgba(40, 114, 161, 0.2)',
              fontWeight: 500,
            }}
          />
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                mr: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'rotate(180deg)',
                },
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Guided Demo">
            <IconButton
              onClick={() => setGuidedDemoOpen(true)}
              sx={{
                mr: 1,
                bgcolor: 'rgba(40, 114, 161, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(40, 114, 161, 0.3)',
                },
              }}
            >
              <GuideIcon />
            </IconButton>
          </Tooltip>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
      
      <GuidedDemoDrawer open={guidedDemoOpen} onClose={() => setGuidedDemoOpen(false)} />
    </Box>
  );
}
