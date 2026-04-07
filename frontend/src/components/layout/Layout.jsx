import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 68;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH}px`,
          transition: 'margin 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Topbar />
        <Box sx={{ flex: 1, p: 3, pt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
