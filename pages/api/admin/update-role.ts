import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, isAdmin } from '../../../lib/supabase-server';

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
    const { userId, newRole } = req.body;

    if (!token || !userId || !newRole) {
      return res.status(400).json({
        success: false,
        error: 'Token, userId, and newRole are required'
      });
    }

    // Verify Supabase token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if current user is admin
    const userIsAdmin = await isAdmin(authUser.id);

    if (!userIsAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin access required'
      });
    }

    // Validate new role
    const validRoles = ['USER', 'ADMIN', 'MODERATOR'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be USER, ADMIN, or MODERATOR'
      });
    }

    // Update user role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      // @ts-ignore - TypeScript has trouble inferring the update type
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
