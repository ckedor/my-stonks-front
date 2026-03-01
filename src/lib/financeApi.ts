import api from '@/lib/api'

// ── Types ──────────────────────────────────────────────────────

export interface FinanceSubcategory {
  id: number
  name: string
  category_id: number
  goal_amount?: number | null
}

export interface FinanceCategory {
  id: number
  name: string
  subcategories: FinanceSubcategory[]
}

export interface SubcategoryWithCategory {
  id: number
  name: string
  category_id: number
  goal_amount?: number | null
  category: { id: number; name: string }
}

export interface FinanceExpense {
  id: number
  amount: number
  date: string
  description: string | null
  subcategory_id: number
  subcategory: SubcategoryWithCategory
}

export interface FinanceIncome {
  id: number
  amount: number
  date: string
  description: string
}

export interface MonthlySummary {
  month: number
  total_income: number
  total_expense: number
}

export interface CategoryExpense {
  category: string
  total: number
}

export interface SubcategoryExpense {
  subcategory: string
  category: string
  total: number
}

export interface MonthlyBreakdown {
  by_category: CategoryExpense[]
  by_subcategory: SubcategoryExpense[]
}

export interface SubcategoryGoalProgress {
  subcategory_id: number
  subcategory_name: string
  category_id: number
  category_name: string
  goal_amount: number
  spent_amount: number
  remaining_amount: number
  progress_percent: number
  per_day_available: number
  days_remaining: number
  is_over_goal: boolean
}

// ── API calls ──────────────────────────────────────────────────

// Categories
export const fetchCategories = () =>
  api.get<FinanceCategory[]>('/finances/categories').then((r) => r.data)

export const createCategory = (name: string) =>
  api.post<FinanceCategory>('/finances/categories', { name }).then((r) => r.data)

export const updateCategory = (id: number, name: string) =>
  api.put<FinanceCategory>(`/finances/categories/${id}`, { name }).then((r) => r.data)

export const deleteCategory = (id: number) =>
  api.delete(`/finances/categories/${id}`)

// Subcategories
export const createSubcategory = (name: string, category_id: number) =>
  api.post<FinanceSubcategory>('/finances/subcategories', { name, category_id }).then((r) => r.data)

export const updateSubcategory = (id: number, name: string, category_id?: number) =>
  api.put<FinanceSubcategory>(`/finances/subcategories/${id}`, { name, category_id }).then((r) => r.data)

export const deleteSubcategory = (id: number) =>
  api.delete(`/finances/subcategories/${id}`)

export const updateSubcategoryGoal = (id: number, goal_amount: number | null) =>
  api.put<FinanceSubcategory>(`/finances/subcategories/${id}/goal`, { goal_amount }).then((r) => r.data)

// Expenses
export const fetchExpenses = (year: number, month: number) =>
  api.get<FinanceExpense[]>('/finances/expenses', { params: { year, month } }).then((r) => r.data)

export const createExpense = (data: { amount: number; date: string; description?: string; subcategory_id: number }) =>
  api.post<FinanceExpense>('/finances/expenses', data).then((r) => r.data)

export const updateExpense = (id: number, data: Partial<{ amount: number; date: string; description: string; subcategory_id: number }>) =>
  api.put<FinanceExpense>(`/finances/expenses/${id}`, data).then((r) => r.data)

export const deleteExpense = (id: number) =>
  api.delete(`/finances/expenses/${id}`)

// Incomes
export const fetchIncomes = (year: number, month: number) =>
  api.get<FinanceIncome[]>('/finances/incomes', { params: { year, month } }).then((r) => r.data)

export const createIncome = (data: { amount: number; date: string; description: string }) =>
  api.post<FinanceIncome>('/finances/incomes', data).then((r) => r.data)

export const updateIncome = (id: number, data: Partial<{ amount: number; date: string; description: string }>) =>
  api.put<FinanceIncome>(`/finances/incomes/${id}`, data).then((r) => r.data)

export const deleteIncome = (id: number) =>
  api.delete(`/finances/incomes/${id}`)

// Summaries
export const fetchYearlySummary = (year: number) =>
  api.get<MonthlySummary[]>('/finances/summary/yearly', { params: { year } }).then((r) => r.data)

export const fetchMonthlyBreakdown = (year: number, month: number) =>
  api.get<MonthlyBreakdown>('/finances/summary/monthly', { params: { year, month } }).then((r) => r.data)

export const fetchMonthlyGoals = (year: number, month: number) =>
  api.get<SubcategoryGoalProgress[]>('/finances/summary/monthly-goals', { params: { year, month } }).then((r) => r.data)
