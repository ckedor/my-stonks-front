import DrawdownChart from '@/components/DrawdownChart'
import RiskMetricsPanel from '@/components/RiskMetricsPanel'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolioAnalysis } from '@/contexts/PortfolioAnalysisContext'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useEffect } from 'react'

export default function PortfolioRiskPage() {
  const { setTitle } = usePageTitle()
  const { analysis, loading } = usePortfolioAnalysis()

  useEffect(() => {
    setTitle('Risco')
  }, [setTitle])

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={64} thickness={4} />
      </Box>
    )
  }

  if (!analysis) {
    return (
      <Box p={4}>
        <Typography color="text.secondary">
          Dados de análise não disponíveis para esta carteira.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 1, pt: 2 }}>
      <Box display="flex" flexDirection="column" gap={3}>
        <RiskMetricsPanel analysis={analysis} />
        <DrawdownChart
          series={analysis.risk_metrics.drawdown.series}
          stats={analysis.risk_metrics.drawdown.stats}
          size={350}
        />
      </Box>
    </Box>
  )
}
