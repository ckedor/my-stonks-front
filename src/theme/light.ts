import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    chart: {
      grid: string
      colors: string[]
      label: string
    }
    golden: string
    dark: string
    sidebar: string
    topbar: {
      background: string
      text: string
    }
  }

  interface PaletteOptions {
    chart?: {
      grid?: string
      colors?: string[]
      label?: string
    }
    golden?: string
    dark?: string
    sidebar?: string
    topbar?: {
      background?: string
      text?: string
    }
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'rgb(249, 243, 234)', // areia-clara suave
      paper:   'rgb(249, 245, 238)', // contraste leve nos cards
    },
    text: {
      primary:   '#3b2f2f', // marrom escuro elegante
      secondary: '#6e5e52', // tom mais quente para subtítulos
    },
    dark: '#3b2f2f',
    sidebar: '#f8f4eeff',
    topbar: {
      background: '#F0E6D4',  // cor de fundo do topbar
      text: '#4A3A2A',        // cor do texto/ícones do topbar
    },
    primary:   { main: '#a67c52' },   // marrom-terra sofisticado
    secondary: { main: '#d4a056' },   // bege acinzentado para contrastes
    error:     { main: '#c14d36' },   // terracota quente
    warning:   { main: '#d8a24a' },   // dourado queimado
    success:   { main: '#6b8e23' },   // verde-oliva natural
    info:      { main: '#8ba6a9' },   // azul acinzentado neutro
    golden:    '#d4a056',
    divider:   'rgba(0,0,0,0.08)',
    chart: {
      grid: '#d3c5b2', // bege acinzentado suave
      label: '#3b2f2f',
      colors: [
        '#a67c52',
        '#d8a24a',
        '#b37a50',
        '#cdb891',
        '#7f6a4d',
        '#9c8b6d',
        '#bfa88e',
        '#e0b869',
      ],
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0px 2px 6px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', sans-serif`,
    h6: { fontWeight: 600 },
    body1: { color: '#3b2f2f' },
    body2: { color: '#6e5e52' },
  },
})