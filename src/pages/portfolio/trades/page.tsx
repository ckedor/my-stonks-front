
import TradeForm from '@/components/TradeForm'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Trade } from '@/types'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

export default function PortfolioTransactionsPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const theme = useTheme()

  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | undefined>()
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>()

  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [broker, setBroker] = useState('')
  const [type, setType] = useState<'Compra' | 'Venda' | 'Todos'>('Todos')

  useEffect(() => {
    setTitle('Trades da Carteira')
  }, [])

  const fetchTrades = async () => {
    if (!selectedPortfolio) return
    setLoading(true)
    const { data } = await api.get(`/portfolio/transaction/${selectedPortfolio.id}`)
    setTrades(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTrades()
  }, [selectedPortfolio])

  useEffect(() => {
    if (trades.length > 0) {
      setEndDate(dayjs().format('YYYY-MM-DD'))
    }
  }, [trades])

  const handleNew = () => {
    setSelectedTrade(undefined)
    setSelectedAssetId(undefined)
    setDrawerOpen(true)
  }

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade)
    setSelectedAssetId(trade.asset_id)
    setDrawerOpen(true)
  }

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchTicker = trade.ticker.toLowerCase().includes(search.toLowerCase())
      const matchBroker = broker ? trade.broker === broker : true
      const matchType = type === 'Todos' || trade.type === type
      const matchStartDate = startDate
        ? dayjs(trade.date).isAfter(dayjs(startDate).subtract(1, 'day'))
        : true
      const matchEndDate = endDate ? dayjs(trade.date).isBefore(dayjs(endDate).add(1, 'day')) : true

      return matchTicker && matchBroker && matchType && matchStartDate && matchEndDate
    })
  }, [trades, search, broker, type, startDate, endDate])

  const brokers = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.broker))).sort()
  }, [trades])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box></Box>
        <Button variant="contained" onClick={handleNew}>
          Nova Operação
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
        <TextField
          label="Buscar por ativo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <TextField
          label="Data início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Data fim"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Corretora</InputLabel>
          <Select
            value={broker}
            onChange={(e: SelectChangeEvent) => setBroker(e.target.value)}
            label="Corretora"
          >
            <MenuItem value="">Todas</MenuItem>
            {brokers.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={type}
            onChange={(e: SelectChangeEvent) => setType(e.target.value as any)}
            label="Tipo"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Compra">Compra</MenuItem>
            <MenuItem value="Venda">Venda</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Corretora</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Qtd
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Qtd Acum.
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Preço
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Valor Total
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Posição na Data
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Preço Médio
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Lucro Realizado
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  %Lucro
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrades.map((trade, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => handleEdit(trade)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor:
                      trade.type === 'Venda'
                        ? theme.palette.background.paper
                        : theme.palette.background.default,
                    '&:hover': {
                      backgroundColor:
                        trade.type === 'Venda'
                          ? theme.palette.action.hover
                          : theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell>{dayjs(trade.date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{trade.ticker}</TableCell>
                  <TableCell>{trade.broker}</TableCell>
                  <TableCell
                    sx={{
                      textTransform: 'capitalize',
                      color: trade.type === 'Compra' ? 'primary.main' : 'success.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {trade.type}
                  </TableCell>
                  <TableCell align="right">
                    {trade.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                  </TableCell>
                  <TableCell align="right">
                    {trade.acc_quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                  </TableCell>
                  <TableCell align="right">
                    R$ {trade.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    R$ {trade.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    R$ {trade.position.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    R$ {trade.average_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        trade.realized_profit > 0
                          ? 'success.main'
                          : trade.realized_profit < 0
                            ? 'error.main'
                            : 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  >
                    {trade.type === 'Compra'
                      ? '-'
                      : 'R$ ' +
                        trade.realized_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        trade.profit_pct > 0
                          ? 'success.main'
                          : trade.profit_pct < 0
                            ? 'error.main'
                            : 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  >
                    {trade.type === 'Compra'
                      ? '-'
                      : trade.profit_pct.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) +
                        ' %'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TradeForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={fetchTrades}
        trade={selectedTrade}
        assetId={selectedAssetId}
      />
    </Box>
  )
}
