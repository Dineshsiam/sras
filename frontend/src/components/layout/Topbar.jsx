import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar,
  Menu, MenuItem, Divider, Box, Chip, Tooltip
} from '@mui/material';
import { Notifications, Logout, AccountCircle, Settings } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const ROLE_COLORS = {
  ADMIN:    { bg: '#B71C1C', text: '#fff' },
  MANAGER:  { bg: '#E65100', text: '#fff' },
  ANALYST:  { bg: '#1565C0', text: '#fff' },
  EMPLOYEE: { bg: '#1B5E20', text: '#fff' },
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { handleMenuClose(); logout(); navigate('/login'); };

  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.EMPLOYEE;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        {/* Page breadcrumb placeholder */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Sustainability Analytics & Reporting
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={() => navigate('/notifications')} sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Role badge */}
          <Chip
            label={user?.role}
            size="small"
            sx={{ bgcolor: roleStyle.bg, color: roleStyle.text, fontWeight: 700, fontSize: '0.7rem', height: 24 }}
          />

          {/* User avatar */}
          <Tooltip title={user?.name || 'User'}>
            <Avatar
              onClick={handleMenuOpen}
              sx={{
                width: 36, height: 36, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                bgcolor: 'primary.main', color: 'primary.contrastText',
                border: '2px solid', borderColor: 'primary.dark',
                '&:hover': { borderColor: 'primary.light' },
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ gap: 1.5 }}>
          <AccountCircle fontSize="small" /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: 'error.main' }}>
          <Logout fontSize="small" /> Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
