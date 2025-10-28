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

    // Get user profile and check if admin/moderator
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single<{ id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' }>();

    if (userError || !userProfile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user is admin or moderator
    if (userProfile.role !== 'ADMIN' && userProfile.role !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Admin or Moderator access required'
      });
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

    // Check if the request is in PENDING_RETURN state
    if (borrowRequest.status !== 'PENDING_RETURN') {
      return res.status(400).json({
        success: false,
        error: 'Only pending return requests can be confirmed'
      });
    }

    const currentDate = new Date().toISOString();

    // Update borrow request to RETURNED
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('borrow_requests')
      // @ts-ignore
      .update({
        status: 'RETURNED',
        actual_return_date: currentDate,
        return_confirmed_by: userProfile.id,
        return_confirmed_at: currentDate,
      })
      .eq('id', id)
      .select(`
        *,
        user:users!borrow_requests_user_id_fkey(display_name, email),
        equipment:equipment!borrow_requests_equipment_id_fkey(name, category, serial_number, image),
        approver:users!borrow_requests_approved_by_fkey(display_name, email),
        return_confirmer:users!borrow_requests_return_confirmed_by_fkey(display_name, email)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update equipment availability (return the quantity)
    const newAvailableQuantity = borrowRequest.equipment.available_quantity + borrowRequest.quantity;
    const totalQuantity = borrowRequest.equipment.total_quantity || borrowRequest.equipment.available_quantity + borrowRequest.quantity;

    const { error: equipmentError } = await supabaseAdmin
      .from('equipment')
      // @ts-ignore
      .update({
        available_quantity: newAvailableQuantity,
        status: newAvailableQuantity >= totalQuantity ? 'AVAILABLE' : 'BORROWED'
      })
      .eq('id', borrowRequest.equipment_id);

    if (equipmentError) {
      throw equipmentError;
    }

    console.log(`Return confirmed by admin. Request ID: ${id}, Admin: ${userProfile.id}`);

    // ⭐️ แก้ไขจุดนี้: ลบ 'message' property ออก
    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error confirming return:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}