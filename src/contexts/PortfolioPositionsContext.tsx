import api from '@/lib/api'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePortfolio } from './PortfolioContext'

export interface PositionEntry {
  asset_id: number
  ticker: string
  name: string
  category: string
  value: number
  type: string
  class: string
}

interface PortfolioPositionsContextType {
  positions: PositionEntry[]
  loading: boolean
}

const PortfolioPositionsContext = createContext({} as PortfolioPositionsContextType)

export const PortfolioPositionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedPortfolio, portfolioRefreshKey } = usePortfolio()
  const [positions, setPositions] = useState<PositionEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!selectedPortfolio) return
      setLoading(true)
      try {
        const { data } = await api.get(`/portfolio/${selectedPortfolio.id}/position`)
        setPositions(data)
      } catch (err) {
        console.error('Erro ao carregar posições:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [selectedPortfolio, portfolioRefreshKey])

  return (
    <PortfolioPositionsContext.Provider value={{ positions, loading }}>
      {children}
    </PortfolioPositionsContext.Provider>
  )
}

export const usePortfolioPositions = () => useContext(PortfolioPositionsContext)
