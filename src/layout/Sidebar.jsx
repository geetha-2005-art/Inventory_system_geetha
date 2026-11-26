import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';

// Menu sections shown in the sidebar (the order inside each section follows NAV_ITEMS)
const GROUPS = [
  { title: '', paths: ['/'] },
  { title: 'Master Data', paths: ['/products', '/categories', '/suppliers'] },
  { title: 'Stock Movements', paths: ['/stock-in', '/stock-out', '/stock-adjustment', '/transactions'] },
  { title: 'Insights', paths: ['/reports'] },
];

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, minHeight: 64 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Inventory2Icon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>Inventory</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.2 }}>
            Management System
          </Typography>
        </Box>
      </Box>

      {/* Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
        {GROUPS.map((group) => {
          const items = group.paths
            .map((path) => NAV_ITEMS.find((item) => item.path === path))
            .filter(Boolean);

          return (
            <Box key={group.title || 'main'}>
              {group.title && (
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 3,
                    pt: 2,
                    pb: 0.5,
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {group.title}
                </Typography>
              )}
              <List disablePadding sx={{ pt: group.title ? 0 : 1 }}>
                {items.map((item) => {
                  const Icon = item.icon;
                  // Dashboard matches only '/', others match their whole section
                  // (so /products/5 still highlights "Products")
                  const selected =
                    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

                  return (
                    <ListItemButton
                      key={item.path}
                      component={Link}
                      to={item.path}
                      selected={selected}
                      onClick={onNavigate}
                      sx={{
                        mx: 1.5,
                        mb: 0.5,
                        py: 1,
                        borderRadius: 2,
                        color: '#94a3b8',
                        '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
                        '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 500 },
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.07)', color: '#fff' },
                        '&.Mui-selected': { backgroundColor: 'primary.main', color: '#fff' },
                        '&.Mui-selected:hover': { backgroundColor: 'primary.dark' },
                        '&.Mui-selected .MuiListItemText-primary': { fontWeight: 600 },
                      }}
                    >
                      <ListItemIcon>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: '#64748b', fontSize: 12 }}>Proof of Concept · v1.0</Typography>
      </Box>
    </Box>
  );
}