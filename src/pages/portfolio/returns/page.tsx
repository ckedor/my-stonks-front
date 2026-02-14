// src/pages/PortfolioReturnsPage.tsx
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolioReturns } from '@/contexts/PortfolioReturnsContext'
import { Box, CircularProgress, Grid } from '@mui/material'
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
