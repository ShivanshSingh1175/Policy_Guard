import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  LinearProgress,
  Divider,
} from '@mui/material';
import { LockOutlined, SecurityOutlined, Google as GoogleIcon } from '@mui/icons-material';
import axios from 'axios';
import { auth, signInWithGoogle } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase, authenticate with backend
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await axios.post(`${API_URL}/auth/firebase-login`, {
            firebase_token: idToken,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          });

          const { access_token, user } = response.data;
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/app/dashboard');
        } catch (err: any) {
          console.error('Backend authentication failed:', err);
          setError('Failed to authenticate with backend. Please try again.');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const firebaseUser = await signInWithGoogle();
      const idToken = await firebaseUser.getIdToken();

      // Authenticate with backend
      const response = await axios.post(`${API_URL}/auth/firebase-login`, {
        firebase_token: idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      });

      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/app/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      
      // Show user-friendly error message
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Google login failed. Please try email/password login or check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A1929 0%, #132F4C 50%, #1D5A7F 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(40, 114, 161, 0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.1)' },
        },
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            width: '100%',
            animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            zIndex: 1,
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(30px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
          <CardContent sx={{ p: 5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  animation: 'float 3s ease-in-out infinite',
                  boxShadow: '0px 8px 24px rgba(40, 114, 161, 0.4)',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <SecurityOutlined sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 1,
                }}
              >
                PolicyGuard
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                AI-Powered Compliance Platform
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-20px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{
                mb: 3,
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                boxShadow: '0px 8px 16px rgba(66, 133, 244, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #3367D6 0%, #2D8E47 100%)',
                  boxShadow: '0px 12px 24px rgba(66, 133, 244, 0.4)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <form onSubmit={handleEmailLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoFocus
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 12px rgba(40, 114, 161, 0.2)',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 12px rgba(40, 114, 161, 0.2)',
                    },
                  },
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LockOutlined />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #2872A1 0%, #3A8BC2 100%)',
                  boxShadow: '0px 8px 16px rgba(40, 114, 161, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D5A7F 0%, #2872A1 100%)',
                    boxShadow: '0px 12px 24px rgba(40, 114, 161, 0.4)',
                  },
                }}
              >
                {loading ? 'Logging in...' : 'Sign In with Email'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
