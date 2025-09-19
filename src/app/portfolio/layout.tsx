'use client'

import { useAuth } from '@/contexts/AuthContext'
import { PageTitleProvider } from '@/contexts/PageTitleContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { PortfolioReturnsProvider } from '@/contexts/PortfolioReturnsContext'
import ThemeRegistry from '@/contexts/ThemeRegistry'

import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br'

import { useState } from 'react'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'
import Topbar from './Topbar'

const COLLAPSE_MEDIA = '(max-width: 1366px)' // ajuste o breakpoint do "notebook"

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const theme = useTheme()
  const collapsedMode = useMediaQuery(COLLAPSE_MEDIA) // true = usar Drawer 'persistent'
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isLoading) return null
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  const variant = collapsedMode ? 'persistent' : 'permanent'

  return (
    <ThemeRegistry>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <PageTitleProvider>
          <PortfolioProvider>
            <PortfolioReturnsProvider>
              <Box sx={{ display: 'flex' }}>
                <Sidebar
                  variant={variant}
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                />
                {variant === 'permanent' && <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }} />}

                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                    ml:
                      variant === 'persistent' && drawerOpen
                        ? `${DRAWER_WIDTH}px`
                        : 0,
                    transition: theme.transitions.create('margin-left', {
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }}
                >
                  <Topbar
                    showMenuButton={variant === 'persistent'}
                    onMenuClick={() => setDrawerOpen((v) => !v)}
                  />
                  <Box px={4} pt={2} pb={1} sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {children}
                  </Box>
                </Box>
              </Box>
            </PortfolioReturnsProvider>
          </PortfolioProvider>
        </PageTitleProvider>
      </LocalizationProvider>
    </ThemeRegistry>
  )
}
