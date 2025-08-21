'use client'

import { ASSET_TYPES } from '@/app/constants/assetTypes'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { PatrimonyEntry, PortfolioPositionEntry } from '@/types'
import { Alert, Box, CircularProgress, Grid, Snackbar, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PensionPieChart from './PensionPieChart'
import PensionTable from './PensionTable'

export default function PensionPage() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio } = usePortfolio()

  const [positionData, setPositionData] = useState<PortfolioPositionEntry[]>([])
  const [patrimonyData, setPatrimonyData] = useState<PatrimonyEntry[]>([])

  const [tabIndex, setTabIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle('Previdência')
  }, [])

  useEffect(() => {
    if (!selectedPortfolio) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [positionRes, patrimonyRes] = await Promise.all([
          api.get(`/portfolio/${selectedPortfolio?.id}/pension/position`),
          api.get(
            `/portfolio/${selectedPortfolio?.id}/patrimony_evolution?asset_type_id=${ASSET_TYPES.PREV}`
          ),
        ])
        setPositionData(positionRes.data)
        setPatrimonyData(patrimonyRes.data)
      } catch (err) {
        console.error('Erro ao buscar dados de Previdência', err)
        setError('Erro ao carregar dados de Previdência')
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
              <PensionTable data={positionData} />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <PensionPieChart data={positionData} />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={3}>
        {/* Rentabilidade (esquerda) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box borderBottom={1} borderColor="divider">
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="Previdência Tabs"
            >
              <Tab label="Rentabilidade" />
            </Tabs>
          </Box>

          <Box mt={2}>
            {tabIndex === 0 && <PortfolioReturnsChart size={295} selectedCategory="Previdência" />}
          </Box>
        </Grid>

        {/* Evolução Patrimonial (direita) */}
        <Grid size={{ xs: 12, md: 6 }} mt={1}>
          <Box display="flex" alignItems="left" mb={6} ml={5}>
            <Typography variant="h6">Evolução Patrimonial</Typography>
          </Box>
          <PortfolioPatrimonyChart
            patrimonyEvolution={patrimonyData}
            selected="Previdência"
            size={300}
          />
        </Grid>
      </Grid>

      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades assetTypes={[ASSET_TYPES.PREV]} currencyId={1} />
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
