'use client'

import { Dividend } from '@/types'
import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  dividends: Dividend[]
  selected: string
  size?: number
}

export default function PortfolioDividendsChart({ dividends, selected, size = 370 }: Props) {
  const grouped = dividends.reduce<Record<string, number>>((acc, curr) => {
    if (selected !== 'portfolio' && curr.category !== selected) {
      return acc
    }

    const monthKey = dayjs(curr.date).format('MM/YY')
    acc[monthKey] = (acc[monthKey] || 0) + curr.amount
    return acc
  }, {})

  const data = Object.entries(grouped).map(([date, value]) => ({ date, value })) || [
    { date: '', value: 0 },
  ]

  const values = data.map((d) => d.value)
  const max = Math.max(...values)
  const upper = Math.ceil((max || 1) * 1.5)
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0

  const yTicks: number[] = []
  const tickStep = 50
  for (let i = 0; i <= upper; i += tickStep) {
    yTicks.push(i)
  }

  return (
    <Box position="relative" height={size}>
      {data.length === 0 && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Ativo não recebeu dividendos no período
          </Typography>
        </Box>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="date" />
          <YAxis
            orientation="right"
            domain={[0, upper]}
            ticks={yTicks}
            tickFormatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(value: number) =>
              `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
            }
          />
          <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
          <ReferenceLine y={avg} stroke="#333" strokeDasharray="5 5" strokeWidth={1.5} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}
