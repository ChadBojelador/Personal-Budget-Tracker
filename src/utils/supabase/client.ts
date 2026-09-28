import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>

export const createClient = (): SupabaseBrowserClient => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and publishable key are required')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
