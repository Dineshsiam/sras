import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00C853',
      light: '#69F0AE',
      dark: '#1B5E20',
      contrastText: '#000000',
    },
    secondary: {
      main: '#76FF03',
      light: '#CCFF90',
      dark: '#33691E',
    },
    background: {
      default: '#050805',
      paper: '#0E120E',
    },
    surface: {
      main: '#161D16',
    },
    text: {
      primary: '#F1F8F1',
      secondary: '#81C784',
    },
    error: { main: '#FF5252' },
    warning: { main: '#FFD740' },
    info: { main: '#40C4FF' },
    success: { main: '#00E676' },
    divider: 'rgba(0,200,83,0.18)',
  },
  typography: {
    fontFamily: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 22px',
          boxShadow: 'none',
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0,200,83,0.35)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00D357 0%, #00963E 100%)',
          color: '#000000',
          fontWeight: 700,
          '&:hover': { background: 'linear-gradient(135deg, #00E676 0%, #00A647 100%)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(20,28,20,0.8) 0%, rgba(14,20,14,0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,200,83,0.08)',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,200,83,0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#0E120E',
          border: '1px solid rgba(0,200,83,0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(5, 8, 5, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,200,83,0.12)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#0A0E0A',
          borderRight: '1px solid rgba(0,200,83,0.12)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: 'rgba(0,200,83,0.05)',
            fontWeight: 700,
            color: '#00E676',
            borderBottom: '1px solid rgba(0,200,83,0.18)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: 'rgba(255,255,255,0.02)',
          '&.Mui-focused': {
            background: 'rgba(255,255,255,0.04)',
          }
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
             borderColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
             borderColor: 'rgba(0,200,83,0.3)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
             borderColor: '#00C853',
          },
        }
      }
    }
  },
});

export default theme;
