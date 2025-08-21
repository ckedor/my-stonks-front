'use client'

import { PatrimonyEntry } from '@/types'
import { Box } from '@mui/material'
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

  const filtered = patrimonyEvolution.filter((entry) => Number.isFinite(entry[key] as number))

  const baseData = filtered.map((entry) => ({
    date: dayjs(entry.date).format('MM/YY'),
    rawDate: dayjs(entry.date),
    value: entry[key] as number,
  }))

  const projectedData = useMemo(() => {
    if (!projection || baseData.length === 0) return []

    const { rate, years, monthlyContribution = 0 } = projection
    const last = baseData[baseData.length - 1]
    const lastDate = last.rawDate
    let value = last.value

    const days = 365 * years
    const dailyRate = Math.pow(1 + rate, 1 / 365)

    const projectionPoints: { date: string; projection: number }[] = []

    for (let i = 1; i <= days; i++) {
      if (monthlyContribution > 0 && i % 30 === 0) {
        value += monthlyContribution
      }

      value *= dailyRate
      const futureDate = lastDate.add(i, 'day')
      projectionPoints.push({
        date: futureDate.format('MM/YY'),
        projection: value,
      })
    }

    return projectionPoints
  }, [projection, baseData])

  const mergedData = useMemo(() => {
    const baseMapped = baseData.map(({ date, value }) => ({
      date,
      value,
      projection: null,
    }))
    const projectionMapped = projectedData.map(({ date, projection }) => ({
      date,
      value: null,
      projection,
    }))
    return [...baseMapped, ...projectionMapped]
  }, [baseData, projectedData])

  return (
    <Box>
      <ResponsiveContainer width="100%" height={size}>
        <LineChart data={mergedData} margin={{ left: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="date" />
          <YAxis
            orientation="right"
            tickFormatter={(v) => `${v.toLocaleString('pt-BR')}`}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(value: number) =>
              `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            stroke="#1976d2"
            name="Histórico"
          />
          {projection && (
            <Line
              type="monotone"
              dataKey="projection"
              stroke="#888"
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
