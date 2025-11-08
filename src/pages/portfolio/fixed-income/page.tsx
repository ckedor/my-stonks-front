
import { ASSET_TYPES } from '@/app/constants/assetTypes'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Dividend, FixedIncomePositionEntry, PatrimonyEntry } from '@/types'
import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import FixedIncomeDividendsChart from './FixedIncomeDividendsChart'
import FixedIncomePieChart from './FixedIncomePieChart'
import FixedIncomeTable from './FixedIncomeTable'

export default function FixedIncomePage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const [positionData, setPositionData] = useState<FixedIncomePositionEntry[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [patrimonyData, setPatrimonyData] = useState<PatrimonyEntry[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [groupBy, setGroupBy] = useState<
    'ticker' | 'fixed_income_type' | 'fixed_income_index_name'
  >('ticker')
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos')
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setTitle('Renda Fixa')
  }, [])

  const asset_type_ids = [
    ASSET_TYPES.CDB,
    ASSET_TYPES.DEB,
    ASSET_TYPES.CRI,
    ASSET_TYPES.CRA,
    ASSET_TYPES.TREASURY,
  ]

  useEffect(() => {
    if (!selectedPortfolio) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [positionRes, divsRes, patrimonyRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio?.id}/fixed_income/position`),
          api.get(`/portfolio/dividends/${selectedPortfolio?.id}`, {
            params: { asset_type_ids: asset_type_ids },
          }),
          api.get(`/portfolio/${selectedPortfolio?.id}/patrimony_evolution`, {
            params: { asset_type_ids: asset_type_ids },
          }),
        ])
        setPositionData(positionRes.data)
        setDividends(divsRes.data)
        setPatrimonyData(patrimonyRes.data)
      } catch (err) {
        console.error('Erro ao buscar dados de Renda Fixa', err)
        setError('Erro ao carregar dados de Renda Fixa.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedPortfolio])

  const availableFilters = useMemo(() => {
    const unique = new Set(positionData.map((item) => item[groupBy]))
    return ['Todos', ...Array.from(unique)]
  }, [groupBy, positionData])

  const filteredData = useMemo(() => {
    if (selectedGroup === 'Todos') return positionData
    return positionData.filter((item) => item[groupBy] === selectedGroup)
  }, [positionData, groupBy, selectedGroup])

  const filteredDividends = useMemo(() => {
    const ativosSelecionados = filteredData.map((item) => item.ticker)
    return dividends.filter((d) => ativosSelecionados.includes(d.ticker))
  }, [filteredData, dividends])

  function renderMenu() {
    return (
      <Box display="flex" gap={2}>
        <FormControl size="small">
          <InputLabel>Agrupar por</InputLabel>
          <Select
            sx={{ minWidth: '130px' }}
            value={groupBy}
            onChange={(e: SelectChangeEvent) => {
              setGroupBy(e.target.value as any)
              setSelectedGroup('Todos')
            }}
            label="Agrupar por"
          >
            <MenuItem value="ticker">Ativo</MenuItem>
            <MenuItem value="fixed_income_type">Tipo</MenuItem>
            <MenuItem value="fixed_income_index_name">Indexador</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Filtro</InputLabel>
          <Select
            sx={{ minWidth: '130px' }}
            value={selectedGroup}
            onChange={(e: SelectChangeEvent) => setSelectedGroup(e.target.value)}
            label="Filtro"
          >
            {availableFilters.map((v) =>
              v != null ? (
                <MenuItem key={String(v)} value={String(v)}>
                  {v}
                </MenuItem>
              ) : null
            )}
          </Select>
        </FormControl>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container direction="row">
            <Grid size={{ xs: 12 }}>{renderMenu()}</Grid>
            <Grid size={{ xs: 12 }} mt={1}>
              <FixedIncomeTable data={filteredData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FixedIncomePieChart data={filteredData} />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box borderBottom={1} borderColor="divider">
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="Fixed Income Tabs"
            >
              <Tab label="Rentabilidade" />
              <Tab label="Proventos" />
            </Tabs>
          </Box>

          <Box mt={2}>
            {tabIndex === 0 && <PortfolioReturnsChart size={295} selectedCategory="Renda Fixa" />}
            {tabIndex === 1 && <FixedIncomeDividendsChart data={filteredDividends} />}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} mt={1}>
          <Box display="flex" alignItems="left" mb={6} ml={5}>
            <Typography variant="h6">Evolução Patrimonial</Typography>
          </Box>
          <PortfolioPatrimonyChart
            patrimonyEvolution={patrimonyData}
            selected="Renda Fixa"
            size={300}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades
            assetTypes={[
              ASSET_TYPES.CDB,
              ASSET_TYPES.DEB,
              ASSET_TYPES.CRI,
              ASSET_TYPES.CRA,
              ASSET_TYPES.TREASURY,
            ]}
            currencyId={1}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}
