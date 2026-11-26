import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const todayText = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function Header({ title, drawerWidth, onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: 'rgba(248, 250, 255, 0.68)',
        color: 'text.primary',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.8)',
        borderRadius: 0,
        boxShadow: '0 8px 28px rgba(38,57,94,0.045)',
        backdropFilter: 'blur(24px) saturate(170%)',
        WebkitBackdropFilter: 'blur(24px) saturate(170%)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
        <IconButton
          edge="start"
          aria-label="open navigation"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary', fontWeight: 500 }}
        >
          {todayText()}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
