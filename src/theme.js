import { createTheme } from '@mui/material/styles';

const slate = {
  50: '#f6f8fd',
  100: '#edf1f8',
  200: '#dce4f1',
  300: '#c6d2e4',
  500: '#71809a',
  600: '#53627d',
  700: '#35435e',
  900: '#17233d',
};

const softChip = (color, background, text) => ({
  props: { color, variant: 'filled' },
  style: { backgroundColor: background, color: text },
});

const theme = createTheme({
  palette: {
    primary: { main: '#386fe8', dark: '#2858c7', light: '#7299f5' },
    success: { main: '#169b75' },
    warning: { main: '#d58a28' },
    error: { main: '#d94d62' },
    info: { main: '#398dbd' },
    background: { default: '#edf2fb', paper: 'rgba(255,255,255,0.72)' },
    text: { primary: slate[900], secondary: slate[500] },
    divider: 'rgba(153, 170, 199, 0.24)',
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 750, letterSpacing: '-0.03em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.05rem' },
    button: { textTransform: 'none', fontWeight: 650, letterSpacing: '-0.01em' },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { color: slate[900] },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.82)',
          borderRadius: 22,
          boxShadow: '0 10px 34px rgba(38,57,94,0.055), inset 0 1px 0 rgba(255,255,255,0.82)',
          backdropFilter: 'blur(22px) saturate(155%)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 13, textTransform: 'none', fontWeight: 650, paddingInline: 16 },
        contained: { boxShadow: '0 7px 18px rgba(49,103,220,0.2)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 13,
          backgroundColor: 'rgba(255,255,255,0.58)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(153,170,199,0.42)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9bb5ed' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5 },
          '&.Mui-disabled': { backgroundColor: 'rgba(237,241,248,0.7)' },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid rgba(153,170,199,0.18)' },
        head: {
          backgroundColor: 'rgba(235,241,252,0.72)',
          color: slate[600],
          fontWeight: 700,
          fontSize: '0.78rem',
          letterSpacing: '0.035em',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid rgba(153,170,199,0.24)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(226,235,252,0.42)' },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 650, borderRadius: 9 } },
      variants: [
        softChip('success', '#dff6ed', '#167454'),
        softChip('warning', '#fff1d8', '#94601b'),
        softChip('error', '#ffe5e9', '#a5364a'),
        softChip('info', '#e1f2fc', '#21698f'),
        softChip('default', slate[100], slate[700]),
      ],
    },
    MuiAlert: {
      styleOverrides: { root: { border: 'none', borderRadius: 14 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 22 } },
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
