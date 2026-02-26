
import AssetAveragePriceChart from '@/components/AssetAveragePriceChart'
import AssetDetailsCard from '@/components/AssetDetailsCard'
import AssetSidebar from '@/components/AssetSidebar'
import DrawdownChart from '@/components/DrawdownChart'
import PortfolioDividendsChart from '@/components/PortfolioDividendsChart'
import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import RiskMetricsPanel from '@/components/RiskMetricsPanel'
import RollingCagrChart from '@/components/RollingCagrChart'
import Trades from '@/components/Trades'
import AppBreadcrumbs from '@/components/ui/AppBreadcrumbs'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Asset, AssetAnalysis, Dividend } from '@/types'
import { Box, Chip, CircularProgress, Paper, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"

type TabKey = 'rentabilidade' | 'risco' | 'patrimonio' | 'posicao' | 'impacto' | 'trades' | 'fundamentos'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'rentabilidade', label: 'Rentabilidade' },
  { key: 'risco', label: 'Risco' },
  { key: 'patrimonio', label: 'Patrimônio' },
  { key: 'posicao', label: 'Construção de Posição' },
  { key: 'impacto', label: 'Impacto na Carteira' },
  { key: 'trades', label: 'Trades' },
  { key: 'fundamentos', label: 'Fundamentos' },
]

function EmptyTabContent({ label }: { label: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={400}
    >
      <Typography variant="subtitle1" color="text.secondary">
        {label} — em breve
      </Typography>
    </Box>
  )
}

export default function PortfolioAssetPage() {
  const { id } = useParams<{ id: string }>()
  const { selectedPortfolio } = usePortfolio()
  const [patrimonyEvolution, setPatrimonyEvolution] = useState<any[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [asset, setAsset] = useState<Asset>()
  const [analysis, setAnalysis] = useState<AssetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const { setTitle } = usePageTitle()
  const [activeTab, setActiveTab] = useState<TabKey>('rentabilidade')

  useEffect(() => {
    if (asset) {
      setTitle(`${asset.ticker} - ${asset.name}`)
    }
  }, [asset])

  // Reset loading state when id changes (asset navigation)
  useEffect(() => {
    setLoading(true)
    setAsset(undefined)
    setAnalysis(null)
  }, [id])

  useEffect(() => {
    const fetch = async () => {
      if (!selectedPortfolio || !id) return

      try {
        const [assetRes, patrimonyRes, dividendRes, analysisRes] = await Promise.all([
          api.get(`/portfolio/asset/details?portfolio_id=${selectedPortfolio.id}&asset_id=${id}`),
          api.get(`/portfolio/${selectedPortfolio.id}/patrimony_evolution?asset_id=${id}`),
          api.get(`/portfolio/dividends/${selectedPortfolio.id}/?asset_id=${id}`),
          api.get(`/portfolio/${selectedPortfolio.id}/asset/analysis?asset_id=${id}`).catch(() => null),
        ])
        setPatrimonyEvolution(patrimonyRes.data)
        setAsset(assetRes.data)
        setDividends(dividendRes.data)
        setAnalysis(analysisRes?.data ?? null)
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rentabilidade':
        return (
          <Box display="flex" flexDirection="column" gap={4}>
            {/* Performance metrics row */}
            {analysis && (
              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
                alignItems="center"
                sx={{
                  px: 1,
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: -2,
                }}
              >
                <Chip
                  label={`CAGR ${analysis.performance_metrics.cagr.toFixed(2)}%`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    color: analysis.performance_metrics.cagr >= 0 ? 'success.main' : 'error.main',
                    bgcolor: 'transparent',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                {Object.entries(analysis.performance_metrics.benchmarks_metrics).map(([name, bm]) => (
                  <Box key={name} display="flex" alignItems="center" gap={0.5}>
                    <Chip
                      label={`α ${name} ${bm.alpha >= 0 ? '+' : ''}${bm.alpha.toFixed(2)}%`}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: bm.alpha >= 0 ? 'success.main' : 'error.main',
                        bgcolor: 'transparent',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      β {bm.beta.toFixed(2)} · ρ {bm.correlation.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <PortfolioReturnsChart
              size={350}
              selectedAssets={[asset.ticker]}
              selectedBenchmark={'CDI'}
            />
            {analysis?.rolling_cagr && analysis.rolling_cagr.length > 0 && (
              <RollingCagrChart data={analysis.rolling_cagr} size={280} />
            )}
          </Box>
        )
      case 'risco':
        return analysis ? (
          <Box display="flex" flexDirection="column" gap={3}>
            <RiskMetricsPanel analysis={analysis} />
            <DrawdownChart
              series={analysis.risk_metrics.drawdown.series}
              stats={analysis.risk_metrics.drawdown.stats}
              size={300}
            />
          </Box>
        ) : (
          <EmptyTabContent label="Risco — dados não disponíveis" />
        )
      case 'patrimonio':
        return (
          <Box display="flex" flexDirection="column" gap={4}>
            <PortfolioPatrimonyChart
              patrimonyEvolution={patrimonyEvolution}
              selected={'portfolio'}
              size={350}
              hideContributions
            />
            <PortfolioDividendsChart dividends={dividends} selected={'portfolio'} size={300} />
          </Box>
        )
      case 'posicao':
        return <AssetAveragePriceChart size={450} assetId={parseInt(id!)} />
      case 'impacto':
        return <EmptyTabContent label="Impacto na Carteira" />
      case 'trades':
        return <Trades assetId={parseInt(id!)} />
      case 'fundamentos':
        return <EmptyTabContent label="Fundamentos" />
      default:
        return null
    }
  }

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

        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mt: 1 }}>
          <Box display="flex" sx={{ alignItems: 'stretch' }}>
            {/* Asset details panel */}
            <Box
              sx={{
                width: 400,
                minWidth: 320,
                flexShrink: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ position: 'sticky', top: 0 }}>
                <AssetDetailsCard asset={asset} embedded analysis={analysis} />
              </Box>
            </Box>

            {/* Right side: Tabs + Content */}
            <Box flex={1} minWidth={0} display="flex" flexDirection="column">
              {/* Tabs bar */}
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  minHeight: 42,
                  '& .MuiTabs-flexContainer': {
                    justifyContent: 'flex-end',
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 42,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    py: 0,
                  },
                }}
              >
                {TABS.map((tab) => (
                  <Tab key={tab.key} value={tab.key} label={tab.label} />
                ))}
              </Tabs>

              {/* Tab content */}
              <Box sx={{ p: 2, flex: 1 }}>
                {renderTabContent()}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
