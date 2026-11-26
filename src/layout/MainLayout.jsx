import { useState } from 'react';
import { Box, Drawer, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { getPageTitle } from './navItems';

const DRAWER_WIDTH = 258;

const drawerPaperSx = {
  width: DRAWER_WIDTH,
  boxSizing: 'border-box',
  background: 'rgba(247, 250, 255, 0.82)',
  color: '#24314b',
  border: '1px solid rgba(255,255,255,.9)',
  borderRadius: 0,
  boxShadow: '10px 0 38px rgba(52, 76, 122, .055)',
  backdropFilter: 'blur(26px) saturate(160%)',
  WebkitBackdropFilter: 'blur(26px) saturate(160%)',
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const closeDrawer = () => setMobileOpen(false);

  return (
    <Box className="app-shell" sx={{ display: 'flex' }}>
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
        className="app-main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3.5 },
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        <Box className="app-main-content" sx={{ maxWidth: 1480, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
