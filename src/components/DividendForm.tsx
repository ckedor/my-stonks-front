'use client'

import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Asset } from '@/types'
import { Delete } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import AssetSelector from './AssetSelector'

interface DividendFormProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
  dividend?: {
    id: number
    date: string
    amount: number
    asset_id: number
    portfolio_id: number
    ticker: string
  }
}

export default function DividendForm({ open, onClose, onSave, dividend }: DividendFormProps) {
  const { selectedPortfolio } = usePortfolio()

  const [portfolioId, setPortfolioId] = useState<number | ''>('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [touched, setTouched] = useState(false)

  const isEdit = Boolean(dividend)
  const isValid = amount > 0 && selectedAsset && portfolioId !== ''

  useEffect(() => {
    if (dividend) {
      setAmount(dividend.amount)
      setDate(dayjs(dividend.date))
      setPortfolioId(dividend.portfolio_id)
      setSelectedAsset({
        id: dividend.asset_id,
        ticker: dividend.ticker,
        name: '',
        asset_type_id: 0,
        quantity: 0,
        price: 0,
        average_price: 0,
        value: 0,
        currency: { id: 1, name: 'Real' },
      })
    } else {
      setAmount(0)
      setDate(dayjs())
      setPortfolioId(selectedPortfolio?.id ?? '')
      setSelectedAsset(null)
    }
    setTouched(false)
  }, [dividend, open, selectedPortfolio])

  const handleSubmit = async () => {
    if (!isValid) return

    setLoading(true)
    const payload = {
      id: isEdit ? dividend?.id : undefined,
      asset_id: selectedAsset?.id,
      amount,
      date: date?.format('YYYY-MM-DD'),
      portfolio_id: portfolioId,
    }

    try {
      if (isEdit) {
        await api.put('/portfolio/dividends/', payload)
      } else {
        await api.post('/portfolio/dividends/', payload)
      }

      onClose()
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao enviar provento:', err)
      setError('Erro ao salvar o provento. Tente novamente.')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dividend?.id) return
    try {
      await api.delete(`/portfolio/dividends/${dividend.id}`)
      setConfirmOpen(false)
      onClose()
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao deletar provento:', err)
      setError('Erro ao deletar o provento.')
      setSnackbarOpen(true)
    }
  }

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          p={3}
          width={400}
          display="flex"
          flexDirection="column"
          height="100%"
          position="relative"
        >
          <Stack spacing={3} p={1} flex={1} overflow="auto">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">{isEdit ? 'Editar Provento' : 'Novo Provento'}</Typography>
              {isEdit && (
                <IconButton onClick={() => setConfirmOpen(true)}>
                  <Delete />
                </IconButton>
              )}
            </Box>

            {isEdit ? (
              <TextField
                label="Ativo"
                value={dividend?.ticker ?? ''}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            ) : (
              <AssetSelector
                value={selectedAsset?.id ?? null}
                onChange={(asset) => {
                  setSelectedAsset(asset)
                  setTouched(true)
                }}
              />
            )}

            <DatePicker label="Data" value={date} onChange={setDate} />

            <TextField
              label="Valor do Provento (R$)"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value))
                setTouched(true)
              }}
              error={touched && amount <= 0}
              helperText={touched && amount <= 0 ? 'Valor deve ser maior que zero' : ''}
              fullWidth
            />
          </Stack>

          <Box mt={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading || !isValid}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isEdit ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este provento? Essa ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete} autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}
