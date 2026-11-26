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
      className="app-header"
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        color: 'text.primary',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,.82)',
        borderRadius: 0,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3.5 } }}>
        <IconButton
          edge="start"
          aria-label="open navigation"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' }, color: '#536b9c' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="h1" noWrap sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}
        >
          {todayText()}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
