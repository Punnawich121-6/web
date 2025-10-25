import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// สำหรับ API Routes และ Server-side operations
// ใช้ service_role key เพื่อ bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function สำหรับดึงข้อมูล user จาก auth token
export async function getUserFromToken(token: string) {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error) throw error

    return user
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// Helper function สำหรับดึงข้อมูล user profile จาก database
export async function getUserProfile(authId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Helper function สำหรับตรวจสอบว่าเป็น admin หรือไม่
export async function isAdmin(authId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single<{ role: 'USER' | 'ADMIN' | 'MODERATOR' }>()

    if (error) throw error

    return data?.role === 'ADMIN'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Helper function สำหรับตรวจสอบว่าเป็น admin หรือ moderator
export async function isAdminOrModerator(authId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single<{ role: 'USER' | 'ADMIN' | 'MODERATOR' }>()

    if (error) throw error

    return data?.role === 'ADMIN' || data?.role === 'MODERATOR'
  } catch (error) {
    console.error('Error checking admin/moderator status:', error)
    return false
  }
}
