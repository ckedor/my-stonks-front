// app/portfolio/[portfolio_id]/assets/page.tsx

import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import AssetListTable from './AssetList'
import PortfolioHeatMap from './PortfolioHeatMap'

export default function PortfolioAssetsPage() {
  const { selectedPortfolio } = usePortfolio()
  const { setTitle } = usePageTitle()
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState(0)
  const [groupBy, setGroupBy] = useState<'category' | 'asset' | 'type' | 'class' | 'broker'>('category')

  useEffect(() => {
    setTitle('Ativos em Carteira')
  }, [setTitle])

  useEffect(() => {
    const fetchPositions = async () => {
      if (!selectedPortfolio) return
      setLoading(true)
      setError(false)
      try {
        const endpoint = groupBy === 'broker'
          ? `/portfolio/${selectedPortfolio.id}/position?group_by_broker=true`
          : `/portfolio/${selectedPortfolio.id}/position`
        const { data } = await api.get(endpoint)
        setPositions(data) 
      } catch (err) {
        console.error('Erro ao buscar posições:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [selectedPortfolio, groupBy])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue)
  }

  return (
    <Box pt={2}>
      <Tabs value={tab} onChange={handleTabChange} centered variant="standard" sx={{ mb: 3 }}>
        <Tab label="Tabela" />
        <Tab label="Heatmap" />
      </Tabs>

      {loading ? (
        <Box height="70vh" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={48} thickness={4} />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          Erro ao carregar posições. Tente novamente mais tarde.
        </Typography>
      ) : (
        <>
          {tab === 0 && <AssetListTable positions={positions} groupBy={groupBy} onGroupByChange={setGroupBy} />}
          {tab === 1 && <PortfolioHeatMap positions={positions} />}
        </>
      )}
    </Box>
  )
}
