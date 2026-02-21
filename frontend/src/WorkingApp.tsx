import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Dashboard, Policy, Scanner, Warning, Analytics, Menu as MenuIcon, Logout } from '@mui/icons-material';

function WorkingApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [email, setEmail] = useState('demo@amlbank.com');
  const [password, setPassword] = useState('demo12345');
  const [message, setMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        setIsLoggedIn(true);
        setMessage('Login successful!');
      } else {
        setMessage('Login failed. Check credentials.');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            PolicyGuard
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            AI-Powered Compliance Platform
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Login
            </Button>
            
            {message && (
              <Typography sx={{ mt: 2 }} color={message.includes('successful') ? 'success.main' : 'error.main'}>
                {message}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    );
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, page: 'dashboard' },
    { text: 'Policies', icon: <Policy />, page: 'policies' },
    { text: 'Scans', icon: <Scanner />, page: 'scans' },
    { text: 'Violations', icon: <Warning />, page: 'violations' },
    { text: 'Analytics', icon: <Analytics />, page: 'analytics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            PolicyGuard
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.page} disablePadding>
                <ListItemButton
                  selected={currentPage === item.page}
                  onClick={() => setCurrentPage(item.page)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          {currentPage === 'dashboard' && (
            <Box>
              <Typography variant="h4" gutterBottom>Dashboard</Typography>
              <Typography>Welcome to PolicyGuard! Your compliance monitoring system is active.</Typography>
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">Quick Stats</Typography>
                <Typography>• 100 violations detected</Typography>
                <Typography>• 3 active rules</Typography>
                <Typography>• 1 policy uploaded</Typography>
              </Paper>
            </Box>
          )}
          
          {currentPage === 'policies' && (
            <Box>
              <Typography variant="h4" gutterBottom>Policies</Typography>
              <Typography>Manage your compliance policies here.</Typography>
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">AML Compliance Policy</Typography>
                <Typography variant="body2" color="text.secondary">Version 1.0 • 997 characters</Typography>
              </Paper>
            </Box>
          )}
          
          {currentPage === 'scans' && (
            <Box>
              <Typography variant="h4" gutterBottom>Scans</Typography>
              <Typography>View and run compliance scans.</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>Run New Scan</Button>
            </Box>
          )}
          
          {currentPage === 'violations' && (
            <Box>
              <Typography variant="h4" gutterBottom>Violations</Typography>
              <Typography>100 violations found from recent scans.</Typography>
            </Box>
          )}
          
          {currentPage === 'analytics' && (
            <Box>
              <Typography variant="h4" gutterBottom>Analytics</Typography>
              <Typography>View compliance analytics and trends.</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default WorkingApp;
