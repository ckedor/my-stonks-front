'use client'

import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Asset, Trade } from '@/types'
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import AssetSelector from './AssetSelector'

interface Currency {
  id: number
  name: string
  code: string
}

interface Broker {
  id: number
  name: string
  legalId: string
  currency: Currency
}

interface TradeFormProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
  trade?: Trade
  assetId?: number
}

export default function TradeForm({ open, onClose, onSave, trade, assetId }: TradeFormProps) {
  const isEdit = Boolean(trade)
  const { portfolios, selectedPortfolio } = usePortfolio()

  const [type, setType] = useState<'Compra' | 'Venda'>('Compra')
  const [quantity, setQuantity] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)
  const [date, setDate] = useState<Dayjs | null>(dayjs())
  const [brokerId, setBrokerId] = useState<number | ''>('')
  const [portfolioId, setPortfolioId] = useState<number | ''>('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [touched, setTouched] = useState(false)

  const selectedBroker = brokers.find((b) => b.id === brokerId)

  const isDolar = selectedBroker?.currency.name === 'Dólar'

  const isValid =
    quantity > 0 &&
    price > 0 &&
    brokerId !== '' &&
    portfolioId !== '' &&
    (isEdit || selectedAsset !== null)

  useEffect(() => {
    if (trade) {
      setType(trade.type as 'Compra' | 'Venda')
      setQuantity(Math.abs(trade.quantity))
      setPrice(trade.original_price)
      setDate(dayjs(trade.date))
      setBrokerId(trade.broker_id)
      setPortfolioId(trade.portfolio_id)
    } else {
      setType('Compra')
      setQuantity(0)
      setPrice(0)
      setDate(dayjs())
      setBrokerId('')
      setPortfolioId(selectedPortfolio?.id ?? '')
      setSelectedAsset(null)
    }
    setTouched(false)
  }, [trade, open, selectedPortfolio])

  useEffect(() => {
    if (open) {
      api.get('/brokers/list').then((res) => setBrokers(res.data))
    }
  }, [open])

  const handleSubmit = async () => {
    setTouched(true)
    if (!isValid) return

    setLoading(true)
    const payload = {
      id: isEdit ? trade?.id : undefined,
      asset_id: isEdit ? assetId : selectedAsset?.id,
      quantity: type === 'Compra' ? quantity : -quantity,
      price: price,
      date: date?.toISOString(),
      broker_id: brokerId,
      portfolio_id: portfolioId,
    }

    try {
      if (isEdit) {
        await api.put('/portfolio/transaction/', payload)
      } else {
        await api.post('/portfolio/transaction/', payload)
      }

      onClose()
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao enviar operação:', err)
      setError('Erro ao salvar a operação. Tente novamente.')
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!trade?.id) return
    try {
      await api.delete(`/portfolio/transaction/${trade.id}`, {
        data: {
          portfolio_id: portfolioId,
          asset_id: assetId,
        },
      })
      setConfirmOpen(false)
      onClose()
      if (onSave) onSave()
    } catch (err) {
      console.error('Erro ao deletar operação:', err)
      setError('Erro ao deletar a operação.')
      setSnackbarOpen(true)
    }
  }

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          p={3}
          width={500}
          display="flex"
          flexDirection="column"
          height="100%"
          position="relative"
        >
          <Stack spacing={3} p={1} flex={1} overflow="auto">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                {isEdit ? 'Editar Negociação' : 'Nova Negociação'}
              </Typography>
              {isEdit && (
                <IconButton onClick={() => setConfirmOpen(true)}>
                  <Delete />
                </IconButton>
              )}
            </Box>

            {isEdit ? (
              <TextField
                label="Ativo"
                value={trade?.ticker ?? ''}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            ) : (
              <AssetSelector
                value={selectedAsset?.id ?? null}
                onChange={(asset) => setSelectedAsset(asset)}
              />
            )}

            <FormControl fullWidth error={touched && portfolioId === ''}>
              <InputLabel>Carteira</InputLabel>
              <Select
                value={portfolioId}
                label="Carteira"
                onChange={(e) => setPortfolioId(Number(e.target.value))}
              >
                {portfolios.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker label="Data" value={date} onChange={setDate} />

            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={type} label="Tipo" onChange={(e) => setType(e.target.value as any)}>
                <MenuItem value="Compra">Compra</MenuItem>
                <MenuItem value="Venda">Venda</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantidade"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              error={touched && quantity <= 0}
              helperText={touched && quantity <= 0 ? 'Quantidade deve ser maior que zero' : ''}
              fullWidth
            />

            <TextField
              label={isDolar ? 'Preço (USD)' : 'Preço (R$)'}
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              error={touched && price <= 0}
              helperText={touched && price <= 0 ? 'Preço deve ser maior que zero' : ''}
              fullWidth
            />

            <FormControl fullWidth error={touched && brokerId === ''}>
              <InputLabel>Corretora</InputLabel>
              <Select
                value={brokerId}
                label="Corretora"
                onChange={(e) => setBrokerId(Number(e.target.value))}
              >
                {brokers.map((broker) => (
                  <MenuItem key={broker.id} value={broker.id}>
                    {broker.name}
                  </MenuItem>
                ))}
              </Select>
              {touched && brokerId === '' && (
                <Typography variant="caption" color="error">
                  Selecione uma corretora
                </Typography>
              )}
            </FormControl>
          </Stack>

          <Box mt={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
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
            Tem certeza que deseja excluir esta operação? Essa ação não poderá ser desfeita.
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
