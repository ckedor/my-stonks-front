import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    dark: string
    chart: {
      grid: string
      label: string
      colors: string[]
    },
    golden: string
  }

  interface PaletteOptions {
    dark?: string
    chart?: {
      grid?: string
      label?: string
      colors?: string[]
    },
    golden?: string
  }
}

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#303030',
      paper:   '#3e3e3eff', 
    }, 
    text: {
      primary:   '#bebfc2ff',
      secondary: '#B0B4BA',
    },
    dark: '#3b2f2f',
    primary:   { main: '#e1cfcaff' },
    secondary: { main: '#d1705fff' },
    error:    { main: '#ec786bff' },
    success:  { main: '#61a964ff' },
    golden:  '#eeb227ff',
    divider: 'rgba(255,255,255,0.08)',
    chart: {
      grid: '#645959ff',
      label: '#bebfc2ff',
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
