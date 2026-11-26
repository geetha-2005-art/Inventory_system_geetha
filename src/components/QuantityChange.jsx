import { Typography } from '@mui/material';

// +15 in green, -8 in red
export default function QuantityChange({ value }) {
  const text = value > 0 ? `+${value}` : String(value);
  const color = value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.primary';
  return (
    <Typography component="span" variant="body2" sx={{ fontWeight: 600, color }}>
      {text}
    </Typography>
  );
}