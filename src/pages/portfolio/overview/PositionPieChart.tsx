
import { usePortfolio } from '@/contexts/PortfolioContext'
import { PortfolioPositionEntry } from '@/types'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppPieChart from '../../../components/ui/app-pie-chart'

interface PositionPieChartProps {
  positions: PortfolioPositionEntry[]
  selectedCategory: string
}

export default function PositionPieChart({ positions, selectedCategory }: PositionPieChartProps) {
  const { userCategories } = usePortfolio()
  const navigate = useNavigate()

  const { data, colors, assetIdMap } = useMemo((): { data: Array<{ label: string; value: number }>; colors: string[]; assetIdMap: Record<string, number> } => {
    if (!positions) return { data: [], colors: [], assetIdMap: {} }

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

      return { data: sortedData, colors, assetIdMap: {} }
    } else {
      const filtered = positions
        .filter((pos) => pos.category === selectedCategory)
        .map((pos) => ({ label: pos.ticker, value: pos.value }))
        .sort((a, b) => b.value - a.value)

      // Build ticker -> asset_id map
      const idMap: Record<string, number> = {}
      for (const pos of positions) {
        if (pos.category === selectedCategory && pos.asset_id) {
          idMap[pos.ticker] = pos.asset_id
        }
      }

      return { data: filtered, colors: [], assetIdMap: idMap }
    }
  }, [positions, selectedCategory, userCategories])

  const handleItemClick = (label: string) => {
    const assetId = assetIdMap[label]
    if (assetId) {
      navigate(`/portfolio/asset/${assetId}`)
    }
  }

  return (
    <AppPieChart
      data={data}
      colors={colors}
      isCurrency
      height={350}
      onItemClick={selectedCategory !== 'portfolio' ? handleItemClick : undefined}
    />
  )
}
