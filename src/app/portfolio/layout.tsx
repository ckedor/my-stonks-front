'use client'

import { useAuth } from '@/contexts/AuthContext'
import { PageTitleProvider } from '@/contexts/PageTitleContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { PortfolioReturnsProvider } from '@/contexts/PortfolioReturnsContext'
import ThemeRegistry from '@/contexts/ThemeRegistry'
import { Box } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export const DRAWER_WIDTH = 240

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <ThemeRegistry>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <PageTitleProvider>
          <PortfolioProvider>
            <PortfolioReturnsProvider>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box
                  sx={{
                    paddingLeft: `18px`,
                    flexGrow: 1,
                    ml: `${DRAWER_WIDTH}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    overflow: 'hidden',
                  }}
                >
                  <Topbar />
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
