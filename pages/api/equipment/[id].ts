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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid equipment ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single equipment
      const { data: equipment, error } = await supabaseAdmin
        .from('equipment')
        .select(`
          *,
          creator:users!equipment_created_by_fkey (
            display_name,
            email
          ),
          borrowings:borrow_requests!borrow_requests_equipment_id_fkey (
            *,
            user:users!borrow_requests_user_id_fkey (
              display_name,
              email
            )
          )
        `)
        .eq('id', id)
        .order('created_at', { ascending: false, foreignTable: 'borrow_requests' })
        .single<any>();

      if (error || !equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }

      res.status(200).json({ success: true, data: equipment });
    } else if (req.method === 'PUT') {
      // Update equipment (Admin only)
      const { token, equipmentData } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify token and get user
      const authUser = await getUserFromToken(token);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const userProfile = await getUserProfile(authUser.id);
      const user = userProfile as { id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' } | null;
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbEquipmentData: any = {};
      if (equipmentData.name !== undefined) dbEquipmentData.name = equipmentData.name;
      if (equipmentData.category !== undefined) dbEquipmentData.category = equipmentData.category;
      if (equipmentData.description !== undefined) dbEquipmentData.description = equipmentData.description;
      if (equipmentData.serialNumber !== undefined) dbEquipmentData.serial_number = equipmentData.serialNumber;
      if (equipmentData.image !== undefined) dbEquipmentData.image = equipmentData.image;
      if (equipmentData.availableQuantity !== undefined) dbEquipmentData.available_quantity = equipmentData.availableQuantity;
      if (equipmentData.totalQuantity !== undefined) dbEquipmentData.total_quantity = equipmentData.totalQuantity;
      if (equipmentData.status !== undefined) dbEquipmentData.status = equipmentData.status;

      // Update equipment
      const { data: equipment, error } = await supabaseAdmin
        .from('equipment')
        // @ts-ignore
        .update(dbEquipmentData)
        .eq('id', id)
        .select(`
          *,
          creator:users!equipment_created_by_fkey (
            display_name,
            email
          )
        `)
        .single<any>();

      if (error) {
        console.error('Error updating equipment:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      res.status(200).json({ success: true, data: equipment });
    } else if (req.method === 'DELETE') {
      // Delete equipment (Admin only)
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
      }

      // Verify token and get user
      const authUser = await getUserFromToken(token);
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const userProfile = await getUserProfile(authUser.id);
      const user = userProfile as { id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' } | null;
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: Admin access required'
        });
      }

      // Check if equipment has active borrowings
      const { data: activeBorrowings, error: borrowingsError } = await supabaseAdmin
        .from('borrow_requests')
        .select('id')
        .eq('equipment_id', id)
        .in('status', ['PENDING', 'APPROVED', 'ACTIVE']);

      if (borrowingsError) {
        console.error('Error checking borrowings:', borrowingsError);
        return res.status(500).json({ success: false, error: borrowingsError.message });
      }

      if (activeBorrowings && activeBorrowings.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete equipment with active borrowings'
        });
      }

      // Delete equipment
      const { error } = await supabaseAdmin
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting equipment:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      res.status(200).json({ success: true, data: { message: 'Equipment deleted successfully' } });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in equipment API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
