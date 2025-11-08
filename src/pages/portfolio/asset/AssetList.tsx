
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { Dayjs } from 'dayjs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Position {
  ticker: string
  quantity: number
  price: number
  value: number
  category: string
  class: string
  type: string
  asset_id: number
  twelve_months_return: number
}

export default function AssetList({ positions }: { positions: Position[] }) {
  const { selectedPortfolio, userCategories } = usePortfolio()
  const [groupBy, setGroupBy] = useState<'category' | 'asset' | 'type' | 'class'>('category')
  const [search, setSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    categoryId: number | null
    assetId: number | null
  }>({ open: false, categoryId: null, assetId: null })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const navigate = useNavigate()

  const filtered = positions.filter((pos) =>
    pos.ticker.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Position[]>>((acc, pos) => {
    const key =
      groupBy === 'category'
        ? pos.category || '(Sem categoria)'
        : groupBy === 'type'
          ? pos.type
          : groupBy === 'class'
            ? pos.class
            : 'Ativos'

    if (!acc[key]) acc[key] = []
    acc[key].push(pos)
    return acc
  }, {})

  Object.values(grouped).forEach((group) => {
    group.sort((a, b) => b.value - a.value)
  })

  const sortedGrouped = Object.entries(grouped).sort(([, a], [, b]) => {
    const totalA = a.reduce((acc, item) => acc + item.value, 0)
    const totalB = b.reduce((acc, item) => acc + item.value, 0)
    return totalB - totalA
  })

  const handleAssetSelect = (asset_id: number) => {
    navigate(`/portfolio/asset/${asset_id}`)
  }

  const handleCategoryChange = (assetId: number, categoryId: number) => {
    setConfirmDialog({ open: true, assetId, categoryId })
  }

  const confirmCategoryChange = async () => {
    if (!confirmDialog.assetId || !confirmDialog.categoryId) return

    try {
      await api.post('/portfolio/category/category_assignment', {
        asset_id: confirmDialog.assetId,
        category_id: confirmDialog.categoryId,
        portfolio_id: selectedPortfolio?.id,
      })
      setConfirmDialog({ open: false, assetId: null, categoryId: null })
    } catch (error) {
      console.error('Erro ao atualizar categoria', error)
      setSnackbarOpen(true)
    }
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
        <TextField
          label="Buscar Ativo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 400 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Agrupar</InputLabel>
          <Select
            value={groupBy}
            label="Agrupar"
            onChange={(e) => setGroupBy(e.target.value as any)}
          >
            <MenuItem value="category">Categoria Usuário</MenuItem>
            <MenuItem value="asset">Ativo</MenuItem>
            <MenuItem value="type">Produto</MenuItem>
            <MenuItem value="class">Classe</MenuItem>
          </Select>
        </FormControl>

        <Stack sx={{ flexGrow: 1 }} direction="row" justifyContent="flex-end">
          <DatePicker
            label="Data"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </Stack>
      </Stack>

      <TableContainer>
        <Table size="small" sx={{ width: '100%' }}>
          <TableBody>
            {sortedGrouped.map(([category, items], idx) => {
              const total = items.reduce((acc, curr) => acc + curr.value, 0)

              return (
                <>
                  {idx > 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ py: 1, borderBottom: 'none' }} />
                    </TableRow>
                  )}

                  <TableRow sx={{ borderBottom: '2px solid rgba(99, 91, 91, 0.87)' }}>
                    <TableCell colSpan={2}>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, textTransform: 'uppercase', mt: 2, mb: 1 }}
                        >
                          {category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell colSpan={6} align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        TOTAL: R$ {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Ativo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Classe</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Produto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Quantidade
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Preço Unitário
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Rentabilidade 12M
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Valor Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                  </TableRow>

                  {items.map((pos, idx) => (
                    <TableRow
                      key={`${category}-${idx}`}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      }}
                    >
                      <TableCell onClick={() => handleAssetSelect(pos.asset_id)}>
                        {pos.ticker}
                      </TableCell>
                      <TableCell>{pos.class}</TableCell>
                      <TableCell>{pos.type}</TableCell>
                      <TableCell align="right">
                        {pos.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })}
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {pos.price.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            pos.twelve_months_return == null
                              ? 'black'
                              : pos.twelve_months_return > 0
                                ? 'green'
                                : 'red',
                        }}
                      >
                        {pos.twelve_months_return == null
                          ? '—'
                          : `${(pos.twelve_months_return * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`}
                      </TableCell>
                      <TableCell align="right">
                        R${' '}
                        {pos.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={userCategories.find((c) => c.name === pos.category)?.id ?? ''}
                            onChange={(e) =>
                              handleCategoryChange(pos.asset_id, Number(e.target.value))
                            }
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>(Sem categoria)</em>
                            </MenuItem>
                            {userCategories.map((cat) => (
                              <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, assetId: null, categoryId: null })}
      >
        <DialogTitle>Confirmar Alteração</DialogTitle>
        <DialogContent>
          <DialogContentText>Deseja realmente alterar a categoria deste ativo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, assetId: null, categoryId: null })}
          >
            Cancelar
          </Button>
          <Button onClick={confirmCategoryChange} variant="contained" color="primary" autoFocus>
            Confirmar
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
          Erro ao atualizar categoria.
        </Alert>
      </Snackbar>
    </Box>
  )
}
