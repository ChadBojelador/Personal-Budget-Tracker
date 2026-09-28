import { describe, expect, it } from 'vitest'
import { createDemoData, createInitialBudgetData } from './data'
import { calculateForecast, checkAffordability, createLocalCoaching } from './forecast'

const now = new Date('2026-09-28T12:00:00+08:00')

describe('forecast safety rules', () => {
  it('starts production mode without seeded financial data', () => {
    const data = createInitialBudgetData(false)

    expect(data.accounts).toEqual([])
    expect(data.transactions).toEqual([])
    expect(data.wishlist).toEqual([])
    expect(data.settings.emergencyFloor).toBe(0)
    expect(data.settings.savingsTarget).toBe(0)
  })

  it('only seeds sample records when demo mode is explicitly enabled', () => {
    const data = createInitialBudgetData(true)

    expect(data.accounts).toHaveLength(3)
    expect(data.transactions).toHaveLength(12)
  })

  it('protects essentials, emergency funds, savings, and uncertainty', () => {
    const data = createDemoData(now)
    const forecast = calculateForecast(data, '2026-09', now)

    expect(forecast.currentBalance).toBe(12_000)
    expect(forecast.remainingEssentials).toBe(4_695)
    expect(forecast.uncertaintyHold).toBe(360)
    expect(forecast.safeToSpend).toBe(3_445)
    expect(forecast.projectedMonthEnd).toBeGreaterThanOrEqual(0)
  })

  it('never counts a future allowance as money available today', () => {
    const data = createDemoData(now)
    data.settings.allowanceDays = [29, 30]
    const forecast = calculateForecast(data, '2026-09', now)

    expect(forecast.expectedIncome).toBe(10_000)
    expect(forecast.safeToSpend).toBe(3_445)
  })

  it('finds a future safe date using scheduled income and daily spending', () => {
    const data = createDemoData(now)
    const forecast = calculateForecast(data, '2026-09', now)
    const result = checkAffordability({ price: 6_000 }, forecast, data, now)

    expect(result.affordableNow).toBe(false)
    expect(result.earliestDate).toBe('2026-10-01')
    expect(result.shortfall).toBe(2_555)
  })

  it('keeps local coaching explainable and tied to the calculation', () => {
    const data = createDemoData(now)
    const forecast = calculateForecast(data, '2026-09', now)
    const coaching = createLocalCoaching(forecast, data)

    expect(coaching.source).toBe('local')
    expect(coaching.insights).toHaveLength(3)
    expect(coaching.insights[0].title).toContain('₱3,445')
  })
})
