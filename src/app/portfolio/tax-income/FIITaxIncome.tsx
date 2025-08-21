'use client'

import api from '@/lib/api'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

interface TaxReportItem {
  month: string // format YYYY-MM
  realized_profit: number
  accumulated_loss: number
  tax_due: number
}

interface Props {
  portfolioId: number
  fiscalYear: number
}

export default function FIITaxIncome({ portfolioId, fiscalYear }: Props) {
  const [data, setData] = useState<TaxReportItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await api.get(
          `/portfolio/${portfolioId}/income_tax/variable_income/fiis_operations`,
          {
            params: { fiscal_year: fiscalYear },
          }
        )
        setData(res.data)
      } catch (err) {
        console.error('Erro ao buscar dados de IR para FIIs', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [portfolioId, fiscalYear])

  if (loading) return null

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Apuração de Ganhos - FIIs ({fiscalYear})
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mês</TableCell>
              <TableCell align="right">Lucro Realizado</TableCell>
              <TableCell align="right">Prejuízo Acumulado</TableCell>
              <TableCell align="right">IR Devido</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.month}>
                <TableCell>{dayjs(item.month).format('MMM/YYYY')}</TableCell>
                <TableCell align="right">
                  {item.realized_profit.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell align="right">
                  {item.accumulated_loss.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableCell>
                <TableCell align="right">
                  {item.tax_due.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
