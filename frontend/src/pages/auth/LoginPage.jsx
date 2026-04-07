import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Nature, LockOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, rgba(0,255,100,0.1), transparent 40%), radial-gradient(circle at bottom right, rgba(0,100,40,0.1), transparent 40%), var(--sars-bg)',
      p: 2,
    }}>
      <Box className="animate-fade-in" sx={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 4,
            background: 'linear-gradient(135deg, #00C853, #1B5E20)',
            mb: 2, boxShadow: '0 8px 32px rgba(0,200,83,0.3)',
          }}>
            <Nature sx={{ fontSize: 40, color: '#fff' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>
            Welcome to SARS
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Sustainability Analytics & Reporting Platform
          </Typography>
        </Box>

        <Card className="glass" sx={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockOutlined sx={{ color: 'primary.main', fontSize: 24 }} />
              Sign Into Your Account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                id="login-email"
                fullWidth
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                sx={{ mb: 2 }}
                autoComplete="email"
                autoFocus
              />
              <TextField
                id="login-password"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          © {new Date().getFullYear()} SARS Platform. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
