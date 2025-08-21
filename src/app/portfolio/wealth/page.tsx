'use client'

import PortfolioPatrimonyChart from '@/components/PortfolioPatrimonyChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { PatrimonyEntry } from '@/types'
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

export default function PortfolioPatrimonyEvolution() {
  const { setTitle } = usePageTitle()
  const { selectedPortfolio, userCategories } = usePortfolio()

  const [patrimonyEvolution, setPatrimonyEvolution] = useState<PatrimonyEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string>('portfolio')
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)

  const [showProjection, setShowProjection] = useState(false)
  const [projectionRate, setProjectionRate] = useState(10)
  const [projectionYears, setProjectionYears] = useState(1)
  const [monthlyContribution, setMonthlyContribution] = useState(2000)

  useEffect(() => {
    setTitle('Evolução do Patrimônio')
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get(`/portfolio/${selectedPortfolio?.id}/patrimony_evolution`)
        setPatrimonyEvolution(response.data)
      } catch (err) {
        console.log(err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedPortfolio])

  const filteredData = useMemo(() => {
    if (!patrimonyEvolution) return []

    return patrimonyEvolution.filter((entry) => {
      const date = dayjs(entry.date)
      const afterStart = !startDate || date.isSameOrAfter(startDate, 'day')
      const beforeEnd = !endDate || date.isSameOrBefore(endDate, 'day')
      return afterStart && beforeEnd
    })
  }, [patrimonyEvolution, startDate, endDate])

  if (loading) {
    return (
      <Box height="80vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={64} thickness={4} />
      </Box>
    )
  }

  if (error || !patrimonyEvolution) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={3}
        ml={6}
        mb={3}
        pr={5}
        mr={2}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Box minWidth={180}>
            <Select
              fullWidth
              size="small"
              variant="standard"
              value={selectedCategory}
              onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
              sx={{
                outline: 'none',
                '&::before, &::after': { borderBottom: '1px solid #ccc' },
                '&:hover:not(.Mui-disabled):before': {
                  borderBottom: '2px solid #1976d2',
                },
              }}
            >
              <MenuItem value="portfolio">Carteira</MenuItem>
              {userCategories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <DatePicker
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'standard',
                sx: {
                  outline: 'none',
                  '& .MuiInput-root::before': { borderBottom: '1px solid #ccc' },
                  '& .MuiInput-root:hover::before': {
                    borderBottom: '2px solid #1976d2',
                  },
                },
              },
            }}
          />

          <DatePicker
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{
              textField: {
                size: 'small',
                variant: 'standard',
                sx: {
                  outline: 'none',
                  '& .MuiInput-root::before': { borderBottom: '1px solid #ccc' },
                  '& .MuiInput-root:hover::before': {
                    borderBottom: '2px solid #1976d2',
                  },
                },
              },
            }}
          />
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            pt: 1,
            border: '1px solid #ddd',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showProjection}
                  onChange={(e) => setShowProjection(e.target.checked)}
                />
              }
              label="Projeção"
            />

            <TextField
              label="Taxa (%)"
              type="number"
              value={projectionRate}
              onChange={(e) => setProjectionRate(Number(e.target.value))}
              variant="standard"
              size="small"
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              sx={{ width: 80 }}
            />

            <TextField
              label="Anos"
              type="number"
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              variant="standard"
              size="small"
              InputProps={{ inputProps: { min: 1, step: 1 } }}
              sx={{ width: 60 }}
            />

            <TextField
              label="Aporte"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              variant="standard"
              size="small"
              InputProps={{
                inputProps: { min: 0, step: 100 },
                startAdornment: <span style={{ marginRight: 4 }}>R$</span>,
              }}
              sx={{ width: 120 }}
            />
          </Stack>
        </Paper>
      </Stack>

      <PortfolioPatrimonyChart
        size={750}
        selected={selectedCategory}
        patrimonyEvolution={filteredData}
        projection={
          showProjection
            ? {
                rate: projectionRate / 100,
                years: projectionYears,
                monthlyContribution,
              }
            : undefined
        }
      />
    </Box>
  )
}
