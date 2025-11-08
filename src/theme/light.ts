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

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
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
})
