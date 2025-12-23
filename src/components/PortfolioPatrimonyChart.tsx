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
  const aportedColor = theme.palette.secondary.main

  const showAported = key === 'portfolio'

  // Filtra apenas valores numéricos para a linha principal
  const filtered = patrimonyEvolution.filter((entry) =>
    Number.isFinite(entry[key] as number),
  )

  // Base histórica formatada (aportes já vêm prontos da API)
  const baseData = filtered.map((entry) => {
    const raw = dayjs(entry.date)

    const aportedValue =
      showAported &&
      typeof (entry as any).acc_aported === 'number' &&
      Number.isFinite((entry as any).acc_aported)
        ? ((entry as any).acc_aported as number)
        : null

    return {
      ts: raw.valueOf(), // timestamp para eixo temporal
      rawDate: raw, // dayjs para cálculos/tooltip
      dateLabel: raw.format('MM/YY'),
      value: entry[key] as number,
      acc_aported: aportedValue,
    }
  })

  // PROJEÇÃO:
  // - principal = último valor da carteira rendendo à taxa "rate"
  // - futureContrib = aportes mensais somados sem juros
  // - projection = principal + futureContrib
  // - aportedProjection = último aported histórico + futureContrib (SEM juros)
  const projectedData = useMemo(() => {
    if (!projection || baseData.length === 0) return []

    const { rate, years, monthlyContribution = 0 } = projection
    const last = baseData[baseData.length - 1]

    let principal = last.value
    let futureContrib = 0

    const days = 365 * years
    const dailyRate = Math.pow(1 + rate, 1 / 365)

    const lastAportedBase =
      showAported && typeof last.acc_aported === 'number' && Number.isFinite(last.acc_aported)
        ? (last.acc_aported as number)
        : 0

    const points: {
      ts: number
      rawDate: dayjs.Dayjs
      dateLabel: string
      projection: number
      aportedProjection: number
    }[] = []

    for (let i = 1; i <= days; i++) {
      // principal rende juros diariamente
      principal *= dailyRate

      // a cada ~30 dias, soma um aporte SEM juros
      if (monthlyContribution > 0 && i % 30 === 0) {
        futureContrib += monthlyContribution
      }

      const futureDate = last.rawDate.add(i, 'day')
      const aportedProjection = lastAportedBase + futureContrib

      points.push({
        ts: futureDate.valueOf(),
        rawDate: futureDate,
        dateLabel: futureDate.format('MM/YY'),
        projection: principal + futureContrib,
        aportedProjection,
      })
    }

    return points
  }, [projection, baseData, showAported])

  // Junta histórico e projeção
  const mergedData = useMemo(() => {
    const baseMapped = baseData.map(
      ({ ts, rawDate, dateLabel, value, acc_aported }) => ({
        ts,
        rawDate,
        dateLabel,
        value,
        acc_aported,
        projection: null as number | null,
        aportedProjection: null as number | null,
      }),
    )
    const projectionMapped = projectedData.map(
      ({ ts, rawDate, dateLabel, projection, aportedProjection }) => ({
        ts,
        rawDate,
        dateLabel,
        value: null as number | null,
        acc_aported: null as number | null,
        projection,
        aportedProjection,
      }),
    )
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
      if (typeof d.acc_aported === 'number' && Number.isFinite(d.acc_aported)) {
        if (d.acc_aported > maxVal) maxVal = d.acc_aported
      }
      if (
        typeof d.aportedProjection === 'number' &&
        Number.isFinite(d.aportedProjection)
      ) {
        if (d.aportedProjection > maxVal) maxVal = d.aportedProjection
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
              `R$ ${value.toLocaleString('pt-BR', {
                maximumFractionDigits: 0,
              })}`
            }
          />

          {/* Linha histórica principal */}
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            stroke={lineColor}
            name="Histórico"
          />

          {/* Aportes históricos (API) – só para Carteira */}
          {showAported && (
            <Line
              type="monotone"
              dataKey="acc_aported"
              strokeWidth={2}
              dot={false}
              stroke={aportedColor}
              name="Aportes"
            />
          )}

          {/* Projeção: principal rendendo + aportes sem juros */}
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

          {/* Projeção dos aportes (estendendo a linha vermelha) */}
          {projection && showAported && (
            <Line
              type="monotone"
              dataKey="aportedProjection"
              strokeWidth={2}
              dot={false}
              stroke={aportedColor}
              strokeDasharray="5 5"
              name="Aportes projetados"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
