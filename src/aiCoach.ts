import { appConfig, getSupabaseClient } from './config'
import type { BudgetData, CoachResponse, Forecast } from './types'

type RemoteCoachPayload = Omit<CoachResponse, 'source'>

function isRemoteCoachPayload(value: unknown): value is RemoteCoachPayload {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<RemoteCoachPayload>
  return typeof candidate.summary === 'string'
    && Array.isArray(candidate.insights)
    && candidate.insights.every((item) => item && typeof item.title === 'string' && typeof item.body === 'string')
}

export async function requestAICoaching(forecast: Forecast, data: BudgetData): Promise<CoachResponse> {
  if (!appConfig.aiCoachingUrl) throw new Error('Add VITE_AI_COACHING_URL to enable connected coaching.')
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  const supabase = getSupabaseClient()
  const session = supabase ? (await supabase.auth.getSession()).data.session : null
  try {
    const response = await fetch(appConfig.aiCoachingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      signal: controller.signal,
      body: JSON.stringify({
        forecast: {
          month: forecast.month, currentBalance: forecast.currentBalance,
          projectedSavings: forecast.projectedSavings, safeToSpend: forecast.safeToSpend,
          remainingEssentials: forecast.remainingEssentials, expectedIncome: forecast.expectedIncome,
          uncertaintyHold: forecast.uncertaintyHold, dailySpendRate: forecast.dailySpendRate,
          paceDifference: forecast.paceDifference, confidence: forecast.confidence,
          confidenceReasons: forecast.confidenceReasons, spendByCategory: forecast.spendByCategory,
        },
        goals: { savingsTarget: data.settings.savingsTarget, emergencyFloor: data.settings.emergencyFloor },
      }),
    })
    if (!response.ok) throw new Error(`Coaching service returned ${response.status}.`)
    const payload: unknown = await response.json()
    if (!isRemoteCoachPayload(payload)) throw new Error('Coaching service returned an invalid response.')
    return {
      summary: payload.summary,
      insights: payload.insights.slice(0, 3).map((insight, index) => ({
        id: insight.id || `remote-${index}`,
        title: insight.title,
        body: insight.body,
        action: insight.action || 'Review the forecast',
        tone: insight.tone === 'positive' || insight.tone === 'watch' ? insight.tone : 'neutral',
      })),
      source: 'remote',
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
