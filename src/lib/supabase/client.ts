import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

let cachedClient: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  cachedClient = createClient<Database>(supabaseUrl, supabaseKey)
  return cachedClient
}
