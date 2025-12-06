// src/pages/PortfolioReturnsPage.tsx
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { Box, Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import PortfolioMonthlyHeatmap from './PortfolioMonthlyHeatmap'
import PortfolioMonthlyReturnsChart from './PortfolioMonthlyReturnsChart'
import PortfolioRolling12mChart from './PortfolioRolling12mChart'

type CurveKind = 'category' | 'benchmark' | 'asset'

interface SelectedCurve {
  kind: CurveKind
  key: string
}

export default function PortfolioReturnsPage() {
  const { setTitle } = usePageTitle()

  const [range, setRange] = useState<string>('max')
  const [selectedCurve, setSelectedCurve] = useState<SelectedCurve>({
    kind: 'category',
    key: 'portfolio',
  })

  useEffect(() => {
    setTitle('Rentabilidade Carteira')
  }, [setTitle])

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        {/* Linha 1 - Gráfico principal full width */}
        <Grid size={12}>
            <PortfolioReturnsChart
              size={520}
              selectedCategory="portfolio"
              selectedBenchmark="CDI"
              defaultRange={range}
              onRangeChange={setRange}
              onCurveChange={setSelectedCurve}
            />
        </Grid>

        {/* Linha 2 - Heatmap full width */}
        <Grid size={12}>
            <PortfolioMonthlyHeatmap curve={selectedCurve} />
        </Grid>

        {/* Linha 3 - 2 gráficos lado a lado */}
        <Grid size={{ xs: 12, md: 6 }}>
            <PortfolioMonthlyReturnsChart
              height={300}
              defaultRange={range}
              curve={selectedCurve}
            />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
            <PortfolioRolling12mChart
              height={300}
              curve={selectedCurve}
            />
        </Grid>
      </Grid>
    </Box>
  )
}
