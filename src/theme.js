import { createTheme } from '@mui/material/styles';

const slate = {
  50: '#f7f9fd',
  100: '#eef2f8',
  200: '#e2e8f2',
  300: '#cbd5e4',
  500: '#71809a',
  600: '#53627b',
  700: '#34435d',
  900: '#172033',
};

const softChip = (color, background, text) => ({
  props: { color, variant: 'filled' },
  style: { backgroundColor: background, color: text },
});

const theme = createTheme({
  palette: {
    primary: { main: '#4778e5', dark: '#315fc8', light: '#82a6f5' },
    success: { main: '#1c9b72' },
    warning: { main: '#d58a32' },
    error: { main: '#d95d68' },
    info: { main: '#368fc4' },
    background: { default: '#eef3fb', paper: 'rgba(255,255,255,.72)' },
    text: { primary: slate[900], secondary: slate[500] },
    divider: slate[200],
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: { fontWeight: 750, letterSpacing: '-.035em' },
    h5: { fontWeight: 750, letterSpacing: '-.03em' },
    h6: { fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-.02em' },
    button: { textTransform: 'none', fontWeight: 650 },
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
        root: { borderRadius: 12, textTransform: 'none', fontWeight: 650 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,.76)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,157,190,.3)' },
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
          fontWeight: 700,
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          borderBottom: `1px solid ${slate[200]}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(234,241,255,.55)' },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 650, borderRadius: 9 } },
      variants: [
        softChip('success', '#def5eb', '#167453'),
        softChip('warning', '#fff1d9', '#986018'),
        softChip('error', '#fde7e9', '#a83f4b'),
        softChip('info', '#e2f2fb', '#216b96'),
        softChip('default', slate[100], slate[700]),
      ],
    },
    MuiAlert: {
      styleOverrides: { root: { border: 'none', borderRadius: 14 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 650, minHeight: 48 } },
    },
    MuiTypography: {
      variants: [
        { props: { variant: 'caption' }, style: { display: 'block', color: slate[500] } },
      ],
    },
  },
});

export default theme;
