import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, isAdminOrModerator } from '../../../../lib/supabase-server';

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
    // Verify Supabase token
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Check if user exists and is admin or moderator
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single<{ id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' }>();

    if (userError || !user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
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

    if (borrowRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be approved'
      });
    }

    // Check equipment availability
    if (borrowRequest.equipment.available_quantity < borrowRequest.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient equipment quantity available'
      });
    }

    // Update borrow request to APPROVED
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('borrow_requests')
      // @ts-ignore
      .update({
        status: 'APPROVED',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        user:users(display_name, email),
        equipment:equipment(name, category, serial_number, image),
        approver:users!borrow_requests_approved_by_fkey(display_name, email)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update equipment availability
    const newAvailableQuantity = borrowRequest.equipment.available_quantity - borrowRequest.quantity;
    const { error: equipmentError } = await supabaseAdmin
      .from('equipment')
      // @ts-ignore
      .update({
        available_quantity: newAvailableQuantity,
        status: newAvailableQuantity === 0 ? 'BORROWED' : 'AVAILABLE'
      })
      .eq('id', borrowRequest.equipment_id);

    if (equipmentError) {
      throw equipmentError;
    }

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Error approving borrow request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
