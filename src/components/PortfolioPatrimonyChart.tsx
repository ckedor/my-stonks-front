import { PatrimonyEntry } from '@/types'
import { Box, useTheme } from '@mui/material'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  patrimonyEvolution: PatrimonyEntry[]
  selected: string
  size: number
  projection?: {
    rate: number
    years: number
    monthlyContribution?: number
  }
}

export default function PortfolioPatrimonyChart({
  patrimonyEvolution,
  selected,
  size,
  projection,
}: Props) {
  const key = selected === 'Carteira' ? 'portfolio' : selected

  const theme = useTheme()
  const gridColor = theme.palette.chart.grid
  const labelColor = theme.palette.chart.label
  const lineColor = theme.palette.primary.main

  // Filtra apenas valores numéricos
  const filtered = patrimonyEvolution.filter((entry) => Number.isFinite(entry[key] as number))

  // Base histórica formatada
  const baseData = filtered.map((entry) => {
    const raw = dayjs(entry.date)
    return {
      ts: raw.valueOf(),           // timestamp para eixo temporal
      rawDate: raw,                // dayjs para cálculos/tooltip
      dateLabel: raw.format('MM/YY'),
      value: entry[key] as number,
    }
  })

  // Calcula projeção futura (opcional)
  const projectedData = useMemo(() => {
    if (!projection || baseData.length === 0) return []

    const { rate, years, monthlyContribution = 0 } = projection
    const last = baseData[baseData.length - 1]
    let value = last.value

    const days = 365 * years
    const dailyRate = Math.pow(1 + rate, 1 / 365)
    const points: { ts: number; rawDate: dayjs.Dayjs; dateLabel: string; projection: number }[] = []

    for (let i = 1; i <= days; i++) {
      if (monthlyContribution > 0 && i % 30 === 0) value += monthlyContribution
      value *= dailyRate

      const futureDate = last.rawDate.add(i, 'day')
      points.push({
        ts: futureDate.valueOf(),
        rawDate: futureDate,
        dateLabel: futureDate.format('MM/YY'),
        projection: value,
      })
    }
    return points
  }, [projection, baseData])

  // Junta histórico e projeção
  const mergedData = useMemo(() => {
    const baseMapped = baseData.map(({ ts, rawDate, dateLabel, value }) => ({
      ts,
      rawDate,
      dateLabel,
      value,
      projection: null as number | null,
    }))
    const projectionMapped = projectedData.map(({ ts, rawDate, dateLabel, projection }) => ({
      ts,
      rawDate,
      dateLabel,
      value: null as number | null,
      projection,
    }))
    return [...baseMapped, ...projectionMapped]
  }, [baseData, projectedData])

  const dynamicYMax = useMemo(() => {
  if (mergedData.length === 0) return 0
  let maxVal = 0
  for (const d of mergedData) {
    if (typeof d.value === 'number' && Number.isFinite(d.value)) {
      if (d.value > maxVal) maxVal = d.value
    }
    if (typeof d.projection === 'number' && Number.isFinite(d.projection)) {
      if (d.projection > maxVal) maxVal = d.projection
    }
  }
  const raw = maxVal * 1.1
    return Math.ceil(raw / 50000) * 50000
  }, [mergedData])

  const yTicks = useMemo(() => {
    const max = Math.max(50000, dynamicYMax)
    const steps = Math.floor(max / 50000)
    return Array.from({ length: steps + 1 }, (_, i) => i * 50000)
  }, [dynamicYMax])

  const yDomain: [number, number] = [0, dynamicYMax]

  const januaryTicks = useMemo(() => {
    if (mergedData.length === 0) return []

    const minTs = mergedData[0].ts
    const maxTs = mergedData[mergedData.length - 1].ts

    let cursor = dayjs(minTs).startOf('year').month(0).date(1)
    if (cursor.valueOf() < minTs) cursor = cursor.add(1, 'year')

    const ticks: number[] = []
    while (cursor.valueOf() <= maxTs) {
      ticks.push(cursor.valueOf())
      cursor = cursor.add(1, 'year')
    }
    return ticks
  }, [mergedData])

  return (
    <Box>
      <ResponsiveContainer width="100%" height={size}>
        <LineChart data={mergedData} margin={{ left: 48, top: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            ticks={januaryTicks}
            tickFormatter={(v) => dayjs(v).format('MM/YY')}
            stroke={labelColor}
            tick={{ fill: labelColor, fontSize: 13 }}
          />

          <YAxis
            orientation="right"
            stroke={labelColor}
            tick={{ fill: labelColor, fontSize: 12 }}
            tickFormatter={(v) => `${v / 1000}K`}
            ticks={yTicks}
            domain={yDomain}
          />

          <Tooltip
            labelFormatter={(v) => dayjs(v as number).format('DD/MM/YY')}
            formatter={(value: number) =>
              `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
            }
          />

          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            stroke={lineColor}
            name="Histórico"
          />

          {projection && (
            <Line
              type="monotone"
              dataKey="projection"
              stroke={lineColor}
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name={`Projeção ${Math.round(projection.rate * 100)}% a.a.`}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
