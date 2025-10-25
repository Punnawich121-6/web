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
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token is required' });
    }

    // Verify Supabase token and get user
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user exists in database
    let { data: user, error: queryError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    // If user doesn't exist, create one
    if (queryError && queryError.code === 'PGRST116') {
      // Check if email is in admin list
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      const isAdmin = adminEmails.includes(authUser.email || '');

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        // @ts-ignore
        .insert({
          auth_id: authUser.id,
          email: authUser.email || '',
          display_name: authUser.user_metadata?.display_name || authUser.email || '',
          role: isAdmin ? 'ADMIN' : 'USER',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      user = newUser;
    } else if (queryError) {
      throw queryError;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
