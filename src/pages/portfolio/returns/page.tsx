
import PortfolioReturnsChart from '@/components/PortfolioReturnsChart'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { useEffect } from 'react'

export default function PortfolioReturnsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Rentabilidade Carteira')
  }, [])

  return <PortfolioReturnsChart size={750} selectedCategory={'portfolio'} selectedBenchmark="CDI" />
}
