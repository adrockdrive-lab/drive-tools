import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string
          phone_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          phone_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      missions: {
        Row: {
          id: number
          title: string
          description: string | null
          reward_amount: number
          mission_type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          reward_amount?: number
          mission_type: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          reward_amount?: number
          mission_type?: string
          is_active?: boolean
          created_at?: string
        }
      }
      user_missions: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          status: string
          proof_data: Record<string, unknown> | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          status?: string
          proof_data?: Record<string, unknown> | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mission_id?: number
          status?: string
          proof_data?: Record<string, unknown> | null
          completed_at?: string | null
          created_at?: string
        }
      }
      paybacks: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          amount: number
          status: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          amount: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mission_id?: number
          amount?: number
          status?: string
          paid_at?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_name: string
          referee_phone: string
          is_verified: boolean
          reward_paid: boolean
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_name: string
          referee_phone: string
          is_verified?: boolean
          reward_paid?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_name?: string
          referee_phone?: string
          is_verified?: boolean
          reward_paid?: boolean
          created_at?: string
        }
      }
    }
  }
}