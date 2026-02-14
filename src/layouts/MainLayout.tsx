import GlobalTradeForm from '@/components/GlobalTradeForm'
import { useAuth } from '@/contexts/AuthContext'
import { PageTitleProvider } from '@/contexts/PageTitleContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { PortfolioPositionsProvider } from '@/contexts/PortfolioPositionsContext'
import { PortfolioReturnsProvider } from '@/contexts/PortfolioReturnsContext'
import { TradeFormProvider } from '@/contexts/TradeFormContext'

import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import MainTopbar, { getCurrentSection } from './MainTopbar'
import SubNavigation from './SubNavigation'

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  return (
    <PageTitleProvider>
      <PortfolioProvider>
        <PortfolioPositionsProvider>
        <PortfolioReturnsProvider>
          <TradeFormProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <MainTopbar />
              <SubNavigation section={getCurrentSection(location.pathname)} />
              <Box px={4} pb={1} sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Outlet />
              </Box>
            </Box>
            <GlobalTradeForm />
          </TradeFormProvider>
        </PortfolioReturnsProvider>
        </PortfolioPositionsProvider>
      </PortfolioProvider>
    </PageTitleProvider>
  )
}
