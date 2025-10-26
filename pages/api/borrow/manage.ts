import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, getUserFromToken, getUserProfile } from '../../../lib/supabase-server';

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    if (req.method === 'POST') {
      const { token, requestId, action, rejectionReason } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      if (!requestId || !action) {
        return res.status(400).json({
          success: false,
          error: 'Request ID and action are required'
        });
      }

      if (!['approve', 'reject', 'return'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "approve", "reject", or "return"'
        });
      }

      // Verify token and get user
      const authUser = await getUserFromToken(token);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const userProfile = await getUserProfile(authUser.id);
      if (!userProfile) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Type assertion for user profile
      const user = userProfile as { id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' };

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Check if borrow request exists
      const { data: borrowRequest, error: fetchError } = await supabaseAdmin
        .from('borrow_requests')
        .select(`
          *,
          equipment:equipment!borrow_requests_equipment_id_fkey (*),
          user:users!borrow_requests_user_id_fkey (*)
        `)
        .eq('id', requestId)
        .single<any>();

      if (fetchError || !borrowRequest) {
        return res.status(404).json({
          success: false,
          error: 'Borrow request not found'
        });
      }

      // Validate status based on action
      if (action === 'return') {
        if (!['APPROVED', 'ACTIVE'].includes(borrowRequest.status)) {
          return res.status(400).json({
            success: false,
            error: 'Only approved or active requests can be returned'
          });
        }
      } else {
        if (borrowRequest.status !== 'PENDING') {
          return res.status(400).json({
            success: false,
            error: 'Only pending requests can be approved or rejected'
          });
        }
      }

      let updateData: any = {};

      if (action === 'approve') {
        // Check equipment availability before approving
        if (borrowRequest.equipment.available_quantity < borrowRequest.quantity) {
          return res.status(400).json({
            success: false,
            error: 'Insufficient equipment quantity available'
          });
        }

        updateData = {
          status: 'APPROVED',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        };

        // Reduce available quantity when approving
        const newAvailableQuantity = borrowRequest.equipment.available_quantity - borrowRequest.quantity;
        const { error: equipmentError } = await supabaseAdmin
          .from('equipment')
          // @ts-ignore
          .update({
            available_quantity: newAvailableQuantity,
            status: newAvailableQuantity === 0 ? 'BORROWED' : borrowRequest.equipment.status
          })
          .eq('id', borrowRequest.equipment_id);

        if (equipmentError) {
          console.error('Error updating equipment quantity:', equipmentError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update equipment quantity'
          });
        }
      } else if (action === 'reject') {
        updateData = {
          status: 'REJECTED',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        };
        if (rejectionReason) {
          updateData.rejection_reason = rejectionReason;
        }
      } else if (action === 'return') {
        updateData = {
          status: 'RETURNED',
          actual_return_date: new Date().toISOString(),
        };

        // Increase available quantity when returning
        const newAvailableQuantity = borrowRequest.equipment.available_quantity + borrowRequest.quantity;
        const { error: equipmentError } = await supabaseAdmin
          .from('equipment')
          // @ts-ignore
          .update({
            available_quantity: newAvailableQuantity,
            status: newAvailableQuantity > 0 ? 'AVAILABLE' : borrowRequest.equipment.status
          })
          .eq('id', borrowRequest.equipment_id);

        if (equipmentError) {
          console.error('Error updating equipment quantity on return:', equipmentError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update equipment quantity on return'
          });
        }
      }

      // Update the borrow request
      const { data: updatedRequest, error: updateError } = await supabaseAdmin
        .from('borrow_requests')
        // @ts-ignore
        .update(updateData)
        .eq('id', requestId)
        .select(`
          *,
          user:users!borrow_requests_user_id_fkey (
            display_name,
            email
          ),
          equipment:equipment!borrow_requests_equipment_id_fkey (
            name,
            category,
            serial_number,
            image
          ),
          approver:users!borrow_requests_approved_by_fkey (
            display_name,
            email
          )
        `)
        .single<any>();

      if (updateError) {
        console.error('Error updating borrow request:', updateError);
        return res.status(500).json({ success: false, error: updateError.message });
      }

      res.status(200).json({ success: true, data: updatedRequest });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in borrow manage API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
