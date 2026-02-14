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

    // 🔧 Mais contraste de camadas: fundo menos “amarelado”, cards mais neutros
    background: {
      default: '#FBFAF7', // off-white neutro (menos areia)
      paper: '#FFFFFF',   // cards realmente brancos = separação clara
    },

    // 🔧 Texto menos “marrom em tudo”: melhora legibilidade e aparência premium
    text: {
      primary: '#1F2328',   // quase-preto neutro (mais “institucional”)
      secondary: '#5C6670', // cinza quente, sem ficar “lavado”
    },

    dark: '#1F2328',

    // 🔧 Sidebar/topbar com leve nuance quente, mas separados do background
    sidebar: '#F6F3ED',
    topbar: {
      background: '#F3EEE4',
      text: '#2B2F33',
    },

    // 🔧 Primário mais profundo (não tão “caramelo”), melhora foco do olhar
    primary: { main: '#8B5E34' },   // terra mais escuro (premium)
    secondary: { main: '#C8923B' }, // dourado queimado (accent)

    // 🔧 Estados mais “clean”
    error:     { main: '#c14d36' },   // terracota quente
    warning: { main: '#B7791F' },
    success:   { main: '#6b8e23' },   // verde-oliva natural
    info: { main: '#3C6E8F' },

    golden: '#C8923B',

    // 🔧 Divisórias mais sutis e quentes
    divider: 'rgba(31, 35, 40, 0.10)',

    // 🔧 Gráfico: grid bem mais leve + paleta com contraste real
    chart: {
      grid: 'rgba(31, 35, 40, 0.12)', // antes estava muito presente
      label: '#1F2328',
      colors: [
        '#8B5E34', // primary
        '#C8923B', // golden
        '#2F6F4E', // success
        '#3C6E8F', // info
        '#B45309', // warm orange
        '#6B7280', // neutral gray
        '#A16207', // amber
        '#9A6B4F', // muted brown
      ],
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',

          // 🔧 Borda mais sutil + sombra um pouco mais “card”
          border: '1px solid rgba(31, 35, 40, 0.08)',
          boxShadow: '0px 2px 10px rgba(31, 35, 40, 0.06)',
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
            boxShadow: '0px 4px 12px rgba(31, 35, 40, 0.14)',
          },
        },
      },
    },
  },

  typography: {
    fontFamily: `'Inter', 'Roboto', sans-serif`,
    h6: { fontWeight: 600 },
    body1: { color: '#1F2328' },
    body2: { color: '#5C6670' },
  },
})
