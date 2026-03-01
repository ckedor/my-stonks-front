import {
    Alert,
    Box,
    Button,
    CircularProgress,
    ListSubheader,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { usePageTitle } from '@/contexts/PageTitleContext'
import {
    createExpense,
    fetchCategories,
    type FinanceCategory,
} from '@/lib/financeApi'

export default function SpendPage() {
  const { setTitle } = usePageTitle()
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [description, setDescription] = useState('')
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('')

  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setTitle('Registrar gasto')
  }, [setTitle])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        setCategories(await fetchCategories())
      } catch {
        setSnack({ msg: 'Erro ao carregar subcategorias', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const totalSubcategories = useMemo(
    () => categories.reduce((acc, cat) => acc + cat.subcategories.length, 0),
    [categories],
  )

  const handleSubmit = async () => {
    if (!amount || !subcategoryId) return

    setSubmitting(true)
    try {
      await createExpense({
        amount: Number(amount),
        date: expenseDate,
        description: description || undefined,
        subcategory_id: Number(subcategoryId),
      })
      setAmount('')
      setDescription('')
      setSubcategoryId('')
      setSnack({ msg: 'Gasto salvo', severity: 'success' })
    } catch {
      setSnack({ msg: 'Erro ao salvar gasto', severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box py={2} display="flex" justifyContent="center">
      <Paper sx={{ width: '100%', maxWidth: 460, p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={0.5}>Novo gasto</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Registro rápido para celular.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : (
          <Stack spacing={1.5}>
            <TextField
              label="Valor (R$)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Data"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
            <Select
              value={subcategoryId}
              displayEmpty
              onChange={(e) => setSubcategoryId(e.target.value as number)}
              fullWidth
            >
              <MenuItem value="" disabled>Subcategoria</MenuItem>
              {categories.map((cat) => [
                <ListSubheader key={`h-${cat.id}`}>{cat.name}</ListSubheader>,
                ...cat.subcategories.map((sub) => (
                  <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                )),
              ])}
            </Select>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting || !amount || !subcategoryId || totalSubcategories === 0}
            >
              {submitting ? 'Salvando...' : 'Salvar gasto'}
            </Button>
          </Stack>
        )}
      </Paper>

      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.severity} onClose={() => setSnack(null)}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
