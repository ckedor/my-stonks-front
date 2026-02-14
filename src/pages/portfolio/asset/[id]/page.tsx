
import AssetAveragePriceChart from '@/components/AssetAveragePriceChart'
import AssetDetailsCard from '@/components/AssetDetailsCard'
import AssetSidebar from '@/components/AssetSidebar'
import PortfolioDividendsChart from '@/components/PortfolioDividendsChart'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import AppBreadcrumbs from '@/components/ui/AppBreadcrumbs'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Asset, Dividend } from '@/types'
import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"

export default function PortfolioAssetPage() {
  const { id } = useParams<{ id: string }>()
  const { selectedPortfolio } = usePortfolio()
  const [patrimonyEvolution, setPatrimonyEvolution] = useState<any[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [asset, setAsset] = useState<Asset>()
  const [loading, setLoading] = useState(true)
  const { setTitle } = usePageTitle()
  const [chartMode, setChartMode] = useState<'returns' | 'patrimony' | 'dividends'>('returns')

  useEffect(() => {
    if (asset) {
      setTitle(`${asset.ticker} - ${asset.name}`)
    }
  }, [asset])

  useEffect(() => {
    const fetch = async () => {
      if (!selectedPortfolio || !id) return

      try {
        const [assetRes, patrimonyRes, dividendRes] = await Promise.all([
          api.get(`/portfolio/asset/details?portfolio_id=${selectedPortfolio.id}&asset_id=${id}`),
          api.get(`/portfolio/${selectedPortfolio.id}/patrimony_evolution?asset_id=${id}`),
          api.get(`/portfolio/dividends/${selectedPortfolio.id}/?asset_id=${id}`),
        ])
        setPatrimonyEvolution(patrimonyRes.data)
        setAsset(assetRes.data)
        setDividends(dividendRes.data)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [selectedPortfolio, id])

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={64} thickness={4} />
      </Box>
    )
  }

  if (!asset) {
    return (
      <Box p={4}>
        <Typography>Ativo não encontrado.</Typography>
      </Box>
    )
  }

  const chartTabs: { key: 'returns' | 'patrimony' | 'dividends'; label: string }[] = [
    { key: 'returns', label: 'Rentabilidade' },
    { key: 'patrimony', label: 'Evolução Patrimonial' },
    { key: 'dividends', label: 'Dividendos' },
  ]

  return (
    <Box display="flex" sx={{ ml: -4, mr: -4, mb: -1 }}>
      {/* Sidebar de ativos */}
      <Box
        sx={{
          width: 180,
          minWidth: 180,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            maxHeight: 'calc(100vh - 112px)',
            overflowY: 'auto',
            pt: 1.5,
            pl: 2,
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'divider',
              borderRadius: 2,
            },
          }}
        >
          <AssetSidebar selectedAssetId={parseInt(id!)} />
        </Box>
      </Box>

      {/* Conteúdo principal */}
      <Box flex={1} minWidth={0} sx={{ pt: 2, px: 3 }}>
      <AppBreadcrumbs items={[
        { label: 'Ativos', href: '/portfolio/asset' },
        { label: asset.ticker },
      ]} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }} my={3}>
          <AssetDetailsCard asset={asset} />
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Stack direction="row" justifyContent="flex-end" mb={1} pr={1.2} spacing={2}>
            {chartTabs.map((tab) => (
              <Typography
                key={tab.key}
                variant="body2"
                sx={{
                  cursor: 'pointer',
                  fontWeight: chartMode === tab.key ? 'bold' : 'normal',
                  borderBottom: chartMode === tab.key ? '2px solid' : '2px solid transparent',
                  borderColor: chartMode === tab.key ? 'primary.main' : 'transparent',
                  pb: 0.5,
                }}
                onClick={() => setChartMode(tab.key)}
              >
                {tab.label}
              </Typography>
            ))}
          </Stack>
          {chartMode === 'returns' && (
            <PortfolioReturnsChart
              size={350}
              selectedAssets={[asset.ticker]}
              selectedBenchmark={'CDI'}
            />
          )}
          {chartMode === 'patrimony' && (
            <PortfolioPatrimonyChart
              patrimonyEvolution={patrimonyEvolution}
              selected={'portfolio'}
              size={350}
              hideContributions
            />
          )}
          {chartMode === 'dividends' && (
            <PortfolioDividendsChart dividends={dividends} selected={'portfolio'} size={350} />
          )}
        </Grid>
      </Grid>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 12 }}>
          <Trades assetId={parseInt(id!)} />
        </Grid>
      </Grid>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 12 }}>
          <AssetAveragePriceChart size={500} assetId={parseInt(id!)} />
        </Grid>
      </Grid>
      </Box>
    </Box>
  )
}
