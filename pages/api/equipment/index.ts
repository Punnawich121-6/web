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
    if (req.method === 'GET') {
      // Get all equipment
      // Note: Supabase doesn't support filtering nested relations in the select query the same way Prisma does
      // We fetch all equipment and all their borrowings, then the client can filter if needed
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      // Filter borrowings to only include ACTIVE and APPROVED statuses
      // And convert snake_case to camelCase for frontend
      const filteredEquipment = equipment?.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        image: item.image,
        status: item.status,
        totalQuantity: item.total_quantity,
        availableQuantity: item.available_quantity, // Convert snake_case to camelCase
        specifications: item.specifications,
        location: item.location,
        serialNumber: item.serial_number,
        condition: item.condition,
        purchaseDate: item.purchase_date,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        creator: item.creator,
        borrowings: item.borrowings?.filter((b: any) =>
          ['ACTIVE', 'APPROVED'].includes(b.status)
        ) || []
      }));

      res.status(200).json({ success: true, data: filteredEquipment || [] });
    } else if (req.method === 'POST') {
      // Create new equipment (Admin only)
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

      if (!equipmentData) {
        return res.status(400).json({
          success: false,
          error: 'Equipment data is required'
        });
      }

      // Convert camelCase to snake_case for database
      const dbEquipmentData = {
        name: equipmentData.name,
        category: equipmentData.category,
        description: equipmentData.description,
        serial_number: equipmentData.serialNumber,
        location: equipmentData.location || 'ไม่ระบุ',
        image: equipmentData.image,
        available_quantity: equipmentData.availableQuantity,
        total_quantity: equipmentData.totalQuantity,
        status: equipmentData.status || 'AVAILABLE',
        specifications: equipmentData.specifications,
        condition: equipmentData.condition,
        purchase_date: equipmentData.purchaseDate,
        created_by: user.id,
      };

      // Create equipment
      const { data: equipment, error } = await supabaseAdmin
        .from('equipment')
        // @ts-ignore
        .insert(dbEquipmentData)
        .select(`
          *,
          creator:users!equipment_created_by_fkey (
            display_name,
            email
          )
        `)
        .single<any>();

      if (error) {
        console.error('Error creating equipment:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      res.status(201).json({ success: true, data: equipment });
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
