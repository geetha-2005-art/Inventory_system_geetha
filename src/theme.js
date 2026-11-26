import { createTheme } from '@mui/material/styles';

const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  900: '#0f172a',
};

// Soft chip colours: light background with dark text
const softChip = (color, background, text) => ({
  props: { color, variant: 'filled' },
  style: { backgroundColor: background, color: text },
});

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb', dark: '#1d4ed8', light: '#3b82f6' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    info: { main: '#0284c7' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
    text: { primary: slate[900], secondary: slate[500] },
    divider: slate[200],
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600, fontSize: '1.05rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none', border: `1px solid ${slate[200]}` },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: slate[300] },
          '&.Mui-disabled': { backgroundColor: slate[50] },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${slate[100]}` },
        head: {
          backgroundColor: slate[50],
          color: slate[600],
          fontWeight: 600,
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap',
          borderBottom: `1px solid ${slate[200]}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: slate[50] },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } },
      variants: [
        softChip('success', '#dcfce7', '#166534'),
        softChip('warning', '#fef3c7', '#92400e'),
        softChip('error', '#fee2e2', '#991b1b'),
        softChip('info', '#e0f2fe', '#075985'),
        softChip('default', slate[100], slate[700]),
      ],
    },
    MuiAlert: {
      styleOverrides: { root: { border: 'none', borderRadius: 10 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 48 } },
    },
    // Small grey text under a value, e.g. product name under its code
    MuiTypography: {
      variants: [
        { props: { variant: 'caption' }, style: { display: 'block', color: slate[500] } },
      ],
    },
  },
});

export default theme;