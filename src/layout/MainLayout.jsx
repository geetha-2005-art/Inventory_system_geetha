import { useState } from 'react';
import { Box, Drawer, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { getPageTitle } from './navItems';

const DRAWER_WIDTH = 250;

const drawerPaperSx = {
  width: DRAWER_WIDTH,
  boxSizing: 'border-box',
  background: 'linear-gradient(165deg, rgba(24, 39, 72, 0.94), rgba(17, 29, 56, 0.97))',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 0,
  boxShadow: '8px 0 34px rgba(26, 43, 78, 0.12)',
  backdropFilter: 'blur(28px) saturate(150%)',
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const closeDrawer = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        title={getPageTitle(pathname)}
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={() => setMobileOpen(true)}
      />

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={closeDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          <Sidebar onNavigate={closeDrawer} />
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          minWidth: 0,
          minHeight: '100vh',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1480, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
