import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import CheckIcon from '@mui/icons-material/Check'
import ErrorIcon from '@mui/icons-material/Error'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, CircularProgress, IconButton, Snackbar, Tooltip } from '@mui/material'
import { useState } from 'react'

export default function RecalculatePortfolioButton() {
  const { selectedPortfolio, triggerPortfolioRefresh } = usePortfolio()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const recalculatePortfolio = async (portfolioId: number) => {
    await api.post(`/portfolio/${portfolioId}/consolidate`)
  }

  const handleClick = async () => {
    if (!selectedPortfolio) return

    setLoading(true)
    setSuccess(false)
    setError(false)

    try {
      await recalculatePortfolio(selectedPortfolio.id)
      setSuccess(true)

      // avisa o contexto que houve recálculo
      triggerPortfolioRefresh()

      // snackbar de sucesso
      setSnackbarMessage('Posições recalculadas com sucesso.')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err) {
      console.error(err)
      setError(true)

      // snackbar de erro
      setSnackbarMessage('Erro ao recalcular posições da carteira.')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(false), 1500)
      setTimeout(() => setError(false), 1500)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const getTooltip = () => {
    if (loading) return 'Recalculando...'
    if (success) return 'Recalculado!'
    if (error) return 'Erro ao recalcular'
    return 'Recalcular posições'
  }

  const getIcon = () => {
    if (loading) return <CircularProgress size={20} />
    if (success) return <CheckIcon color="success" />
    if (error) return <ErrorIcon color="error" />
    return <RefreshIcon />
  }

  return (
    <>
      <Tooltip title={getTooltip()}>
        <span>
          <IconButton onClick={handleClick} disabled={!selectedPortfolio} sx={{ color: 'topbar.text' }}>
            {getIcon()}
          </IconButton>
        </span>
      </Tooltip>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
