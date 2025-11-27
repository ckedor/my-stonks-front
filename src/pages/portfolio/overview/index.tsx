import { Alert, Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PortfolioDividendsChart from '../../../components/PortfolioDividendsChart'
import PortfolioPatrimonyChart from '../../../components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '../../../components/PortfolioReturnsChart'
import TradeForm from '../../../components/TradeForm'
import { usePageTitle } from '../../../contexts/PageTitleContext'
import { usePortfolio } from '../../../contexts/PortfolioContext'
import { usePortfolioReturns } from '../../../contexts/PortfolioReturnsContext'
import api from '../../../lib/api'
import type { Dividend, PatrimonyEntry, PortfolioPositionEntry } from '../../../types'
import PositionPieChart from './PositionPieChart'
import PositionTable from './PositionTable'

export default function PortfolioOverviewPage() {
  const { selectedPortfolio, userCategories, portfolioRefreshKey } = usePortfolio()
  const { categoryReturns } = usePortfolioReturns()

  const [positions, setPositions] = useState<PortfolioPositionEntry[] | null>(null)
  const [patrimonyEvolution, setPatrimonyEvolution] = useState<PatrimonyEntry[] | null>(null)
  const [dividends, setDividends] = useState<Dividend[] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('portfolio')
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('CDI')
  const [chartMode, setChartMode] = useState<'patrimony' | 'dividends'>('patrimony')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openTradeForm, setOpenTradeForm] = useState(false)

  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Resumo Carteira')
    if (!selectedPortfolio) return
    setTitle(`Resumo Carteira - ${selectedPortfolio?.name}`)
  }, [selectedPortfolio, setTitle])

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPortfolio?.id) return

      setLoading(true)
      setError(null)

      try {
        const [positionsRes, dividendsRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio.id}/position`),
          api.get(`/portfolio/dividends/${selectedPortfolio.id}`),
        ])

        let patrimony: PatrimonyEntry[] = []
        try {
          const patrimonyRes = await api.get(
            `/portfolio/${selectedPortfolio.id}/patrimony_evolution`
          )
          patrimony = patrimonyRes.data
        } catch (err: any) {
          if (err?.response?.status === 404) {
            patrimony = []
          } else {
            throw err
          }
        }

        setPositions(positionsRes.data)
        setDividends(dividendsRes.data)
        setPatrimonyEvolution(patrimony)
      } catch (err) {
        console.error('Erro ao carregar overview do portfólio', err)
        setError('Erro ao carregar dados do portfólio.')
      } finally {
        setLoading(false)
      }
    }

    // refaz fetch quando:
    // - muda a carteira
    // - OU alguém dispara triggerPortfolioRefresh()
    fetchData()
  }, [selectedPortfolio?.id, portfolioRefreshKey])

  useEffect(() => {
    if (selectedCategory === 'portfolio') {
      setSelectedBenchmark('CDI')
    } else {
      const found = userCategories.find((c) => c.name === selectedCategory)
      if (found?.benchmark?.short_name) {
        setSelectedBenchmark(found.benchmark.short_name)
      } else {
        setSelectedBenchmark('CDI')
      }
    }
  }, [selectedCategory, userCategories])

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={64} thickness={4} />
      </Box>
    )
  }

  if (!loading && positions?.length === 0) {
    return (
      <Box
        height="80vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h6" gutterBottom>
          Sua carteira ainda está vazia
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Comece cadastrando sua primeira compra
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => setOpenTradeForm(true)}
        >
          Cadastrar Primeira Compra
        </Button>

        <TradeForm open={openTradeForm} onClose={() => setOpenTradeForm(false)} assetId={0} />
      </Box>
    )
  }

  if (error || !positions || !patrimonyEvolution || !dividends) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Grid container direction="row">
        <Grid size={{ xs: 12, md: 12, lg: 6 }}>
          <PositionPieChart positions={positions} selectedCategory={selectedCategory} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 12, lg: 6 }}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <PositionTable
            positions={positions}
            onCategorySelect={setSelectedCategory}
            returns={categoryReturns}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={1}>
        <Grid size={{ xs: 12, md: 12, lg: 12, xl: 6 }}>
          <PortfolioReturnsChart
            size={380}
            selectedCategory={selectedCategory}
            selectedBenchmark={selectedBenchmark}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12, lg: 12, xl: 6 }}>
          <Stack direction="row" justifyContent="flex-end" mt={2.5} mb={1.8} pr={1.2} spacing={2}>
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                fontWeight: chartMode === 'patrimony' ? 'bold' : 'normal',
              }}
              onClick={() => setChartMode('patrimony')}
            >
              Evolução Patrimonial
            </Typography>
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                fontWeight: chartMode === 'dividends' ? 'bold' : 'normal',
              }}
              onClick={() => setChartMode('dividends')}
            >
              Dividendos
            </Typography>
          </Stack>

          {chartMode === 'patrimony' ? (
            <PortfolioPatrimonyChart
              patrimonyEvolution={patrimonyEvolution}
              selected={selectedCategory}
              size={360}
            />
          ) : (
            <PortfolioDividendsChart dividends={dividends} selected={selectedCategory} />
          )}
        </Grid>
      </Grid>

      <TradeForm open={openTradeForm} onClose={() => setOpenTradeForm(false)} assetId={0} />
    </Box>
  )
}
