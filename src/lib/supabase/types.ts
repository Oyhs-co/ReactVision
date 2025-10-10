export type Database = {
  public: {
    Tables: {
      // Define el esquema completo de las tablas
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
        Update: {
          id?: string
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
        Update: {
          id?: string
          test_id?: string
          attempt_number?: number
          time?: number
          was_fault?: boolean
          delay_used?: number
          created_at?: string
        }
      }
    }
  }
}