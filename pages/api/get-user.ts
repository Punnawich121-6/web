import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabase-server';

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token is required' });
    }

    // Verify Supabase token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user from database
    const { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, role, created_at')
      .eq('auth_id', authUser.id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      throw queryError;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in get-user API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
