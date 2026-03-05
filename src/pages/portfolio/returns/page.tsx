// src/pages/PortfolioReturnsPage.tsx
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolioAnalysis } from '@/contexts/PortfolioAnalysisContext'
import { usePortfolioReturns } from '@/contexts/PortfolioReturnsContext'
import { Box, Chip, CircularProgress, Grid, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import PortfolioMonthlyHeatmap from './PortfolioMonthlyHeatmap'
import PortfolioMonthlyReturnsChart from './PortfolioMonthlyReturnsChart'
import PortfolioRolling12mChart from './PortfolioRolling12mChart'

interface SeriesPoint {
  date: string
  value: number
}

export default function PortfolioReturnsPage() {
  const { setTitle } = usePageTitle()
  const { categoryReturns, loading } = usePortfolioReturns()
  const { analysis } = usePortfolioAnalysis()

  const [range, setRange] = useState<string>('max')

  useEffect(() => {
    setTitle('Rentabilidade Carteira')
  }, [setTitle])

  // Busca os dados do portfolio
  const portfolioData: SeriesPoint[] = useMemo(() => {
    return (categoryReturns['portfolio'] || []).slice()
  }, [categoryReturns])

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 1, pt: 2 }}>
      <Grid container spacing={2}>
        {/* Performance metrics row */}
        {analysis && (
          <Grid size={12}>
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
          </Grid>
        )}

        {/* Linha 1 - Gráfico principal full width */}
        <Grid size={12}>
            <PortfolioReturnsChart
              size={520}
              selectedCategory="portfolio"
              selectedBenchmark="CDI"
              defaultRange={range}
              onRangeChange={setRange}
            />
        </Grid>

        {/* Linha 2 - Heatmap full width */}
        <Grid size={12}>
            <PortfolioMonthlyHeatmap 
              data={portfolioData} 
            />
        </Grid>

        {/* Linha 3 - 2 gráficos lado a lado */}
        <Grid size={{ xs: 12, md: 6 }}>
            <PortfolioMonthlyReturnsChart
              height={300}
              defaultRange={range}
              data={portfolioData}
            />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <PortfolioRolling12mChart
              height={300}
              data={portfolioData}
            />
        </Grid>
      </Grid>
    </Box>
  )
}
