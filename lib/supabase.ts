import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// สำหรับ Client-side (ใช้ใน pages และ components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// สำหรับ Client Components ที่ต้องการ auto-refresh token
export const createSupabaseClient = () => createClientComponentClient()

// Database Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          display_name: string | null
          role: 'USER' | 'ADMIN' | 'MODERATOR'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          display_name?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          display_name?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          image: string | null
          serial_number: string
          location: string
          status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED'
          total_quantity: number
          available_quantity: number
          specifications: string | null
          condition: string | null
          purchase_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          image?: string | null
          serial_number: string
          location: string
          status?: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED'
          total_quantity?: number
          available_quantity?: number
          specifications?: string | null
          condition?: string | null
          purchase_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          image?: string | null
          serial_number?: string
          location?: string
          status?: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE' | 'RETIRED'
          total_quantity?: number
          available_quantity?: number
          specifications?: string | null
          condition?: string | null
          purchase_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      borrow_requests: {
        Row: {
          id: string
          user_id: string
          equipment_id: string
          quantity: number
          purpose: string
          start_date: string
          end_date: string
          actual_return_date: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'
          notes: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          equipment_id: string
          quantity?: number
          purpose: string
          start_date: string
          end_date: string
          actual_return_date?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          equipment_id?: string
          quantity?: number
          purpose?: string
          start_date?: string
          end_date?: string
          actual_return_date?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE'
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type Equipment = Database['public']['Tables']['equipment']['Row']
export type BorrowRequest = Database['public']['Tables']['borrow_requests']['Row']
