import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Avatar, Divider, Alert } from '@mui/material';
import { AccountCircle, Save, LockReset } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return;
    setSuccess('Password updated successfully (Mock Action).');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <Box className="animate-fade-in" sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AccountCircle fontSize="large" color="primary" /> My Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card className="glass" sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Avatar
                sx={{
                  width: 96, height: 96, mx: 'auto', mb: 2,
                  bgcolor: 'primary.dark', color: 'primary.main',
                  fontSize: '2.5rem', fontWeight: 800,
                  border: '4px solid rgba(0,200,83,0.3)',
                }}
              >
                {initials}
              </Avatar>
              <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
              <Box sx={{
                display: 'inline-block', px: 2, py: 0.5, borderRadius: 4,
                bgcolor: 'rgba(0,200,83,0.1)', color: 'primary.light', fontWeight: 700, fontSize: '0.8rem'
              }}>
                {user?.role} Access
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Account Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" value={user?.name || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" value={user?.email || ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Organization ID" value={user?.organizationId || '—'} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Role" value={user?.role || ''} InputProps={{ readOnly: true }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockReset color="primary" /> Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

              <form onSubmit={handlePasswordChange}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Current Password" required value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="password" label="New Password" required value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="password" label="Confirm New Password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} error={form.confirmPassword !== '' && form.newPassword !== form.confirmPassword} helperText={form.confirmPassword !== '' && form.newPassword !== form.confirmPassword ? "Passwords don't match" : ""} />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button type="submit" variant="contained" startIcon={<Save />}>
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
