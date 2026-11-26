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
  backgroundColor: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: 0,
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const closeDrawer = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        title={getPageTitle(pathname)}
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={() => setMobileOpen(true)}
      />

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Slide-out drawer for tablet / small screens */}
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

        {/* Always-visible sidebar for desktop */}
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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar /> {/* spacer so content starts below the fixed header */}
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}