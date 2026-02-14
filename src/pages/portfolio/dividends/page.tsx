
import DividendForm from '@/components/DividendForm'
import DividendsCategoryChart from '@/components/DividendsCategoryChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

interface Dividend {
  id: number
  asset_id: number
  ticker: string
  category: string
  amount: number
  date: string
  portfolio_id: number
}

export default function PortfolioDividendsPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio, userCategories } = usePortfolio()

  const [dividends, setDividends] = useState<Dividend[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicker, setSelectedTicker] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year())

  const [formOpen, setFormOpen] = useState(false)
  const [selectedDividend, setSelectedDividend] = useState<Dividend | null>(null)

  useEffect(() => {
    setTitle('Proventos da Carteira')
  }, [])

  const fetchDividends = async () => {
    if (!selectedPortfolio) return
    setLoading(true)
    const { data } = await api.get(`/portfolio/dividends/${selectedPortfolio.id}`)
    setDividends(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDividends()
  }, [selectedPortfolio])

  const filteredDividends = useMemo(() => {
    return dividends
      .filter((d) => {
        const matchTicker = selectedTicker ? d.ticker === selectedTicker : true
        const matchCategory = selectedCategory ? d.category === selectedCategory : true
        return matchTicker && matchCategory
      })
      .sort((a, b) => (dayjs(b.date).isAfter(dayjs(a.date)) ? 1 : -1))
  }, [dividends, selectedTicker, selectedCategory])

  const categories = useMemo(() => {
    return Array.from(new Set(dividends.map((d) => d.category))).sort()
  }, [dividends])

  const categoryColors: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {}
    userCategories.forEach((cat) => {
      map[cat.name] = cat.color
    })
    return map
  }, [userCategories])

  const tickers = useMemo(() => {
    return Array.from(new Set(dividends.map((d) => d.ticker))).sort()
  }, [dividends])

  const years = useMemo(() => {
    return Array.from(new Set(dividends.map((d) => dayjs(d.date).year())))
      .sort((a, b) => b - a)
  }, [dividends])

  return (
    <Box pt={2}>
      {loading ? (
        <Box minHeight="80vh" display="flex" justifyContent="center" alignItems="center">
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : (
        <>
          <Box display="flex" gap={2} mb={2} alignItems="center">
              <Autocomplete
                options={tickers}
                value={selectedTicker}
                onChange={(_, newValue) => setSelectedTicker(newValue || '')}
                renderInput={(params) => <TextField {...params} label="Ativo" size="small" />}
                fullWidth
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoria"
                  onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 90 }}>
                <InputLabel>Ano</InputLabel>
                <Select
                  value={String(selectedYear)}
                  label="Ano"
                  onChange={(e: SelectChangeEvent) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={String(y)}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedDividend(null)
                  setFormOpen(true)
                }}
                fullWidth
                sx={{ maxWidth: 90 }} // ou qualquer valor que caiba no seu layout
              >
                + Novo
              </Button>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TableContainer component={Paper} sx={{ height: '460px', overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ativo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">
                      Valor
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDividends.map((dividend) => (
                    <TableRow
                      key={dividend.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedDividend(dividend)
                        setFormOpen(true)
                      }}
                    >
                      <TableCell>{dayjs(dividend.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{dividend.ticker}</TableCell>
                      <TableCell align="right">
                        R$ {dividend.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2, height: '460px', display: 'flex', flexDirection: 'column' }}>
              <DividendsCategoryChart
                dividends={filteredDividends}
                categoryColors={categoryColors}
                year={selectedYear}
                size={420}
              />
            </Paper>
          </Grid>
        </Grid>
        </>
      )}

      <DividendForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={() => {
          setFormOpen(false)
          fetchDividends()
        }}
        dividend={selectedDividend ?? undefined}
      />
    </Box>
  )
}
