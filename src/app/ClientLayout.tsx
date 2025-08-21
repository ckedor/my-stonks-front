'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { theme } from '@/theme'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { PropsWithChildren } from 'react'

export default function ClientLayout({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
