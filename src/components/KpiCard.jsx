import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

// color is a theme palette name: primary, success, warning, error or info
export default function KpiCard({ label, value, caption, icon: Icon, color = 'primary' }) {
  return (
    <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: `${color}.main`,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
        }}
      >
        <Icon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h5" noWrap>
          {value}
        </Typography>
        {caption && <Typography variant="caption">{caption}</Typography>}
      </Box>
    </Paper>
  );
}