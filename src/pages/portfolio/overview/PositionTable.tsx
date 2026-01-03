import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
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

  const theme = useTheme()
  const dangerColor = theme.palette.error.main
  const successColor = theme.palette.success.main

  const { returns12mMap, accMap } = useMemo(() => {
    const returns12mMap: Record<string, number> = {}
    const accMap: Record<string, number> = {}

    const now = dayjs()
    const twelveMonthsAgo = now.subtract(12, 'month')

    for (const category in returns) {
      const series = returns[category] || []
      if (!series.length) continue

      const sorted = [...series].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
      const latest = sorted.at(-1)

      // Acumulado desde o começo (a série já é cumprod - 1)
      if (latest) {
        accMap[category] = latest.value * 100
      }

      // 12m (por fatores, não por diferença)
      const twelveBack = sorted.reduce((closest, curr) => {
        return Math.abs(dayjs(curr.date).diff(twelveMonthsAgo)) <
          Math.abs(dayjs(closest.date).diff(twelveMonthsAgo))
          ? curr
          : closest
      }, sorted[0])

      if (latest && twelveBack) {
        const a = 1 + latest.value
        const b = 1 + twelveBack.value
        if (b > 0) returns12mMap[category] = ((a / b) - 1) * 100
      }
    }

    return { returns12mMap, accMap }
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
        percentage: total ? (value / total) * 100 : 0,
        returnAcc: accMap[name] ?? null,
        return12m: returns12mMap[name] ?? null,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      rows,
      total,
      returnAccPortfolio: accMap['portfolio'] ?? null,
      return12mPortfolio: returns12mMap['portfolio'] ?? null,
    }
  }, [positions, accMap, returns12mMap])

  const cellSx = { py: 1.3, px: 1.8, fontSize: 15 }

  const handleClick = (category: string) => {
    setSelectedCategory(category)
    onCategorySelect?.(category)
  }

  const getColor = (value: number | null) => {
    if (value == null) return undefined
    if (value > 0) return successColor
    if (value < 0) return dangerColor
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

              {/* NOVA COLUNA */}
              <TableCell sx={cellSx} align="right">
                <strong>Rent. acum.</strong>
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

                {/* NOVA COLUNA */}
                <TableCell sx={{ ...cellSx, color: getColor(row.returnAcc) }} align="right">
                  {row.returnAcc != null ? `${row.returnAcc.toFixed(2)} %` : '—'}
                </TableCell>

                <TableCell sx={{ ...cellSx, color: getColor(row.return12m) }} align="right">
                  {row.return12m != null ? `${row.return12m.toFixed(2)} %` : '—'}
                </TableCell>

                <TableCell sx={cellSx} align="right">
                  {`${row.percentage.toFixed(2)} %`}
                </TableCell>
              </TableRow>
            ))}

            {/* Total */}
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

              {/* NOVA COLUNA */}
              <TableCell sx={{ ...cellSx, color: getColor(data.returnAccPortfolio) }} align="right">
                <strong>
                  {data.returnAccPortfolio != null ? `${data.returnAccPortfolio.toFixed(2)} %` : '—'}
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
