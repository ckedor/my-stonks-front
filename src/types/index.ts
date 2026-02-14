export interface BenchmarkEntry {
  id: number
  name: string
  short_name: string
}

export interface UserCategory {
  id: number
  name: string
  color: string
  benchmark_id: number | null
  benchmark: BenchmarkEntry
}

export interface Portfolio {
  id: number
  name: string
  user_id: number
  custom_categories: UserCategory[]
  portfolio_id: number
}

export interface Trade {
  id: number
  asset_id: number
  date: Date
  ticker: string
  type: string
  quantity: number
  price: number
  value: number
  average_price: number
  broker: string
  broker_id: number
  realized_profit: number
  acc_quantity: number
  position: number
  profit_pct: number
  portfolio_id: number
  original_price: number
  currency: string
}

export interface ReturnsEntry {
  date: string
  value: number
}

export interface PortfolioPositionEntry {
  asset_id: number
  date: string
  ticker: string
  name: string
  quantity: number
  average_price: number
  profit_pct: number
  category: string
  value: number
  price: number
  acc_return: number
  twelve_months_return: number
  type: string
  class: string
}

export interface FIIPortfolioPositionEntry extends PortfolioPositionEntry {
  fii_type: string
  fii_segment: string
}

export interface StockPortfolioPositionEntry extends PortfolioPositionEntry {
  industry: string
  sector: string
}
export interface FixedIncomePositionEntry extends PortfolioPositionEntry {
  fixed_income_type: string
  treasury_bond_type: number
  treasury_bond_code: string
  fixed_income_maturity_date: string
  fixed_income_fee: number | null
  treasury_bond_maturity_date: string | null
  fixed_income_index_name: string | null
}

export interface Dividend {
  id: number
  asset_id: number
  date: Date
  ticker: string
  amount: number
  category: string
  portfolio_id: number
}

export interface PatrimonyEntry {
  date: string
  portfolio: number
  [key: string]: number | string | null
}

export interface Asset {
  id: number
  name: string
  ticker: string
  asset_type_id: number
  asset_type: {
    id: number
    name: string
    short_name: string
    asset_class: {
      id: number
      name: string
    }
  }
  quantity: number
  price: number
  average_price: number
  value: number
  acc_return: number | null
  twelve_months_return: number | null
  fixed_income?: {
    fee: number
    maturity_date: Date
    index?: { name: string }
    fixed_income_type?: { name: string }
  }
  fund?: {
    anbima_category: string
    anbima_code: string
  }
  currency: {
    id: number
    name: string
  }
}

// Rebalancing types
export interface AssetRebalancingEntry {
  asset_id: number
  ticker: string
  name: string
  category: string
  category_id: number
  current_value: number
  current_pct_in_category: number
  target_pct_in_category: number | null
  target_value: number | null
  diff_pct: number | null
  diff_value: number | null
}

export interface CategoryRebalancingEntry {
  category_id: number
  category_name: string
  color: string
  current_value: number
  current_pct: number
  target_pct: number | null
  target_value: number | null
  diff_pct: number | null
  diff_value: number | null
  assets: AssetRebalancingEntry[]
}

export interface RebalancingResponse {
  portfolio_id: number
  total_value: number
  categories: CategoryRebalancingEntry[]
}
