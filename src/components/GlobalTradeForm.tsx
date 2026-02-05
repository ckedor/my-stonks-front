import { usePortfolio } from '@/contexts/PortfolioContext'
import { useTradeForm } from '@/contexts/TradeFormContext'
import TradeForm from './TradeForm'

export default function GlobalTradeForm() {
  const { isOpen, preSelectedAsset, closeTradeForm } = useTradeForm()
  const { triggerPortfolioRefresh } = usePortfolio()

  const handleSave = () => {
    triggerPortfolioRefresh()
  }

  return (
    <TradeForm
      open={isOpen}
      onClose={closeTradeForm}
      onSave={handleSave}
      initialAsset={preSelectedAsset}
    />
  )
}
