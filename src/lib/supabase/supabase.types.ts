export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      reaction_tests: {
        Row: {
          id: number
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
          id?: number
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
        Update: {
          id?: number
          user_id?: string | null
          timestamp?: string
          age?: number
          gender?: string
          wears_glasses?: boolean
          visual_fatigue?: number
          average_time?: number
          calibrated_average?: number
          faults?: number
          created_at?: string
        }
      }
      attempts: {
        Row: {
          id: number
          test_id: number
          attempt_number: number
          time: number
          was_fault: boolean
          delay_used: number
          created_at: string
        }
        Insert: {
          id?: number
          test_id: number
          attempt_number: number
          time: number
          was_fault: boolean
          delay_used: number
          created_at?: string
        }
        Update: {
          id?: number
          test_id?: number
          attempt_number?: number
          time?: number
          was_fault?: boolean
          delay_used?: number
          created_at?: string
        }
      }
      ai_analysis: {
        Row: {
          id: number
          test_id: number
          analysis_text: string
          processed_data: string
          created_at: string
        }
        Insert: {
          id?: number
          test_id: number
          analysis_text: string
          processed_data: string
          created_at?: string
        }
        Update: {
          id?: number
          test_id?: number
          analysis_text?: string
          processed_data?: string
          created_at?: string
        }
      }
    }
    Functions: {
      reset_sequence: {
        Args: {
          table_name: string
        }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}
