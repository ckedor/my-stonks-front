'use client'

import api from '@/lib/api'
import { createContext, useContext, useEffect, useState } from 'react'
import { Portfolio, UserCategory } from '../types'

interface PortfolioContextType {
  portfolios: Portfolio[]
  selectedPortfolio: Portfolio | null
  setSelectedPortfolio: (p: Portfolio) => void
  loading: boolean
  userCategories: UserCategory[]
  refreshPortfolio: (selectedId?: number) => Promise<void>
}

const PortfolioContext = createContext({} as PortfolioContextType)

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, _setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)

  const setSelectedPortfolio = (p: Portfolio) => {
    console.log('[DEBUG] setSelectedPortfolio chamado com:', p)
    localStorage.setItem('selectedPortfolioId', String(p.id))
    _setSelectedPortfolio(p)
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get<Portfolio[]>('/portfolio/list')
        console.log('[DEBUG] Portfolios carregados:', data)
        setPortfolios(data)

        const storedId = localStorage.getItem('selectedPortfolioId')
        console.log('[DEBUG] storedId no localStorage:', storedId)
        const storedIdNum = storedId ? parseInt(storedId) : null
        const found = data.find((p) => p.id === storedIdNum)
        console.log('[DEBUG] Portfolio encontrado pelo storedId:', found)

        _setSelectedPortfolio(found ?? data[0] ?? null)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  const userCategories = selectedPortfolio?.custom_categories ?? []

  const refreshPortfolio = async (selectedId?: number) => {
    try {
      const { data } = await api.get<Portfolio[]>('/portfolio/list')
      setPortfolios(data)

      if (selectedId) {
        const updated = data.find((p) => p.id === selectedId)
        setSelectedPortfolio(updated ?? data[0] ?? null)
      } else if (selectedPortfolio) {
        const updated = data.find((p) => p.id === selectedPortfolio.id)
        setSelectedPortfolio(updated ?? data[0] ?? null)
      } else {
        setSelectedPortfolio(data[0] ?? null)
      }
    } catch (err) {
      console.error('Erro ao atualizar portfólio', err)
    }
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        selectedPortfolio,
        setSelectedPortfolio,
        loading,
        userCategories,
        refreshPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => useContext(PortfolioContext)
