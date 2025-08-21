'use client'

import AssetAveragePriceChart from '@/components/AssetAveragePriceChart'
import AssetDetailsCard from '@/components/AssetDetailsCard'
import PortfolioDividendsChart from '@/components/PortfolioDividendsChart'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import Trades from '@/components/Trades'
import BackButton from '@/components/ui/BackButton'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Asset, Dividend } from '@/types'
import { Box, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PortfolioAssetPage() {
  const { id } = useParams<{ id: string }>()
  const { selectedPortfolio } = usePortfolio()
  const [patrimonyEvolution, setPatrimonyEvolution] = useState<any[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [asset, setAsset] = useState<Asset>()
  const [loading, setLoading] = useState(true)
  const { setTitle } = usePageTitle()
  const [chartMode, setChartMode] = useState<'patrimony' | 'dividends'>('patrimony')

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

  return (
    <Box>
      <BackButton />
      <Grid container direction="row">
        <Grid size={{ xs: 24 }}>
          <AssetDetailsCard asset={asset} />
        </Grid>
      </Grid>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 6 }}>
          <PortfolioReturnsChart
            size={250}
            selectedAssets={[asset.ticker]}
            selectedCategory={'CDI'}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
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
              selected={'portfolio'}
              size={250}
            />
          ) : (
            <PortfolioDividendsChart dividends={dividends} selected={'portfolio'} size={250} />
          )}
        </Grid>
      </Grid>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <Trades assetId={parseInt(id!)} />
        </Grid>
      </Grid>
      <Grid container direction="row" mt={2}>
        <Grid size={{ xs: 24 }}>
          <AssetAveragePriceChart size={500} assetId={parseInt(id!)} />
        </Grid>
      </Grid>
    </Box>
  )
}
