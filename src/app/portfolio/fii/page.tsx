'use client'

import { ASSET_TYPES } from '@/app/constants/assetTypes'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Dividend, FIIPortfolioPositionEntry, PatrimonyEntry } from '@/types'
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
import FIIsDividendsChart from './FIIsDividendsChart'
import FIIsPieChart from './FIIsPieChart'
import FIIsTable from './FIIsTable'

export default function FIIsPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const [fiiData, setFiiData] = useState<FIIPortfolioPositionEntry[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [patrimonyData, setPatrimonyData] = useState<PatrimonyEntry[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [groupBy, setGroupBy] = useState<'ticker' | 'fii_type' | 'fii_segment'>('ticker')
  const [selectedGroup, setSelectedGroup] = useState<string>('Todos')

  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setTitle('FIIs')
  }, [])

  useEffect(() => {
    if (!selectedPortfolio) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [fiisRes, divsRes, patrimonyRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio?.id}/fii/position`),
          api.get(`/portfolio/dividends/${selectedPortfolio?.id}`, {
            params: { asset_type_id: ASSET_TYPES.FII },
          }),
          api.get(`/portfolio/${selectedPortfolio?.id}/patrimony_evolution`, {
            params: { asset_type_id: ASSET_TYPES.FII },
          }),
        ])
        setFiiData(fiisRes.data)
        setDividends(divsRes.data)
        setPatrimonyData(patrimonyRes.data)
      } catch (err) {
        console.error('Erro ao buscar dados de FIIs', err)
        setError('Erro ao carregar dados dos FIIs.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedPortfolio])

  const availableFilters = useMemo(() => {
    const unique = new Set(fiiData.map((fii) => fii[groupBy]))
    return ['Todos', ...Array.from(unique)]
  }, [groupBy, fiiData])

  const filteredFIIs = useMemo(() => {
    if (selectedGroup === 'Todos') return fiiData
    return fiiData.filter((fii) => fii[groupBy] === selectedGroup)
  }, [fiiData, groupBy, selectedGroup])

  const filteredDividends = useMemo(() => {
    const ativosSelecionados = filteredFIIs.map((fii) => fii.ticker)
    return dividends.filter((d) => ativosSelecionados.includes(d.ticker))
  }, [filteredFIIs, dividends])

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
            <MenuItem value="fii_type">Tipo</MenuItem>
            <MenuItem value="fii_segment">Segmento</MenuItem>
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
              <FIIsTable data={fiiData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FIIsPieChart data={filteredFIIs} groupBy={groupBy} />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box borderBottom={1} borderColor="divider">
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="FIIs Tabs"
            >
              <Tab label="Rentabilidade" />
              <Tab label="Proventos" />
            </Tabs>
          </Box>

          <Box mt={2}>
            {tabIndex === 0 && <PortfolioReturnsChart size={295} selectedCategory="FIIs" />}
            {tabIndex === 1 && <FIIsDividendsChart data={filteredDividends} groupBy={groupBy} />}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} mt={1}>
          <Box display="flex" alignItems="left" mb={6} ml={5}>
            <Typography variant="h6">Evolução Patrimonial</Typography>
          </Box>
          <PortfolioPatrimonyChart patrimonyEvolution={patrimonyData} selected="FIIs" size={300} />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades assetTypes={[ASSET_TYPES.FII]} currencyId={1} />
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
