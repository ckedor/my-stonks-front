import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    chart: {
      colors: string[]
    }
  }

  interface PaletteOptions {
    chart?: {
      colors?: string[]
    }
  }
}

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#323843ff',
      paper:   '#1c212bff', 
    }, 
    text: {
      primary:   '#bebfc2ff',
      secondary: '#B0B4BA',
    },
    primary:   { main: '#8AB4F8' },
    secondary: { main: '#64D2C3' },
    divider: 'rgba(255,255,255,0.08)',
    chart: {
      colors: [
        '#D2A679',
        '#D15F57',
        '#FFF5E1',
        '#A3C1AD',
        '#AB4E52',
        '#a3c1bd',
        '#9CAFB7',
        '#FFD700',
      ],
    },
  },
  components: {
      MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
  }
})
