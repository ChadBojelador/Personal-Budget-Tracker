import type { BudgetData, CoachResponse, Forecast, WishlistItem } from './types'

const DAY_MS = 86_400_000
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function currentMonthKey(now = new Date()) {
  return localDateKey(now).slice(0, 7)
}

export function calculateForecast(data: BudgetData, month: string, now = new Date()): Forecast {
  const [year, monthNumber] = month.split('-').map(Number)
  const lastDay = new Date(year, monthNumber, 0).getDate()
  const isCurrentMonth = currentMonthKey(now) === month
  const isPastMonth = month < currentMonthKey(now)
  const daysElapsed = isPastMonth ? lastDay : isCurrentMonth ? Math.min(now.getDate(), lastDay) : 0
  const daysRemaining = isCurrentMonth ? Math.max(0, lastDay - now.getDate()) : isPastMonth ? 0 : lastDay
  const monthTransactions = data.transactions.filter((item) => item.date.startsWith(month))
  const expenses = monthTransactions.filter((item) => item.kind === 'expense')
  const income = monthTransactions.filter((item) => item.kind === 'income')
  const monthSpending = expenses.reduce((sum, item) => sum + item.amount, 0)
  const monthIncome = income.reduce((sum, item) => sum + item.amount, 0)
  const currentBalance = data.accounts.reduce((sum, account) => sum + account.balance, 0)
  const spendByCategory = expenses.reduce<Record<string, number>>((totals, item) => {
    totals[item.category] = (totals[item.category] ?? 0) + item.amount
    return totals
  }, {})
  const remainingEssentials = Object.entries(data.settings.categoryBudgets).reduce(
    (sum, [category, budget]) => sum + Math.max(0, budget - (spendByCategory[category] ?? 0)),
    0,
  )
  const activeDays = new Set(monthTransactions.map((item) => item.date)).size
  const dailySpendRate = monthSpending / Math.max(1, daysElapsed)
  const plannedDailyRate = Object.values(data.settings.categoryBudgets).reduce((sum, value) => sum + value, 0) / lastDay
  const paceDifference = plannedDailyRate ? ((dailySpendRate - plannedDailyRate) / plannedDailyRate) * 100 : 0
  const expectedIncome = data.settings.allowanceDays
    .filter((day) => !isPastMonth && (isCurrentMonth ? day > now.getDate() : true))
    .length * data.settings.allowanceAmount
  const daysSinceUpdate = (date: string) => Math.floor((now.getTime() - new Date(date).getTime()) / DAY_MS)
  const staleAccountCount = data.accounts.filter((account) => daysSinceUpdate(account.updatedAt) > 7).length
  const uncategorizedCount = expenses.filter((item) => item.category === 'Uncategorized').length
  const confidenceScore = clamp(
    0.28 + Math.min(0.36, activeDays * 0.025) + (staleAccountCount === 0 ? 0.22 : 0) + (uncategorizedCount === 0 ? 0.14 : 0),
    0,
    1,
  )
  const confidence = confidenceScore >= 0.8 ? 'high' : confidenceScore >= 0.58 ? 'medium' : 'low'
  const confidenceReasons = [
    `${activeDays} day${activeDays === 1 ? '' : 's'} with recorded activity`,
    staleAccountCount ? `${staleAccountCount} account${staleAccountCount === 1 ? '' : 's'} need a fresh balance` : 'All account balances are fresh',
    uncategorizedCount ? `${uncategorizedCount} transaction${uncategorizedCount === 1 ? '' : 's'} still uncategorized` : 'Every transaction is categorized',
  ]
  const variableSpendForecast = dailySpendRate * daysRemaining
  const forecastSpend = Math.max(remainingEssentials, variableSpendForecast)
  const projectedMonthEnd = Math.max(0, currentBalance + expectedIncome - forecastSpend)
  const projectedSavings = Math.max(0, projectedMonthEnd - data.settings.emergencyFloor)
  const uncertaintyRate = confidence === 'low' ? 0.1 : confidence === 'medium' ? 0.06 : 0.03
  const uncertaintyHold = Math.round(currentBalance * uncertaintyRate)
  const safeToSpend = Math.max(0, currentBalance - remainingEssentials - data.settings.emergencyFloor - data.settings.savingsTarget - uncertaintyHold)

  return {
    month, currentBalance, monthIncome, monthSpending, projectedMonthEnd, projectedSavings,
    expectedIncome, remainingEssentials, safeToSpend, uncertaintyHold, dailySpendRate,
    paceDifference, confidence, confidenceScore, confidenceReasons, dataDays: activeDays,
    daysElapsed, daysRemaining, staleAccountCount, spendByCategory,
  }
}

export function createLocalCoaching(forecast: Forecast, data: BudgetData): CoachResponse {
  const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
  const targetGap = forecast.projectedSavings - data.settings.savingsTarget
  const pace = Math.round(Math.abs(forecast.paceDifference))
  const insights = [
    {
      id: 'safe-to-spend',
      title: forecast.safeToSpend > 0 ? `${money.format(forecast.safeToSpend)} is flexible today` : 'Keep discretionary spending paused',
      body: `This protects ${money.format(forecast.remainingEssentials)} for essentials, your ${money.format(data.settings.emergencyFloor)} emergency floor, and the current savings target.`,
      action: 'Check a purchase before committing',
      tone: forecast.safeToSpend > 0 ? 'positive' as const : 'watch' as const,
    },
    {
      id: 'spending-pace',
      title: forecast.paceDifference > 5 ? `Spending is ${pace}% ahead of plan` : `Spending is ${pace}% ${forecast.paceDifference < 0 ? 'under' : 'from'} plan`,
      body: forecast.paceDifference > 5
        ? 'Food and transport are the quickest levers. A lighter next three days will improve the month-end range.'
        : 'Your recent pace supports the current forecast. Keep recording cash purchases so it stays reliable.',
      action: 'Review recent activity',
      tone: forecast.paceDifference > 5 ? 'watch' as const : 'positive' as const,
    },
    {
      id: 'savings-target',
      title: targetGap >= 0 ? `Forecast is ${money.format(targetGap)} above target` : `Forecast is ${money.format(Math.abs(targetGap))} below target`,
      body: `The estimate includes ${money.format(forecast.expectedIncome)} of expected allowance and a ${money.format(forecast.uncertaintyHold)} uncertainty hold.`,
      action: 'See forecast assumptions',
      tone: targetGap >= 0 ? 'positive' as const : 'watch' as const,
    },
  ]
  return {
    summary: forecast.confidence === 'low'
      ? 'This is an early estimate. More check-ins will narrow the range.'
      : 'Your forecast is based on recorded pace, protected essentials, and expected allowance.',
    insights,
    source: 'local',
  }
}

export function checkAffordability(item: Pick<WishlistItem, 'price'>, forecast: Forecast, data: BudgetData, now = new Date()) {
  const affordableNow = item.price <= forecast.safeToSpend
  if (affordableNow) return { affordableNow, earliestDate: localDateKey(now), shortfall: 0 }
  const shortfall = item.price - forecast.safeToSpend
  let simulatedSafe = forecast.safeToSpend
  const horizon = new Date(now)
  for (let offset = 1; offset <= 90; offset += 1) {
    horizon.setDate(horizon.getDate() + 1)
    if (data.settings.allowanceDays.includes(horizon.getDate())) simulatedSafe += data.settings.allowanceAmount
    simulatedSafe -= forecast.dailySpendRate
    if (simulatedSafe >= item.price) return { affordableNow: false, earliestDate: localDateKey(horizon), shortfall }
  }
  return { affordableNow: false, earliestDate: null, shortfall }
}
