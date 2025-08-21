'use client'

import api from '@/lib/api'
import { createContext, useContext, useEffect, useState } from 'react'
import { ReturnsEntry } from '../types'
import { usePortfolio } from './PortfolioContext'

interface PortfolioReturnsContextProps {
  categoryReturns: Record<string, ReturnsEntry[]>
  assetReturns: Record<string, ReturnsEntry[]>
  benchmarks: Record<string, ReturnsEntry[]>
  loading: boolean
}

const PortfolioReturnsContext = createContext<PortfolioReturnsContextProps>({
  categoryReturns: {},
  assetReturns: {},
  benchmarks: {},
  loading: true,
})

export const PortfolioReturnsProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedPortfolio } = usePortfolio()
  const [categoryReturns, setCategoryReturns] = useState<Record<string, ReturnsEntry[]>>({})
  const [assetReturns, setAssetReturns] = useState<Record<string, ReturnsEntry[]>>({})
  const [benchmarks, setBenchmarks] = useState<Record<string, ReturnsEntry[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedPortfolio?.id) return
      setLoading(true)
      const [r, b] = await Promise.all([
        api.get(`/portfolio/${selectedPortfolio.id}/returns`),
        api.get(`/market_data/indexes/time_series`),
      ])
      setCategoryReturns(r.data.categories)
      setAssetReturns(r.data.assets)
      setBenchmarks(b.data)
      setLoading(false)
    }

    fetchData()
  }, [selectedPortfolio?.id])

  return (
    <PortfolioReturnsContext.Provider
      value={{ categoryReturns, assetReturns, benchmarks, loading }}
    >
      {children}
    </PortfolioReturnsContext.Provider>
  )
}

export const usePortfolioReturns = () => useContext(PortfolioReturnsContext)
