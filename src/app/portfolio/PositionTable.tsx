'use client'

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { ReturnsEntry } from '@/types'

interface Position {
  category: string
  value: number
}

interface ReturnsByCategory {
  [category: string]: ReturnsEntry[]
}

interface PositionTableProps {
  positions: Position[]
  returns: ReturnsByCategory
  onCategorySelect?: (category: string) => void
}

export default function PositionTable({
  positions,
  returns,
  onCategorySelect,
}: PositionTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('portfolio')

  const returnsMap = useMemo(() => {
    const result: Record<string, number> = {}
    const now = dayjs()
    const twelveMonthsAgo = now.subtract(12, 'month')

    for (const category in returns) {
      const series = returns[category] || []
      if (!series.length) continue

      const sorted = [...series].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      const latest = sorted.at(-1)
      const twelveBack = sorted.reduce((closest, curr) => {
        return Math.abs(dayjs(curr.date).diff(twelveMonthsAgo)) <
          Math.abs(dayjs(closest.date).diff(twelveMonthsAgo))
          ? curr
          : closest
      }, sorted[0])

      if (latest && twelveBack && twelveBack.value !== 0) {
        result[category] = (latest.value - twelveBack.value) * 100
      }
    }

    return result
  }, [returns])

  const data = useMemo(() => {
    const grouped: Record<string, number> = {}

    for (const pos of positions) {
      const categoryName = pos.category ?? '(Sem Categoria)'
      if (!grouped[categoryName]) grouped[categoryName] = 0
      grouped[categoryName] += pos.value
    }

    const total = Object.values(grouped).reduce((sum, v) => sum + v, 0)

    const rows = Object.entries(grouped)
      .map(([name, value]) => ({
        category: name,
        value,
        percentage: (value / total) * 100,
        return12m: returnsMap[name] ?? null,
      }))
      .sort((a, b) => b.value - a.value)

    return { rows, total, return12mPortfolio: returnsMap['portfolio'] ?? null }
  }, [positions, returnsMap])

  const cellSx = { py: 1.3, px: 1.8, fontSize: 15 }

  const handleClick = (category: string) => {
    setSelectedCategory(category)
    onCategorySelect?.(category)
  }

  const getColor = (value: number | null) => {
    if (value == null) return undefined
    if (value > 0) return '#2e7d32'
    if (value < 0) return '#c62828'
    return undefined
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={cellSx}>
                <strong>Categoria</strong>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <strong>Valor</strong>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <strong>Rent. 12m</strong>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <strong>% Total</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow
                key={row.category}
                hover
                onClick={() => handleClick(row.category)}
                selected={row.category === selectedCategory}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={cellSx}>{row.category}</TableCell>
                <TableCell sx={cellSx} align="right">
                  {`R$ ${row.value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                </TableCell>
                <TableCell sx={{ ...cellSx, color: getColor(row.return12m) }} align="right">
                  {row.return12m != null ? `${row.return12m.toFixed(2)} %` : '—'}
                </TableCell>
                <TableCell sx={cellSx} align="right">
                  {`${row.percentage.toFixed(2)} %`}
                </TableCell>
              </TableRow>
            ))}
            <TableRow
              hover
              onClick={() => handleClick('portfolio')}
              selected={selectedCategory === 'portfolio'}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={cellSx}>
                <strong>Total</strong>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <strong>
                  {`R$ ${data.total.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                </strong>
              </TableCell>
              <TableCell sx={{ ...cellSx, color: getColor(data.return12mPortfolio) }} align="right">
                <strong>
                  {data.return12mPortfolio != null
                    ? `${data.return12mPortfolio.toFixed(2)} %`
                    : '—'}
                </strong>
              </TableCell>
              <TableCell sx={cellSx} align="right">
                <strong>100.00 %</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
