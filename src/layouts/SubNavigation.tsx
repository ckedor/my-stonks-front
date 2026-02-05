import AddIcon from '@mui/icons-material/Add'
import CategoryIcon from '@mui/icons-material/Category'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, Box, Button, Chip, CircularProgress, Divider, Snackbar } from '@mui/material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import CategoryForm from '@/components/CategoryForm'
import DividendForm from '@/components/DividendForm'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useTradeForm } from '@/contexts/TradeFormContext'
import api from '@/lib/api'

type Section = 'carteira' | 'mercado'

interface NavItem {
  text: string
  path: string
}

interface QuickAction {
  text: string
  icon: React.ReactNode
  action: () => void
}

const carteiraNav: NavItem[] = [
  { text: 'Resumo', path: '/portfolio/overview' },
  { text: 'Ativos', path: '/portfolio/asset' },
  { text: 'Rentabilidade', path: '/portfolio/returns' },
  { text: 'Patrimônio', path: '/portfolio/wealth' },
  { text: 'Trades', path: '/portfolio/trades' },
  { text: 'Proventos', path: '/portfolio/dividends' },
  { text: 'Declaração IR', path: '/portfolio/tax-income' },
]

const mercadoNav: NavItem[] = [
  { text: 'Ativos', path: '/market/assets' },
]

interface SubNavigationProps {
  section: Section
}

export default function SubNavigation({ section }: SubNavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedPortfolio, triggerPortfolioRefresh } = usePortfolio()
  const { openTradeForm } = useTradeForm()

  const [openDividendForm, setOpenDividendForm] = useState(false)
  const [openCategoryForm, setOpenCategoryForm] = useState(false)

  // Recalculate state
  const [recalculating, setRecalculating] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const handleRecalculate = async () => {
    if (!selectedPortfolio) return
    setRecalculating(true)
    try {
      await api.post(`/portfolio/${selectedPortfolio.id}/consolidate`)
      triggerPortfolioRefresh()
      setSnackbarMessage('Posições recalculadas com sucesso.')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err) {
      console.error(err)
      setSnackbarMessage('Erro ao recalcular posições.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setRecalculating(false)
    }
  }

  const navItems = section === 'carteira' ? carteiraNav : mercadoNav

  const quickActions: QuickAction[] =
    section === 'carteira'
      ? [
          { text: 'Comprar Ativo', icon: <AddIcon fontSize="small" />, action: () => openTradeForm() },
          { text: 'Cadastrar Dividendo', icon: <AddIcon fontSize="small" />, action: () => setOpenDividendForm(true) },
          { text: 'Editar Categorias', icon: <CategoryIcon fontSize="small" />, action: () => setOpenCategoryForm(true) },
        ]
      : []

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              variant={isActive(item.path) ? 'contained' : 'text'}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                px: 2,
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {quickActions.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            {quickActions.map((action) => (
              <Chip
                key={action.text}
                label={action.text}
                icon={action.icon as React.ReactElement}
                onClick={action.action}
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
            <Chip
              label={recalculating ? 'Recalculando...' : 'Recalcular Carteira'}
              icon={recalculating ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
              onClick={handleRecalculate}
              variant="outlined"
              size="small"
              disabled={recalculating}
              sx={{ cursor: recalculating ? 'default' : 'pointer' }}
            />
          </Box>
        )}
      </Box>

      <DividendForm open={openDividendForm} onClose={() => setOpenDividendForm(false)} />
      <CategoryForm open={openCategoryForm} onClose={() => setOpenCategoryForm(false)} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
