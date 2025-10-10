import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export type Tables = {
  reaction_tests: {
    Row: {
      id: string
      user_id: string | null
      timestamp: string
      age: number
      gender: string
      wears_glasses: boolean
      visual_fatigue: number
      average_time: number
      calibrated_average: number
      faults: number
      created_at: string
    }
    Insert: {
      id?: string
      user_id?: string | null
      timestamp: string
      age: number
      gender: string
      wears_glasses: boolean
      visual_fatigue: number
      average_time: number
      calibrated_average: number
      faults: number
      created_at?: string
    }
  }
  attempts: {
    Row: {
      id: string
      test_id: string
      attempt_number: number
      time: number
      was_fault: boolean
      delay_used: number
      created_at: string
    }
    Insert: {
      id?: string
      test_id: string
      attempt_number: number
      time: number
      was_fault: boolean
      delay_used: number
      created_at?: string
    }
  }
}