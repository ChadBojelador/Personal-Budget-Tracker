import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyData, loadBudgetData, saveBudgetData } from './data'

class MemoryStorage {
  private values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})

describe('authenticated local data', () => {
  beforeEach(() => localStorage.clear())

  it('keeps each user budget isolated', () => {
    const alice = createEmptyData()
    alice.settings.savingsTarget = 4200
    saveBudgetData(alice, 'alice')

    expect(loadBudgetData(false, 'alice').settings.savingsTarget).toBe(4200)
    expect(loadBudgetData(false, 'bob').settings.savingsTarget).toBe(0)
  })

  it('claims legacy data for only the first authenticated user', () => {
    const legacy = createEmptyData()
    legacy.settings.emergencyFloor = 1000
    saveBudgetData(legacy)

    expect(loadBudgetData(false, 'alice').settings.emergencyFloor).toBe(1000)
    expect(loadBudgetData(false, 'bob').settings.emergencyFloor).toBe(0)
  })
})
