import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tooltip, Box, Typography, Divider, alpha
} from '@mui/material';
import {
  Dashboard, AddCircleOutline, ListAlt, FactCheck, Analytics,
  Assessment, People, Business, Notifications, ChevronLeft, ChevronRight,
  Nature
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 68;

const allNavItems = [
  { label: 'Dashboard',       path: '/dashboard',        icon: <Dashboard />,          roles: ['ADMIN','MANAGER','ANALYST','EMPLOYEE'] },
  { label: 'Submit Data',     path: '/data-entry',       icon: <AddCircleOutline />,   roles: ['ADMIN','ANALYST','EMPLOYEE'] },
  { label: 'My Submissions',  path: '/my-submissions',   icon: <ListAlt />,            roles: ['ADMIN','ANALYST','EMPLOYEE'] },
  { label: 'Validation Queue',path: '/validation-queue', icon: <FactCheck />,          roles: ['ADMIN','ANALYST'] },
  { label: 'Analytics',       path: '/analytics',        icon: <Analytics />,          roles: ['ADMIN','MANAGER','ANALYST'] },
  { label: 'Reports',         path: '/reports',          icon: <Assessment />,         roles: ['ADMIN','MANAGER'] },
  { label: 'Notifications',   path: '/notifications',    icon: <Notifications />,      roles: ['ADMIN','MANAGER','ANALYST','EMPLOYEE'] },
  { divider: true,            roles: ['ADMIN'] },
  { label: 'Users',           path: '/users',            icon: <People />,             roles: ['ADMIN'] },
  { label: 'Org Setup',       path: '/org-setup',        icon: <Business />,           roles: ['ADMIN'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = allNavItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH,
          transition: 'width 0.25s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 2.5,
        borderBottom: '1px solid', borderColor: 'divider',
        minHeight: 64,
      }}>
        <Nature sx={{ color: 'primary.main', fontSize: 28, flexShrink: 0 }} />
        {!collapsed && (
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
            SARS
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '0.62rem' }}>
              Sustainability Platform
            </Typography>
          </Typography>
        )}
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, py: 1 }}>
        {navItems.map((item, idx) => {
          if (item.divider) return (
            <Divider key={idx} sx={{ my: 1, borderColor: 'divider' }} />
          );

          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    bgcolor: active ? alpha('#00C853', 0.15) : 'transparent',
                    border: active ? '1px solid' : '1px solid transparent',
                    borderColor: active ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: alpha('#00C853', 0.08) },
                    px: collapsed ? 1.5 : 2,
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: collapsed ? 0 : 36,
                    color: active ? 'primary.main' : 'text.secondary',
                    mr: collapsed ? 0 : 1.5,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14, fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Collapse toggle */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
          <ListItemButton onClick={onToggle} sx={{ borderRadius: 2, justifyContent: 'center', py: 1 }}>
            {collapsed ? <ChevronRight sx={{ color: 'text.secondary' }} /> : <ChevronLeft sx={{ color: 'text.secondary' }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
