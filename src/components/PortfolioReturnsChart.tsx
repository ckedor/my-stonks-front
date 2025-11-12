
import { usePortfolio } from '@/contexts/PortfolioContext'
import { usePortfolioReturns } from '@/contexts/PortfolioReturnsContext'
import { Box, Checkbox, CircularProgress, MenuItem, Select, Stack, Typography, useTheme } from '@mui/material'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

dayjs.extend(isSameOrAfter)

interface Props {
  size: number
  selectedCategory?: string
  selectedBenchmark?: string
  selectedAssets?: string[]
}



const mapDisplayName = (key: string) => (key === 'portfolio' ? 'Carteira' : key)
const mapOriginalKey = (label: string) => (label === 'Carteira' ? 'portfolio' : label)

export default function PortfolioReturnsChart({
  size,
  selectedCategory = 'Carteira',
  selectedBenchmark,
  selectedAssets = [],
}: Props) {
  const { categoryReturns, assetReturns, benchmarks, loading } = usePortfolioReturns()
  const { userCategories } = usePortfolio()
  
  const theme = useTheme()
  const gridColor = theme.palette.chart.grid
  const labelColor = theme.palette.chart.label

  const COLORS: Record<string, string> = {
    Carteira: theme.palette.primary.main,
    CDI: theme.palette.secondary.main,
    IFIX: '#00bc8c',
    'S&P500': '#e74c3c',
    IBOVESPA: '#A9A92A',
    IPCA: '#8e44ad',
    'USD/BRL': '#2980b9',
  }

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    mapOriginalKey(selectedCategory),
  ])
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(
    selectedBenchmark ? [selectedBenchmark] : []
  )

  useEffect(() => {
    setSelectedCategories([mapOriginalKey(selectedCategory)])
  }, [selectedCategory])

  useEffect(() => {
    setSelectedBenchmarks(selectedBenchmark ? [selectedBenchmark] : [])
  }, [selectedBenchmark])

  const [selectedAssetKeys, setSelectedAssetKeys] = useState<string[]>(selectedAssets)
  const [range, setRange] = useState('1y')

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    userCategories.forEach((cat) => {
      map[cat.name] = cat.color
    })
    return map
  }, [userCategories])

  const allDates = useMemo(() => {
    const all = Object.values(categoryReturns)
      .flat()
      .map((d) => d.date)
    return Array.from(new Set(all)).sort()
  }, [categoryReturns])

  const filteredDates = useMemo(() => {
    const today = dayjs()
    let from: dayjs.Dayjs
    switch (range) {
      case 'ytd':
        from = today.startOf('year')
        break
      case '1y':
        from = today.subtract(1, 'year')
        break
      case '2y':
        from = today.subtract(2, 'year')
        break
      case '3y':
        from = today.subtract(3, 'year')
        break
      case '4y':
        from = today.subtract(4, 'year')
        break
      case '5y':
        from = today.subtract(5, 'year')
        break
      case 'max':
      default:
        from = dayjs('1900-01-01')
    }
    return allDates.filter((date) => dayjs(date).isSameOrAfter(from))
  }, [allDates, range])

  const normalizeReturns = (series: { date: string; value: number }[], dates: string[]) => {
    const valuesMap = Object.fromEntries(series.map(({ date, value }) => [date, value]))
    const startDate = dates[0]
    const baseValue = valuesMap[startDate] ?? 0
    return dates.map((date) => ({ date, value: (valuesMap[date] ?? baseValue) - baseValue }))
  }

  const data = useMemo(() => {
    const map: Record<string, any> = {}
    filteredDates.forEach((date) => {
      map[date] = { date }
    })
    for (const cat of selectedCategories) {
      const series = normalizeReturns(categoryReturns[cat] || [], filteredDates)
      for (const { date, value } of series) {
        if (map[date]) map[date][cat] = value * 100
      }
    }
    for (const asset of selectedAssetKeys) {
      const series = normalizeReturns(assetReturns[asset] || [], filteredDates)
      for (const { date, value } of series) {
        if (map[date]) map[date][asset] = value * 100
      }
    }
    for (const bm of selectedBenchmarks) {
      const series = benchmarks[bm] || []
      const normalized = normalizeReturns(series, filteredDates)
      for (const { date, value } of normalized) {
        if (map[date]) map[date][bm] = value * 100
      }
    }
    return Object.values(map).sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
  }, [
    categoryReturns,
    assetReturns,
    benchmarks,
    selectedCategories,
    selectedAssetKeys,
    selectedBenchmarks,
    filteredDates,
  ])

  const allKeys = [...selectedCategories, ...selectedBenchmarks, ...selectedAssetKeys]
  const values = data.flatMap((d) => allKeys.map((k) => (typeof d[k] === 'number' ? d[k] : 0)))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1
  const upper = Math.ceil((max + padding) / 10) * 10
  const yTicks: number[] = []
  for (let i = 0; i <= upper; i += 10) yTicks.push(i)

  const currentYear = dayjs().year()
  const totalMonths = dayjs(allDates.at(-1)).diff(dayjs(allDates[0]), 'month')
  const totalYears = Math.floor(totalMonths / 12)
  const ranges = useMemo(() => {
    const base = [
      { label: 'Max', value: 'max' },
      { label: `${currentYear}`, value: 'ytd' },
    ]
    for (let y = 1; y <= 5; y++) {
      if (y <= totalYears) base.push({ label: `${y}Y`, value: `${y}y` })
    }
    return base
  }, [totalYears, currentYear])

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} mr={5}>
        <Box>
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => {
              const value = e.target.value
              setSelectedCategories(typeof value === 'string' ? value.split(',') : value)
            }}
            variant="standard"
            size="small"
            sx={{ minWidth: 50, ml: 1, fontSize: 14 }}
            renderValue={(selected) => selected.map(mapDisplayName).join(', ')}
          >
            {Object.keys(categoryReturns).map((cat) => (
              <MenuItem key={cat} value={cat}>
                <Checkbox checked={selectedCategories.includes(cat)} size="small" />
                <Typography variant="body2">{mapDisplayName(cat)}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Select
            multiple
            value={selectedBenchmarks}
            onChange={(e) => {
              const value = e.target.value
              setSelectedBenchmarks(typeof value === 'string' ? value.split(',') : value)
            }}
            variant="standard"
            size="small"
            sx={{ minWidth: 50, ml: 2, fontSize: 14 }}
            renderValue={(selected) => selected.join(', ')}
          >
            {Object.keys(benchmarks).map((key) => (
              <MenuItem key={key} value={key}>
                <Checkbox checked={selectedBenchmarks.includes(key)} size="small" />
                <Typography variant="body2">{key}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Select
            multiple
            value={selectedAssetKeys}
            onChange={(e) => {
              const value = e.target.value
              setSelectedAssetKeys(typeof value === 'string' ? value.split(',') : value)
            }}
            variant="standard"
            size="small"
            sx={{ minWidth: 50, ml: 2, fontSize: 14 }}
            renderValue={(selected) => selected.join(', ')}
          >
            {Object.keys(assetReturns).map((key) => (
              <MenuItem key={key} value={key}>
                <Checkbox checked={selectedAssetKeys.includes(key)} size="small" />
                <Typography variant="body2">{key}</Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Timeframes */}
        <Stack direction="row" spacing={1}>
          {ranges.map((r) => (
            <Typography
              key={r.value}
              onClick={() => setRange(r.value)}
              sx={{ cursor: 'pointer', fontWeight: range === r.value ? 700 : 400, fontSize: 13}}
            >
              {r.label}
            </Typography>
          ))}
        </Stack>
      </Stack>

      {loading ? (
        <Box height={size} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={size}>
          <ComposedChart data={data} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(v) => dayjs(v).format('MM/YY')} 
              stroke={labelColor} 
            />
            <YAxis
              orientation="right"
              domain={[min - padding, max + padding]}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              ticks={yTicks}
              stroke={labelColor}
            />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            {allKeys.map((key) => {
              const display = mapDisplayName(key)
              const stroke = categoryColorMap[display] || COLORS[display] || theme.palette.secondary.main
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  strokeWidth={2}
                  dot={false}
                  stroke={stroke}
                  name={display}
                />
              )
            })}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}
