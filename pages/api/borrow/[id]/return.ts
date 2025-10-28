import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, getUserFromToken } from '../../../../lib/supabase-server';

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

  const { id } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid request ID' });
  }

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  try {
    // Verify token and get user
    const authUser = await getUserFromToken(token);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single<{ id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' }>();

    if (userError || !userProfile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get the borrow request with equipment info
    const { data: borrowRequest, error: requestError } = await supabaseAdmin
      .from('borrow_requests')
      .select(`
        *,
        equipment:equipment(*)
      `)
      .eq('id', id)
      .single<any>();

    if (requestError || !borrowRequest) {
      return res.status(404).json({ success: false, error: 'Borrow request not found' });
    }

    // Check if user owns this borrow request (unless admin/moderator)
    if (borrowRequest.user_id !== userProfile.id &&
        userProfile.role !== 'ADMIN' &&
        userProfile.role !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only return your own borrowed items'
      });
    }

    // Check if the request is in a returnable state (APPROVED status)
    if (borrowRequest.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'Only approved items can be returned'
      });
    }

    // Check if already requested return or returned
    if (borrowRequest.status === 'PENDING_RETURN') {
      return res.status(400).json({
        success: false,
        error: 'Return request is already pending approval'
      });
    }

    if (borrowRequest.actual_return_date || borrowRequest.status === 'RETURNED') {
      return res.status(400).json({
        success: false,
        error: 'This item has already been returned'
      });
    }

    const currentDate = new Date().toISOString();

    // Update borrow request to PENDING_RETURN (waiting for admin approval)
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('borrow_requests')
      // @ts-ignore
      .update({
        status: 'PENDING_RETURN',
        return_requested_at: currentDate,
      })
      .eq('id', id)
      .select(`
        *,
        user:users!borrow_requests_user_id_fkey(display_name, email),
        equipment:equipment!borrow_requests_equipment_id_fkey(name, category, serial_number, image),
        approver:users!borrow_requests_approved_by_fkey(display_name, email)
      `)
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log(`Return request submitted. Request ID: ${id}, User: ${userProfile.id}`);

    res.status(200).json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error returning item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
