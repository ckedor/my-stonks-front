'use client'

import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { Box, FormControl, InputLabel, MenuItem, Select, Tab, Tabs } from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import AssetsAndRights from './AssetsAndRights'
import CommonOperationsTaxIncome from './CommonOperationsTaxIncome'
import DarfSummaryTable from './DarfSummaryTable'
import FIITaxIncome from './FIITaxIncome'

export default function TaxIncomePage() {
  const { selectedPortfolio } = usePortfolio()
  const { setTitle } = usePageTitle()
  const [fiscalYear, setFiscalYear] = useState(dayjs().year())
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    setTitle('Declaração de Imposto de Renda')
  }, [])

  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - i)

  if (!selectedPortfolio?.id) return null

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={4} mb={2}>
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(Number(e.target.value))}
            disableUnderline
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)} sx={{ mb: 3 }}>
        <Tab label="DARF" />
        <Tab label="Bens e Direitos" />
        <Tab label="Apuração FIIs" />
        <Tab label="Apuração Operações Comuns" />
      </Tabs>

      {tabIndex === 0 && (
        <DarfSummaryTable fiscalYear={fiscalYear} portfolioId={selectedPortfolio.id} />
      )}
      {tabIndex === 1 && (
        <AssetsAndRights fiscalYear={fiscalYear} portfolioId={selectedPortfolio.id} />
      )}
      {tabIndex === 2 && (
        <FIITaxIncome fiscalYear={fiscalYear} portfolioId={selectedPortfolio.id} />
      )}
      {tabIndex === 3 && (
        <CommonOperationsTaxIncome fiscalYear={fiscalYear} portfolioId={selectedPortfolio.id} />
      )}
    </Box>
  )
}
