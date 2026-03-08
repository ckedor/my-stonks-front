import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import CategoryIcon from '@mui/icons-material/Category'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    ListSubheader,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
    useTheme,
} from '@mui/material'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { usePageTitle } from '@/contexts/PageTitleContext'
import {
    createExpense,
    createIncome,
    deleteExpense,
    deleteIncome,
    fetchCategories,
    fetchExpenses,
    fetchIncomes,
    fetchMonthlyBreakdown,
    fetchMonthlyGoals,
    fetchYearlySummary,
    updateCategoryGoal,
    updateExpense,
    updateIncome,
    updateSubcategoryGoal,
    type FinanceCategory,
    type FinanceExpense,
    type FinanceIncome,
    type MonthlyBreakdown,
    type MonthlyGoalsResponse,
    type MonthlySummary,
} from '@/lib/financeApi'
import CategoryManagerDialog from './CategoryManagerDialog'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

export default function FinancesPage() {
  const theme = useTheme()
  const { setTitle } = usePageTitle()
  const now = dayjs()

  // ── State ─────────────────────────────────────────────────
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [expenses, setExpenses] = useState<FinanceExpense[]>([])
  const [incomes, setIncomes] = useState<FinanceIncome[]>([])
  const [yearlySummary, setYearlySummary] = useState<MonthlySummary[]>([])
  const [breakdown, setBreakdown] = useState<MonthlyBreakdown | null>(null)
  const [goals, setGoals] = useState<MonthlyGoalsResponse | null>(null)

  const [loadingYear, setLoadingYear] = useState(true)
  const [loadingMonth, setLoadingMonth] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [creatingGoal, setCreatingGoal] = useState(false)

  // Expense form state
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState(now.format('YYYY-MM-DD'))
  const [expDesc, setExpDesc] = useState('')
  const [expSubcatId, setExpSubcatId] = useState<number | ''>('')

  // Income form state
  const [incAmount, setIncAmount] = useState('')
  const [incDate, setIncDate] = useState(now.format('YYYY-MM-DD'))
  const [incDesc, setIncDesc] = useState('')

  // Editing expense inline
  const [editRowId, setEditRowId] = useState<number | null>(null)
  const [editData, setEditData] = useState<{ amount: string; date: string; description: string; subcategory_id: number }>({
    amount: '', date: '', description: '', subcategory_id: 0,
  })

  // Editing income inline
  const [editIncomeId, setEditIncomeId] = useState<number | null>(null)
  const [editIncomeData, setEditIncomeData] = useState<{ amount: string; date: string; description: string }>({
    amount: '', date: '', description: '',
  })

  // Filters & sort
  const [filterCatId, setFilterCatId] = useState<number | ''>('')
  const [filterSubcatId, setFilterSubcatId] = useState<number | ''>('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Main page tab
  const [mainTab, setMainTab] = useState(1)

  // Goal editing state
  const [editingGoalCatId, setEditingGoalCatId] = useState<number | null>(null)
  const [editingGoalSubId, setEditingGoalSubId] = useState<number | null>(null)
  const [editGoalAmount, setEditGoalAmount] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  // New goal form state
  const [newGoalType, setNewGoalType] = useState<'category' | 'subcategory'>('category')
  const [goalCategoryId, setGoalCategoryId] = useState<number | ''>('')
  const [goalSubcategoryId, setGoalSubcategoryId] = useState<number | ''>('')
  const [goalAmount, setGoalAmount] = useState('')

  // Pie chart tab
  const [pieTab, setPieTab] = useState(0)

  // Dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)

  // Snackbar
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)

  useEffect(() => { setTitle('Finanças Pessoais') }, [setTitle])

  // ── Flat subcategories map ────────────────────────────────
  const allSubcategories = useMemo(() => {
    return categories.flatMap((c) => c.subcategories.map((s) => ({ ...s, categoryName: c.name, categoryId: c.id })))
  }, [categories])

  // ── Data fetching ─────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try { setCategories(await fetchCategories()) } catch { /* ignore */ }
  }, [])

  const loadYearly = useCallback(async () => {
    setLoadingYear(true)
    try { setYearlySummary(await fetchYearlySummary(year)) } catch { setSnack({ msg: 'Erro ao buscar resumo anual', severity: 'error' }) }
    finally { setLoadingYear(false) }
  }, [year])

  const loadMonthly = useCallback(async () => {
    setLoadingMonth(true)
    try {
      const [exp, inc, bd, gl] = await Promise.all([
        fetchExpenses(year, month),
        fetchIncomes(year, month),
        fetchMonthlyBreakdown(year, month),
        fetchMonthlyGoals(year, month),
      ])
      setExpenses(exp)
      setIncomes(inc)
      setBreakdown(bd)
      setGoals(gl)
    } catch { setSnack({ msg: 'Erro ao buscar dados do mês', severity: 'error' }) }
    finally { setLoadingMonth(false) }
  }, [year, month])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => { loadYearly() }, [loadYearly])
  useEffect(() => { loadMonthly() }, [loadMonthly])

  // ── Handlers ──────────────────────────────────────────────
  const handleCreateExpense = async () => {
    if (!expAmount || !expSubcatId) return
    setSubmitting(true)
    try {
      await createExpense({
        amount: parseFloat(expAmount),
        date: expDate,
        description: expDesc || undefined,
        subcategory_id: expSubcatId as number,
      })
      setExpAmount('')
      setExpDesc('')
      setExpSubcatId('')
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao criar gasto', severity: 'error' }) }
    finally { setSubmitting(false) }
  }

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id)
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao deletar gasto', severity: 'error' }) }
  }

  const startEditExpense = (exp: FinanceExpense) => {
    setEditRowId(exp.id)
    setEditData({
      amount: String(exp.amount),
      date: exp.date,
      description: exp.description ?? '',
      subcategory_id: exp.subcategory_id,
    })
  }

  const handleSaveExpense = async () => {
    if (!editRowId) return
    setSubmitting(true)
    try {
      await updateExpense(editRowId, {
        amount: parseFloat(editData.amount),
        date: editData.date,
        description: editData.description,
        subcategory_id: editData.subcategory_id,
      })
      setEditRowId(null)
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao atualizar gasto', severity: 'error' }) }
    finally { setSubmitting(false) }
  }

  const handleCreateIncome = async () => {
    if (!incAmount || !incDesc) return
    setSubmitting(true)
    try {
      await createIncome({ amount: parseFloat(incAmount), date: incDate, description: incDesc })
      setIncAmount('')
      setIncDesc('')
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao criar ganho', severity: 'error' }) }
    finally { setSubmitting(false) }
  }

  const handleDeleteIncome = async (id: number) => {
    try {
      await deleteIncome(id)
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao deletar ganho', severity: 'error' }) }
  }

  const startEditIncome = (inc: FinanceIncome) => {
    setEditIncomeId(inc.id)
    setEditIncomeData({ amount: String(inc.amount), date: inc.date, description: inc.description })
  }

  const handleSaveIncome = async () => {
    if (!editIncomeId) return
    setSubmitting(true)
    try {
      await updateIncome(editIncomeId, {
        amount: parseFloat(editIncomeData.amount),
        date: editIncomeData.date,
        description: editIncomeData.description,
      })
      setEditIncomeId(null)
      loadMonthly()
      loadYearly()
    } catch { setSnack({ msg: 'Erro ao atualizar ganho', severity: 'error' }) }
    finally { setSubmitting(false) }
  }

  // ── Derived data ──────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    let list = [...expenses]
    if (filterCatId) list = list.filter((e) => e.subcategory.category.id === filterCatId)
    if (filterSubcatId) list = list.filter((e) => e.subcategory_id === filterSubcatId)
    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortField === 'date') return mul * (new Date(a.date).getTime() - new Date(b.date).getTime())
      return mul * (a.amount - b.amount)
    })
    return list
  }, [expenses, filterCatId, filterSubcatId, sortField, sortDir])

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])
  const totalIncomes = useMemo(() => incomes.reduce((s, i) => s + i.amount, 0), [incomes])

  const barData = useMemo(() =>
    yearlySummary.map((m) => ({
      name: MONTHS[m.month - 1],
      Ganhos: m.total_income,
      Gastos: m.total_expense,
    })), [yearlySummary])

  const yearTotalIncome = useMemo(() => yearlySummary.reduce((s, m) => s + m.total_income, 0), [yearlySummary])
  const yearTotalExpense = useMemo(() => yearlySummary.reduce((s, m) => s + m.total_expense, 0), [yearlySummary])
  const yearBalance = yearTotalIncome - yearTotalExpense

  const yearAvgIncome = yearlySummary.length ? yearTotalIncome / yearlySummary.filter(m => m.total_income > 0).length || 0 : 0
  const yearAvgExpense = yearlySummary.length ? yearTotalExpense / yearlySummary.filter(m => m.total_expense > 0).length || 0 : 0

  const pieColors = theme.palette.chart.colors

  const pieCatData = useMemo(() =>
    (breakdown?.by_category ?? []).map((c) => ({ name: c.category, value: c.total })), [breakdown])

  const pieSubData = useMemo(() =>
    (breakdown?.by_subcategory ?? []).map((s) => ({ name: s.subcategory, value: s.total })), [breakdown])

  const goalCategoryIds = useMemo(
    () => new Set((goals?.categories ?? []).map((c) => c.category_id)),
    [goals],
  )

  const availableGoalCategories = useMemo(
    () => categories.filter((c) => !goalCategoryIds.has(c.id)),
    [categories, goalCategoryIds],
  )

  const availableGoalSubcategories = useMemo(() => {
    if (!goalCategoryId) return []
    const category = categories.find((c) => c.id === goalCategoryId)
    if (!category) return []
    const existingSubIds = new Set(
      (goals?.categories ?? [])
        .find((c) => c.category_id === goalCategoryId)
        ?.subcategories.map((s) => s.subcategory_id) ?? [],
    )
    return category.subcategories.filter((s) => !existingSubIds.has(s.id))
  }, [categories, goalCategoryId, goals])

  const handleCreateGoal = async () => {
    const amount = Number(goalAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setSnack({ msg: 'Preencha um valor válido', severity: 'error' })
      return
    }

    setCreatingGoal(true)
    try {
      if (newGoalType === 'category' && goalCategoryId) {
        await updateCategoryGoal(goalCategoryId, amount)
      } else if (newGoalType === 'subcategory' && goalSubcategoryId) {
        await updateSubcategoryGoal(goalSubcategoryId as number, amount)
      } else {
        setSnack({ msg: 'Selecione o destino da meta', severity: 'error' })
        setCreatingGoal(false)
        return
      }
      setGoalCategoryId('')
      setGoalSubcategoryId('')
      setGoalAmount('')
      await Promise.all([loadCategories(), loadMonthly()])
      setSnack({ msg: 'Meta criada com sucesso', severity: 'success' })
    } catch {
      setSnack({ msg: 'Erro ao criar meta', severity: 'error' })
    } finally {
      setCreatingGoal(false)
    }
  }

  const handleSaveGoalEdit = async (type: 'category' | 'subcategory', id: number) => {
    const amount = Number(editGoalAmount)
    setSavingGoal(true)
    try {
      if (type === 'category') {
        await updateCategoryGoal(id, amount > 0 ? amount : null)
      } else {
        await updateSubcategoryGoal(id, amount > 0 ? amount : null)
      }
      setEditingGoalCatId(null)
      setEditingGoalSubId(null)
      const [, gl] = await Promise.all([
        loadCategories(),
        fetchMonthlyGoals(year, month),
      ])
      setGoals(gl)
    } catch {
      setSnack({ msg: 'Erro ao atualizar meta', severity: 'error' })
    } finally {
      setSavingGoal(false)
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field
      ? sortDir === 'asc' ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />
      : null

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // ── Render ────────────────────────────────────────────────
  return (
    <Box py={2}>
      {/* ═══ TOP-LEVEL TABS ═══ */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}>
          <Tab label="Ganhos vs Gastos no Ano" />
          <Tab label="Detalhe do Mês" />
          <Tab label="Metas" />
        </Tabs>
        <Box display="flex" alignItems="center" gap={1}>
          {(mainTab === 1 || mainTab === 2) && (
            <Select size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={{ minWidth: 100 }}>
              {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
            </Select>
          )}
          <Select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 100 }}>
            {Array.from({ length: 6 }, (_, i) => now.year() - i).map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
          <Chip icon={<CategoryIcon />} label="Categorias" variant="outlined" size="small" onClick={() => setCatDialogOpen(true)} sx={{ cursor: 'pointer' }} />
        </Box>
      </Box>

      {/* ═══ TAB 0 — GANHOS VS GASTOS NO ANO ═══ */}
      {mainTab === 0 && (
        <>
          {/* Yearly summary cards */}
          <Box display="flex" gap={2} mb={3}>
            <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Ganhos</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{fmt(yearTotalIncome)}</Typography>
              <Typography variant="caption" color="text.secondary">Média {fmt(yearAvgIncome)}/mês</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Gastos</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{fmt(yearTotalExpense)}</Typography>
              <Typography variant="caption" color="text.secondary">Média {fmt(yearAvgExpense)}/mês</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Saldo Anual</Typography>
              <Typography variant="h5" fontWeight="bold" color={yearBalance >= 0 ? 'success.main' : 'error.main'}>
                {fmt(yearBalance)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {yearTotalIncome > 0 ? `${((yearTotalExpense / yearTotalIncome) * 100).toFixed(0)}% comprometido` : '—'}
              </Typography>
            </Paper>
          </Box>

          {/* Year bar chart */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>Ganhos vs Gastos — {year}</Typography>
            {loadingYear ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.chart.grid} />
                  <XAxis dataKey="name" tick={{ fill: theme.palette.chart.label, fontSize: 12 }} />
                  <YAxis tick={{ fill: theme.palette.chart.label, fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}
                    formatter={(value: number) => fmt(value)}
                  />
                  <Legend />
                  <Bar dataKey="Ganhos" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos" fill={theme.palette.error.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Monthly summary table */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>Resumo Mensal</Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Mês</TableCell>
                    <TableCell align="right">Ganhos</TableCell>
                    <TableCell align="right">Gastos</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {yearlySummary.map((m) => {
                    const balance = m.total_income - m.total_expense
                    return (
                      <TableRow
                        key={m.month}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => { setMonth(m.month); setMainTab(1) }}
                      >
                        <TableCell>{MONTHS[m.month - 1]}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 500 }}>{fmt(m.total_income)}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 500 }}>{fmt(m.total_expense)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: balance >= 0 ? 'success.main' : 'error.main' }}>
                          {fmt(balance)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* ═══ TAB 1 — DETALHE DO MÊS ═══ */}
      {mainTab === 1 && (
        <>
      {loadingMonth ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Box display="flex" gap={3} flexWrap="wrap">
          {/* LEFT COLUMN: expenses */}
          <Box flex={2} minWidth={420}>
            {/* Totals */}
            <Box display="flex" gap={2} mb={2}>
              <Paper sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Ganhos</Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">{fmt(totalIncomes)}</Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Gastos</Typography>
                <Typography variant="h6" color="error.main" fontWeight="bold">{fmt(totalExpenses)}</Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 1.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Saldo</Typography>
                <Typography variant="h6" fontWeight="bold" color={totalIncomes - totalExpenses >= 0 ? 'success.main' : 'error.main'}>
                  {fmt(totalIncomes - totalExpenses)}
                </Typography>
              </Paper>
            </Box>

            {/* Quick expense form */}
            <Paper sx={{ p: 1.5, mb: 2 }}>
              <Typography variant="subtitle2" mb={1}>Novo gasto</Typography>
              <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                <TextField
                  size="small" label="Valor (R$)" type="number"
                  value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                  sx={{ width: 110 }}
                />
                <TextField
                  size="small" label="Data" type="date"
                  value={expDate} onChange={(e) => setExpDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 150 }}
                />
                <TextField
                  size="small" label="Descrição"
                  value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                  sx={{ width: 140 }}
                />
                <Select
                  size="small" value={expSubcatId} displayEmpty
                  onChange={(e) => setExpSubcatId(e.target.value as number)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="" disabled>Subcategoria</MenuItem>
                  {categories.map((c) => [
                    <ListSubheader key={`h-${c.id}`}>{c.name}</ListSubheader>,
                    ...c.subcategories.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    )),
                  ])}
                </Select>
                <Button
                  variant="contained" size="small"
                  onClick={handleCreateExpense}
                  disabled={submitting || !expAmount || !expSubcatId}
                  startIcon={submitting ? <CircularProgress size={16} /> : null}
                >
                  Criar
                </Button>
              </Box>
            </Paper>

            {/* Filters */}
            <Box display="flex" gap={1} mb={1} alignItems="center">
              <Select
                size="small" value={filterCatId} displayEmpty
                onChange={(e) => { setFilterCatId(e.target.value as number); setFilterSubcatId('') }}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="">Todas categorias</MenuItem>
                {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
              <Select
                size="small" value={filterSubcatId} displayEmpty
                onChange={(e) => setFilterSubcatId(e.target.value as number)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">Todas sub.</MenuItem>
                {(filterCatId ? categories.find((c) => c.id === filterCatId)?.subcategories ?? [] : allSubcategories).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
              <Typography variant="body2" color="text.secondary" ml="auto">
                {filteredExpenses.length} gastos
              </Typography>
            </Box>

            {/* Expense table */}
            <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('date')}>
                      Data <SortIcon field="date" />
                    </TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Subcategoria</TableCell>
                    <TableCell sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('amount')}>
                      Valor <SortIcon field="amount" />
                    </TableCell>
                    <TableCell width={80} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.map((exp) =>
                    editRowId === exp.id ? (
                      <TableRow key={exp.id}>
                        <TableCell>
                          <TextField size="small" type="date" value={editData.date}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            variant="standard" InputLabelProps={{ shrink: true }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            variant="standard"
                          />
                        </TableCell>
                        <TableCell>
                          <Select size="small" variant="standard" value={editData.subcategory_id}
                            onChange={(e) => setEditData({ ...editData, subcategory_id: e.target.value as number })}
                          >
                            {categories.map((c) => [
                              <ListSubheader key={`h-${c.id}`}>{c.name}</ListSubheader>,
                              ...c.subcategories.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                              )),
                            ])}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={editData.amount}
                            onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                            variant="standard" sx={{ width: 90 }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={handleSaveExpense} disabled={submitting}>
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditRowId(null)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={exp.id} hover sx={{ cursor: 'pointer' }} onDoubleClick={() => startEditExpense(exp)}>
                        <TableCell>{dayjs(exp.date).format('DD/MM')}</TableCell>
                        <TableCell>{exp.description ?? '—'}</TableCell>
                        <TableCell>
                          <Chip label={exp.subcategory.name} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: 'error.main' }}>{fmt(exp.amount)}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDeleteExpense(exp.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  {filteredExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>Nenhum gasto encontrado</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Incomes mini section */}
            <Paper sx={{ p: 1.5, mt: 2 }}>
              <Typography variant="subtitle2" mb={1}>Ganhos do mês</Typography>

              {/* Income list */}
              {incomes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" mb={1}>Nenhum ganho registrado</Typography>
              ) : (
                <Stack spacing={0.5} mb={1}>
                  {incomes.map((inc) =>
                    editIncomeId === inc.id ? (
                      <Box key={inc.id} display="flex" gap={1} alignItems="center">
                        <TextField size="small" value={editIncomeData.description} onChange={(e) => setEditIncomeData({ ...editIncomeData, description: e.target.value })} variant="standard" sx={{ flex: 1 }} />
                        <TextField size="small" type="date" value={editIncomeData.date} onChange={(e) => setEditIncomeData({ ...editIncomeData, date: e.target.value })} variant="standard" InputLabelProps={{ shrink: true }} sx={{ width: 140 }} />
                        <TextField size="small" type="number" value={editIncomeData.amount} onChange={(e) => setEditIncomeData({ ...editIncomeData, amount: e.target.value })} variant="standard" sx={{ width: 100 }} />
                        <IconButton size="small" onClick={handleSaveIncome} disabled={submitting}><SaveIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setEditIncomeId(null)}><CloseIcon fontSize="small" /></IconButton>
                      </Box>
                    ) : (
                      <Box key={inc.id} display="flex" alignItems="center" gap={1} onDoubleClick={() => startEditIncome(inc)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, px: 1, py: 0.3 }}>
                        <Typography variant="body2" flex={1}>{inc.description}</Typography>
                        <Typography variant="body2" color="text.secondary">{dayjs(inc.date).format('DD/MM')}</Typography>
                        <Typography variant="body2" fontWeight={600} color="success.main">{fmt(inc.amount)}</Typography>
                        <IconButton size="small" color="error" onClick={() => handleDeleteIncome(inc.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    )
                  )}
                </Stack>
              )}

              {/* New income form */}
              <Box display="flex" gap={1} alignItems="center">
                <TextField size="small" label="Descrição" value={incDesc} onChange={(e) => setIncDesc(e.target.value)} sx={{ flex: 1 }} />
                <TextField size="small" label="Data" type="date" value={incDate} onChange={(e) => setIncDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
                <TextField size="small" label="Valor" type="number" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} sx={{ width: 110 }} />
                <Button size="small" variant="contained" onClick={handleCreateIncome} disabled={submitting || !incAmount || !incDesc}
                  startIcon={submitting ? <CircularProgress size={14} /> : null}
                >
                  Criar
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* RIGHT COLUMN: pie charts and goals */}
          <Box flex={1} minWidth={300}>
            <Paper sx={{ p: 2 }}>
              <Tabs value={pieTab} onChange={(_, v) => setPieTab(v)} variant="fullWidth" sx={{ mb: 1 }}>
                <Tab label="Por categoria" />
                <Tab label="Por subcategoria" />
              </Tabs>

              {(pieTab === 0 ? pieCatData : pieSubData).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      Sem dados
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={pieTab === 0 ? pieCatData : pieSubData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={({ name, percent }: Record<string, unknown>) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                          labelLine={true}
                        >
                          {(pieTab === 0 ? pieCatData : pieSubData).map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {/* Category breakdown list */}
                  <Stack spacing={0.5} mt={1}>
                    {(pieTab === 0 ? (breakdown?.by_category ?? []).map((c) => ({ label: c.category, total: c.total })) : (breakdown?.by_subcategory ?? []).map((s) => ({ label: s.subcategory, total: s.total }))).map((item, i) => (
                      <Box key={i} display="flex" justifyContent="space-between" px={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: pieColors[i % pieColors.length] }} />
                          <Typography variant="body2">{item.label}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>{fmt(item.total)}</Typography>
                      </Box>
                    ))}
                  </Stack>
            </Paper>
          </Box>
        </Box>
      )}
        </>
      )}

      {/* ═══ TAB 2 — METAS ═══ */}
      {mainTab === 2 && (
        <Box maxWidth={700} mx="auto">
          {loadingMonth ? (
            <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
          ) : (
            <Stack spacing={2}>
              {/* Header with manage button */}
              <Box display="flex" justifyContent="flex-end">
                <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setGoalDialogOpen(true)}>
                  Gerenciar metas
                </Button>
              </Box>

              {/* Monthly overview */}
              {goals && goals.overview.goal_amount > 0 && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: goals.overview.is_over_goal ? 'error.dark' : 'primary.dark', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={0.5} color="white">Mês</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(goals.overview.progress_percent, 100)}
                    sx={{
                      height: 12, borderRadius: 6, mb: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': { bgcolor: goals.overview.is_over_goal ? '#ff6b6b' : '#69db7c' },
                    }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="white">
                      {goals.overview.progress_percent.toFixed(1)}% — {fmt(goals.overview.spent_amount)} / {fmt(goals.overview.goal_amount)}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="white">
                      {goals.overview.is_over_goal ? `Estourou ${fmt(Math.abs(goals.overview.remaining_amount))}` : `Restam ${fmt(goals.overview.remaining_amount)}`}
                    </Typography>
                  </Box>
                  {goals.overview.days_remaining > 0 && !goals.overview.is_over_goal && (
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }} color="white">
                      Pode gastar {fmt(goals.overview.per_day_available)}/dia ({goals.overview.days_remaining} dias restantes)
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Category goals with subcategories (read-only) */}
              {(goals?.categories ?? []).map((cat) => (
                <Paper key={cat.category_id} variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">{cat.category_name}</Typography>
                    {editingGoalCatId === cat.category_id ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2" color="text.secondary">{fmt(cat.spent_amount)} /</Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={editGoalAmount}
                          onChange={(e) => setEditGoalAmount(e.target.value)}
                          variant="standard"
                          sx={{ width: 90, '& .MuiInput-underline:before': { display: 'none' }, '& .MuiInput-underline:after': { display: 'none' }, '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveGoalEdit('category', cat.category_id); if (e.key === 'Escape') setEditingGoalCatId(null) }}
                          onBlur={() => handleSaveGoalEdit('category', cat.category_id)}
                        />
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color={cat.is_over_goal ? 'error.main' : 'text.secondary'}
                        fontWeight="bold"
                        sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                        onDoubleClick={() => { setEditingGoalCatId(cat.category_id); setEditingGoalSubId(null); setEditGoalAmount(String(cat.goal_amount)) }}
                      >
                        {fmt(cat.spent_amount)} / {fmt(cat.goal_amount)}
                      </Typography>
                    )}
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(cat.progress_percent, 100)}
                    color={cat.is_over_goal ? 'error' : 'primary'}
                    sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                  />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" color={cat.is_over_goal ? 'error.main' : 'text.secondary'}>
                      {cat.progress_percent.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color={cat.is_over_goal ? 'error.main' : 'text.secondary'}>
                      {cat.is_over_goal ? `Passou ${fmt(Math.abs(cat.remaining_amount))}` : `Restam ${fmt(cat.remaining_amount)}`}
                    </Typography>
                  </Box>

                  {cat.subcategories.length > 0 && (
                    <Stack spacing={0.75} ml={2} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 2 }}>
                      {cat.subcategories.map((sub) => (
                        <Box key={sub.subcategory_id}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption">{sub.subcategory_name}</Typography>
                            {editingGoalSubId === sub.subcategory_id ? (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Typography variant="caption" color="text.secondary">{fmt(sub.spent_amount)} /</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={editGoalAmount}
                                  onChange={(e) => setEditGoalAmount(e.target.value)}
                                  variant="standard"
                                  sx={{ width: 70, '& input': { fontSize: '0.75rem' }, '& .MuiInput-underline:before': { display: 'none' }, '& .MuiInput-underline:after': { display: 'none' }, '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': { WebkitAppearance: 'none' }, '& input[type=number]': { MozAppearance: 'textfield' } }}
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveGoalEdit('subcategory', sub.subcategory_id); if (e.key === 'Escape') setEditingGoalSubId(null) }}
                                  onBlur={() => handleSaveGoalEdit('subcategory', sub.subcategory_id)}
                                />
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                color={sub.is_over_goal ? 'error.main' : 'text.secondary'}
                                sx={{ cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
                                onDoubleClick={() => { setEditingGoalSubId(sub.subcategory_id); setEditingGoalCatId(null); setEditGoalAmount(String(sub.goal_amount)) }}
                              >
                                {fmt(sub.spent_amount)} / {fmt(sub.goal_amount)}
                              </Typography>
                            )}
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(sub.progress_percent, 100)}
                            color={sub.is_over_goal ? 'error' : 'inherit'}
                            sx={{ height: 4, borderRadius: 2, opacity: 0.7 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}

                  {cat.days_remaining > 0 && !cat.is_over_goal && (
                    <Typography variant="caption" color="text.secondary" mt={0.75} display="block">
                      {fmt(cat.per_day_available)}/dia ({cat.days_remaining} dias)
                    </Typography>
                  )}
                </Paper>
              ))}

              {(goals?.categories ?? []).length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary" mb={1}>Nenhuma meta cadastrada.</Typography>
                  <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => setGoalDialogOpen(true)}>
                    Criar metas
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      )}

      {/* ═══ GOAL MANAGER DIALOG ═══ */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Gerenciar Metas
          <IconButton size="small" onClick={() => setGoalDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Existing goals - editable */}
            {(goals?.categories ?? []).map((cat) => (
              <Paper key={cat.category_id} variant="outlined" sx={{ p: 1.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  {editingGoalCatId === cat.category_id ? (
                    <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                      <TextField
                        size="small"
                        type="number"
                        value={editGoalAmount}
                        onChange={(e) => setEditGoalAmount(e.target.value)}
                        variant="standard"
                        sx={{ width: 120 }}
                        placeholder="Meta (R$)"
                      />
                      <IconButton size="small" onClick={() => handleSaveGoalEdit('category', cat.category_id)} disabled={savingGoal}>
                        <SaveIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setEditingGoalCatId(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => { setEditingGoalCatId(cat.category_id); setEditingGoalSubId(null); setEditGoalAmount(String(cat.goal_amount)) }}
                    >
                      {cat.category_name} — {fmt(cat.goal_amount)}
                    </Typography>
                  )}
                </Box>

                {cat.subcategories.length > 0 && (
                  <Stack spacing={0.5} ml={2} sx={{ borderLeft: '2px solid', borderColor: 'divider', pl: 1.5 }}>
                    {cat.subcategories.map((sub) => (
                      <Box key={sub.subcategory_id} display="flex" justifyContent="space-between" alignItems="center">
                        {editingGoalSubId === sub.subcategory_id ? (
                          <Box display="flex" alignItems="center" gap={0.5} flex={1}>
                            <TextField
                              size="small"
                              type="number"
                              value={editGoalAmount}
                              onChange={(e) => setEditGoalAmount(e.target.value)}
                              variant="standard"
                              sx={{ width: 100 }}
                              placeholder="Meta"
                            />
                            <IconButton size="small" onClick={() => handleSaveGoalEdit('subcategory', sub.subcategory_id)} disabled={savingGoal}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setEditingGoalSubId(null)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => { setEditingGoalSubId(sub.subcategory_id); setEditingGoalCatId(null); setEditGoalAmount(String(sub.goal_amount)) }}
                          >
                            {sub.subcategory_name} — {fmt(sub.goal_amount)}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            ))}

            {/* New goal form */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" mb={1}>Nova meta</Typography>
              <Stack spacing={1}>
                <Tabs
                  value={newGoalType}
                  onChange={(_, v) => { setNewGoalType(v); setGoalCategoryId(''); setGoalSubcategoryId('') }}
                  variant="fullWidth"
                  sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0.5, fontSize: '0.75rem' } }}
                >
                  <Tab label="Categoria" value="category" />
                  <Tab label="Subcategoria" value="subcategory" />
                </Tabs>

                <Select
                  size="small"
                  value={goalCategoryId}
                  displayEmpty
                  onChange={(e) => {
                    setGoalCategoryId(e.target.value as number)
                    setGoalSubcategoryId('')
                  }}
                >
                  <MenuItem value="">Categoria</MenuItem>
                  {(newGoalType === 'category' ? availableGoalCategories : categories).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>

                {newGoalType === 'subcategory' && (
                  <Select
                    size="small"
                    value={goalSubcategoryId}
                    displayEmpty
                    onChange={(e) => setGoalSubcategoryId(e.target.value as number)}
                    disabled={!goalCategoryId}
                  >
                    <MenuItem value="">Subcategoria</MenuItem>
                    {availableGoalSubcategories.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                )}

                <TextField
                  size="small"
                  label="Meta (R$)"
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                />

                <Button
                  size="small"
                  variant="contained"
                  onClick={handleCreateGoal}
                  disabled={creatingGoal || !goalCategoryId || (newGoalType === 'subcategory' && !goalSubcategoryId) || !goalAmount}
                >
                  {creatingGoal ? 'Criando...' : 'Criar meta'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>

      <CategoryManagerDialog
        open={catDialogOpen}
        onClose={() => setCatDialogOpen(false)}
        categories={categories}
        onRefresh={loadCategories}
      />

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack?.severity} onClose={() => setSnack(null)}>{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
