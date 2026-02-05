import { createContext, useCallback, useContext, useState } from 'react'

interface TradeFormAsset {
  id: number
  ticker: string
  name: string
  asset_type_id: number
}

interface TradeFormContextType {
  isOpen: boolean
  preSelectedAsset: TradeFormAsset | null
  openTradeForm: (asset?: TradeFormAsset | null) => void
  closeTradeForm: () => void
}

const TradeFormContext = createContext<TradeFormContextType>({
  isOpen: false,
  preSelectedAsset: null,
  openTradeForm: () => {},
  closeTradeForm: () => {},
})

export function TradeFormProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [preSelectedAsset, setPreSelectedAsset] = useState<TradeFormAsset | null>(null)

  const openTradeForm = useCallback((asset?: TradeFormAsset | null) => {
    setPreSelectedAsset(asset ?? null)
    setIsOpen(true)
  }, [])

  const closeTradeForm = useCallback(() => {
    setIsOpen(false)
    setPreSelectedAsset(null)
  }, [])

  return (
    <TradeFormContext.Provider
      value={{
        isOpen,
        preSelectedAsset,
        openTradeForm,
        closeTradeForm,
      }}
    >
      {children}
    </TradeFormContext.Provider>
  )
}

export const useTradeForm = () => useContext(TradeFormContext)
