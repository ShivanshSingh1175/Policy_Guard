import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';

function SimpleApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage('Login successful! Token: ' + data.access_token.substring(0, 20) + '...');
      } else {
        setMessage('Login failed: ' + response.status);
      }
    } catch (error) {
      setMessage('Error: ' + error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          PolicyGuard Login
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Simple working version
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            placeholder="demo@amlbank.com"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            placeholder="demo12345"
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
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            Test Credentials:
          </Typography>
          <Typography variant="caption" display="block">
            Email: demo@amlbank.com
          </Typography>
          <Typography variant="caption" display="block">
            Password: demo12345
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default SimpleApp;
