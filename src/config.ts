import { createClient, type SupabaseBrowserClient } from './utils/supabase/client'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

export const appConfig = {
  supabaseUrl,
  supabaseKey,
  aiCoachingUrl: import.meta.env.VITE_AI_COACHING_URL?.trim() ?? '',
  demoMode: (import.meta.env.VITE_DEMO_MODE?.trim() ?? 'true') !== 'false',
}

export const environmentStatus = {
  supabase: Boolean(supabaseUrl && supabaseKey),
  supabasePartial: Boolean(supabaseUrl || supabaseKey) && !(supabaseUrl && supabaseKey),
  aiCoaching: Boolean(appConfig.aiCoachingUrl),
}

let supabase: SupabaseBrowserClient | null = null

export function getSupabaseClient() {
  if (!environmentStatus.supabase) return null
  supabase ??= createClient()
  return supabase
}
