export type AccountType = 'cash' | 'wallet' | 'bank'

export type Account = {
  id: string
  name: string
  balance: number
  type: AccountType
  updatedAt: string
}

export type TransactionKind = 'income' | 'expense'

export type Transaction = {
  id: string
  accountId: string
  amount: number
  kind: TransactionKind
  category: string
  description: string
  date: string
}

export type WishlistItem = {
  id: string
  name: string
  price: number
  desiredDate: string
  priority: 'low' | 'medium' | 'high'
}

export type BudgetSettings = {
  emergencyFloor: number
  savingsTarget: number
  allowanceAmount: number
  allowanceDays: [number, number]
  categoryBudgets: Record<string, number>
}

export type BudgetData = {
  accounts: Account[]
  transactions: Transaction[]
  wishlist: WishlistItem[]
  settings: BudgetSettings
  lastCheckIn?: string
}

export type Confidence = 'low' | 'medium' | 'high'

export type Forecast = {
  month: string
  currentBalance: number
  monthIncome: number
  monthSpending: number
  projectedMonthEnd: number
  projectedSavings: number
  expectedIncome: number
  remainingEssentials: number
  safeToSpend: number
  uncertaintyHold: number
  dailySpendRate: number
  paceDifference: number
  confidence: Confidence
  confidenceScore: number
  confidenceReasons: string[]
  dataDays: number
  daysElapsed: number
  daysRemaining: number
  staleAccountCount: number
  spendByCategory: Record<string, number>
}

export type CoachInsight = {
  id: string
  title: string
  body: string
  action: string
  tone: 'positive' | 'watch' | 'neutral'
}

export type CoachResponse = {
  summary: string
  insights: CoachInsight[]
  source: 'local' | 'remote'
}
