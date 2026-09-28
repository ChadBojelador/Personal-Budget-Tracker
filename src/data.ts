import type { BudgetData } from './types'

const STORAGE_KEY = 'budget-tracker-data-v1'

const isoDaysAgo = (days: number, now = new Date()) => {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const dateDaysAgo = (days: number, now = new Date()) => isoDaysAgo(days, now).slice(0, 10)

export function createDemoData(now = new Date()): BudgetData {
  return {
    accounts: [
      { id: 'cash', name: 'Cash', balance: 1_850, type: 'cash', updatedAt: isoDaysAgo(0, now) },
      { id: 'gcash', name: 'GCash', balance: 3_420, type: 'wallet', updatedAt: isoDaysAgo(2, now) },
      { id: 'maribank', name: 'MariBank', balance: 6_730, type: 'bank', updatedAt: isoDaysAgo(2, now) },
    ],
    transactions: [
      { id: 'tx-1', accountId: 'cash', amount: 145, kind: 'expense', category: 'Food', description: 'Lunch', date: dateDaysAgo(0, now) },
      { id: 'tx-2', accountId: 'gcash', amount: 5_000, kind: 'income', category: 'Allowance', description: 'Allowance', date: dateDaysAgo(0, now) },
      { id: 'tx-3', accountId: 'cash', amount: 26, kind: 'expense', category: 'Transport', description: 'Jeepney', date: dateDaysAgo(0, now) },
      { id: 'tx-4', accountId: 'gcash', amount: 310, kind: 'expense', category: 'Food', description: 'Groceries', date: dateDaysAgo(2, now) },
      { id: 'tx-5', accountId: 'cash', amount: 60, kind: 'expense', category: 'Transport', description: 'Commute', date: dateDaysAgo(3, now) },
      { id: 'tx-6', accountId: 'maribank', amount: 1_299, kind: 'expense', category: 'Wi-Fi', description: 'Home internet', date: dateDaysAgo(5, now) },
      { id: 'tx-7', accountId: 'cash', amount: 220, kind: 'expense', category: 'Food', description: 'Dinner', date: dateDaysAgo(6, now) },
      { id: 'tx-8', accountId: 'gcash', amount: 300, kind: 'expense', category: 'Mobile load', description: 'Mobile load', date: dateDaysAgo(8, now) },
      { id: 'tx-9', accountId: 'cash', amount: 180, kind: 'expense', category: 'Food', description: 'Lunch', date: dateDaysAgo(10, now) },
      { id: 'tx-10', accountId: 'cash', amount: 104, kind: 'expense', category: 'Transport', description: 'Commute', date: dateDaysAgo(12, now) },
      { id: 'tx-11', accountId: 'gcash', amount: 560, kind: 'expense', category: 'Food', description: 'Market', date: dateDaysAgo(15, now) },
      { id: 'tx-12', accountId: 'maribank', amount: 5_000, kind: 'income', category: 'Allowance', description: 'Allowance', date: dateDaysAgo(15, now) },
    ],
    wishlist: [],
    settings: {
      emergencyFloor: 1_000,
      savingsTarget: 2_500,
      allowanceAmount: 5_000,
      allowanceDays: [1, 15],
      categoryBudgets: { Food: 4_200, Transport: 2_000, 'Wi-Fi': 1_299, 'Mobile load': 400 },
    },
  }
}

function isBudgetData(value: unknown): value is BudgetData {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BudgetData>
  return Array.isArray(candidate.accounts)
    && Array.isArray(candidate.transactions)
    && Array.isArray(candidate.wishlist)
    && Boolean(candidate.settings)
}

export function loadBudgetData(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDemoData()
    const parsed: unknown = JSON.parse(raw)
    return isBudgetData(parsed) ? parsed : createDemoData()
  } catch {
    return createDemoData()
  }
}

export function saveBudgetData(data: BudgetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetBudgetData() {
  const data = createDemoData()
  saveBudgetData(data)
  return data
}
