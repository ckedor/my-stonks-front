import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import CategoryIcon from '@mui/icons-material/Category'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
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
    fetchYearlySummary,
    updateExpense,
    updateIncome,
    type FinanceCategory,
    type FinanceExpense,
    type FinanceIncome,
    type MonthlyBreakdown,
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

  const [loadingYear, setLoadingYear] = useState(true)
  const [loadingMonth, setLoadingMonth] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  // Pie chart tab
  const [pieTab, setPieTab] = useState(0)

  // Dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false)

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
      const [exp, inc, bd] = await Promise.all([
        fetchExpenses(year, month),
        fetchIncomes(year, month),
        fetchMonthlyBreakdown(year, month),
      ])
      setExpenses(exp)
      setIncomes(inc)
      setBreakdown(bd)
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

  const pieColors = theme.palette.chart.colors

  const pieCatData = useMemo(() =>
    (breakdown?.by_category ?? []).map((c) => ({ name: c.category, value: c.total })), [breakdown])

  const pieSubData = useMemo(() =>
    (breakdown?.by_subcategory ?? []).map((s) => ({ name: s.subcategory, value: s.total })), [breakdown])

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
      {/* ═══ YEAR CHART ═══ */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" fontWeight="bold">Ganhos vs Gastos — {year}</Typography>
          <Select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 100 }}>
            {Array.from({ length: 6 }, (_, i) => now.year() - i).map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>

        {loadingYear ? (
          <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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

      {/* ═══ MONTH SECTION ═══ */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontWeight="bold">Mês</Typography>
          <Select size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={{ minWidth: 100 }}>
            {MONTHS.map((m, i) => <MenuItem key={i} value={i + 1}>{m}</MenuItem>)}
          </Select>
          <Select size="small" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ minWidth: 90 }}>
            {Array.from({ length: 6 }, (_, i) => now.year() - i).map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </Box>
        <Chip icon={<CategoryIcon />} label="Categorias" variant="outlined" size="small" onClick={() => setCatDialogOpen(true)} sx={{ cursor: 'pointer' }} />
      </Box>

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

          {/* RIGHT COLUMN: pie charts */}
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
