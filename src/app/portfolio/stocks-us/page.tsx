'use client'

import { ASSET_TYPES } from '@/app/constants/assetTypes'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { PatrimonyEntry, StockPortfolioPositionEntry } from '@/types'
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
import StocksPieChart from '../stocks-br/StocksPieChart'
import StocksTable from '../stocks-br/StocksTable'

export default function StocksEuaPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const [positionData, setPositionData] = useState<StockPortfolioPositionEntry[]>([])
  const [patrimonyData, setPatrimonyData] = useState<PatrimonyEntry[]>([])
  const [tabIndex, setTabIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [groupBy, setGroupBy] = useState<'ticker' | 'sector' | 'industry'>('ticker')
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos')

  useEffect(() => {
    setTitle('Ações EUA')
  }, [])

  useEffect(() => {
    if (!selectedPortfolio) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [positionRes, patrimonyRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio?.id}/usd_stocks/position`),
          api.get(`/portfolio/${selectedPortfolio?.id}/patrimony_evolution`, {
            params: {
              asset_type_ids: [ASSET_TYPES.STOCK, ASSET_TYPES.BDR, ASSET_TYPES.ETF],
              currency_id: 2,
            },
          }),
        ])
        setPositionData(positionRes.data)
        setPatrimonyData(patrimonyRes.data)
      } catch (err) {
        console.error('Erro ao buscar dados de Ações EUA', err)
        setError('Erro ao carregar dados de Ações EUA.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedPortfolio])

  const availableFilters = useMemo(() => {
    const unique = new Set(positionData.map((stock) => stock[groupBy]))
    return ['Todos', ...Array.from(unique)]
  }, [groupBy, positionData])

  const filteredStocks = useMemo(() => {
    if (selectedGroup === 'Todos') return positionData
    return positionData.filter((stock) => stock[groupBy] === selectedGroup)
  }, [positionData, groupBy, selectedGroup])

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
            <MenuItem value="sector">Setor</MenuItem>
            <MenuItem value="industry">Indústria</MenuItem>
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
            {availableFilters.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
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
              <StocksTable data={positionData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StocksPieChart data={filteredStocks} groupBy="ticker" />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box borderBottom={1} borderColor="divider">
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="Ações EUA Tabs"
            >
              <Tab label="Rentabilidade" />
            </Tabs>
          </Box>

          <Box mt={2}>
            {tabIndex === 0 && <PortfolioReturnsChart size={295} selectedCategory="Ações EUA" />}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} mt={1}>
          <Box display="flex" alignItems="left" mb={6} ml={5}>
            <Typography variant="h6">Evolução Patrimonial</Typography>
          </Box>
          <PortfolioPatrimonyChart
            patrimonyEvolution={patrimonyData}
            selected="portfolio"
            size={300}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades assetTypes={[ASSET_TYPES.ETF, ASSET_TYPES.STOCK]} currencyId={2} />
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
