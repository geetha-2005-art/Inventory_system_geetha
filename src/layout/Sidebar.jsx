import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';

const GROUPS = [
  { title: '', paths: ['/'] },
  { title: 'Master Data', paths: ['/products', '/categories', '/suppliers'] },
  { title: 'Stock Movements', paths: ['/stock-in', '/stock-out', '/stock-adjustment', '/transactions'] },
  { title: 'Insights', paths: ['/reports'] },
];

export default function Sidebar({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <Box className="app-sidebar" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, minHeight: 76 }}>
        <Box
          className="sidebar-brand-mark"
          sx={{
            width: 39,
            height: 39,
            borderRadius: '13px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Inventory2Icon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ color: '#24314b', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.03em' }}>
            Inventory
          </Typography>
          <Typography sx={{ color: '#8491a8', fontSize: 11, lineHeight: 1.5, fontWeight: 600 }}>
            MANAGEMENT STUDIO
          </Typography>
        </Box>
      </Box>

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
                    px: 3.5,
                    pt: 2.3,
                    pb: 0.6,
                    color: '#8b97ad',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.25,
                  }}
                >
                  {group.title}
                </Typography>
              )}
              <List disablePadding sx={{ pt: group.title ? 0 : 1 }}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const selected =
                    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

                  return (
                    <ListItemButton
                      key={item.path}
                      component={Link}
                      to={item.path}
                      selected={selected}
                      onClick={onNavigate}
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

      <Box className="sidebar-footer" sx={{ px: 3, py: 2.2 }}>
        <Typography sx={{ color: '#8a96aa', fontSize: 11, fontWeight: 600 }}>
          INVENTORY SYSTEM · POC v1.0
        </Typography>
      </Box>
    </Box>
  );
}
