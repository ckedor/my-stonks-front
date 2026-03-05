import api from '@/lib/api'
import { AssetAnalysis } from '@/types'
import { createContext, useContext, useEffect, useState } from 'react'
import { usePortfolio } from './PortfolioContext'

interface PortfolioAnalysisContextType {
  analysis: AssetAnalysis | null
  loading: boolean
}

const PortfolioAnalysisContext = createContext<PortfolioAnalysisContextType>({
  analysis: null,
  loading: true,
})

export function PortfolioAnalysisProvider({ children }: { children: React.ReactNode }) {
  const { selectedPortfolio } = usePortfolio()
  const [analysis, setAnalysis] = useState<AssetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedPortfolio) return
      setLoading(true)
      try {
        const res = await api.get(`/portfolio/${selectedPortfolio.id}/analysis`)
        setAnalysis(res.data)
      } catch {
        setAnalysis(null)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [selectedPortfolio])

  return (
    <PortfolioAnalysisContext.Provider value={{ analysis, loading }}>
      {children}
    </PortfolioAnalysisContext.Provider>
  )
}

export function usePortfolioAnalysis() {
  return useContext(PortfolioAnalysisContext)
}
