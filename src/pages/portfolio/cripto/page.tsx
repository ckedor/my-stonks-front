
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import { ASSET_TYPES } from '@/constants/assetTypes'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { PatrimonyEntry, PortfolioPositionEntry } from '@/types'
import { Alert, Box, CircularProgress, Grid, Snackbar, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import CriptoPieChart from './CriptoPieChart'
import CriptoTable from './CriptoTable'

export default function CriptoPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const [positionData, setPositionData] = useState<PortfolioPositionEntry[]>([])
  const [patrimonyData, setPatrimonyData] = useState<PatrimonyEntry[]>([])
  const [tabIndex, setTabIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle('Criptomoedas')
  }, [])

  useEffect(() => {
    if (!selectedPortfolio) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [positionRes, patrimonyRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio?.id}/cripto/position`),
          api.get(
            `/portfolio/${selectedPortfolio?.id}/patrimony_evolution?asset_type_id=${ASSET_TYPES.CRIPTO}`
          ),
        ])
        setPositionData(positionRes.data)
        setPatrimonyData(patrimonyRes.data)
      } catch (err) {
        console.error('Erro ao buscar dados de Cripto', err)
        setError('Erro ao carregar dados de Criptomoedas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedPortfolio])

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
            <Grid size={{ xs: 12 }} mt={1}>
              <CriptoTable data={positionData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CriptoPieChart data={positionData} />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={3}>
        {/* Rentabilidade à esquerda */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box borderBottom={1} borderColor="divider">
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="Cripto Tabs"
            >
              <Tab label="Rentabilidade" />
            </Tabs>
          </Box>

          <Box mt={2}>
            {tabIndex === 0 && <PortfolioReturnsChart size={295} selectedCategory="Cripto" />}
          </Box>
        </Grid>

        {/* Evolução Patrimonial à direita */}
        <Grid size={{ xs: 12, md: 6 }} mt={1}>
          <Box display="flex" alignItems="left" mb={6} ml={5}>
            <Typography variant="h6">Evolução Patrimonial</Typography>
          </Box>
          <PortfolioPatrimonyChart
            patrimonyEvolution={patrimonyData}
            selected="Cripto"
            size={300}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades assetTypes={[ASSET_TYPES.CRIPTO]} />
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
