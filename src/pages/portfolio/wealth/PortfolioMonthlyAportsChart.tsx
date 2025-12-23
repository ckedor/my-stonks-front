import AppBarChart, { TimeSeriesPoint } from '@/components/charts/app-bar-chart/AppBarChart'
import { GroupBy } from '@/components/charts/app-bar-chart/helpers'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { DateRangeKey } from '@/lib/utils/date'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type PatrimonyEvolutionRow = {
  date: string
  [key: string]: unknown
}

interface Props {
  height?: number
  groupBy?: GroupBy
  defaultRange?: DateRangeKey
}

function toTimeSeries(
  rows: PatrimonyEvolutionRow[],
  sourceKey: string
): TimeSeriesPoint[] {
  return (rows ?? [])
    .filter((r) => r?.date)
    .map((r) => ({
      date: dayjs(r.date).format('YYYY-MM-DD'),
      value: Number((r as any)[sourceKey] ?? 0),
    }))
}

export default function PortfolioMonthlyAportsChart({
  height = 400,
  groupBy = 'month',
  defaultRange = '1y',
}: Props) {
  const { selectedPortfolio } = usePortfolio()

  const [rows, setRows] = useState<PatrimonyEvolutionRow[]>([])
  const [loading, setLoading] = useState(false)

  const sourceKey = 'aported'

  useEffect(() => {
    const portfolioId = selectedPortfolio?.id
    if (!portfolioId) {
      setRows([])
      setLoading(false)
      return
    }

    let alive = true

    const fetchData = async () => {
      setLoading(true)
      try {
        const resp = await api.get(`/portfolio/${portfolioId}/patrimony_evolution`)
        if (!alive) return
        setRows(resp.data ?? [])
      } catch (e) {
        if (!alive) return
        console.error(e)
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchData()

    return () => {
      alive = false
    }
  }, [selectedPortfolio?.id])

  const data = useMemo(() => toTimeSeries(rows, sourceKey), [rows])

  return (
    <AppBarChart
      data={data}
      loading={loading}
      height={height}
      title="Aportes Mensais"
      emptyMessage="Sem dados de aportes para exibir."
      colorMode="profit-loss"
      valueType="currency"
      currency="BRL"
      groupBy={groupBy}
      showRangePicker
      defaultRange={defaultRange}
      labelSide="right"
      showGroupBySelector
    />
  )
}
