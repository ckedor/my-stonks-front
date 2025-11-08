
import { usePortfolio } from '@/contexts/PortfolioContext'
import { PortfolioPositionEntry } from '@/types'
import { useMemo } from 'react'
import AppPieChart from '../../../components/ui/app-pie-chart'

interface PositionPieChartProps {
  positions: PortfolioPositionEntry[]
  selectedCategory: string
}

export default function PositionPieChart({ positions, selectedCategory }: PositionPieChartProps) {
  const { userCategories } = usePortfolio()

  const { data, colors } = useMemo(() => {
    if (!positions) return { data: [], colors: [] }

    if (selectedCategory === 'portfolio') {
      const grouped: Record<string, number> = {}

      for (const pos of positions) {
        const categoryName = pos.category ?? '(Sem Categoria)'
        if (!grouped[categoryName]) grouped[categoryName] = 0
        grouped[categoryName] += pos.value
      }

      const sortedData = Object.entries(grouped)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)

      const colorMap: Record<string, string> = {}
      for (const cat of userCategories) {
        colorMap[cat.name] = cat.color
      }

      const colors = sortedData
        .map((item) => colorMap[item.label])
        .filter((color): color is string => Boolean(color))

      return { data: sortedData, colors }
    } else {
      const filtered = positions
        .filter((pos) => pos.category === selectedCategory)
        .map((pos) => ({ label: pos.ticker, value: pos.value }))
        .sort((a, b) => b.value - a.value)

      return { data: filtered, colors: [] }
    }
  }, [positions, selectedCategory, userCategories])

  return <AppPieChart data={data} colors={colors} isCurrency height={400} />
}
