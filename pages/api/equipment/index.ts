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
      // ✅ PERFORMANCE FIX: Optimized query with minimal data
      // - No borrowings join (saves significant data transfer)
      // - No creator join for list view (only needed for detail view)
      // - Only essential fields selected
      const { data: equipment, error } = await supabaseAdmin
        .from('equipment')
        .select(`
          id,
          name,
          category,
          description,
          image,
          status,
          total_quantity,
          available_quantity,
          specifications,
          location,
          serial_number,
          condition,
          created_at,
          updated_at,
          created_by
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching equipment:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      // Convert snake_case to camelCase for frontend
      const filteredEquipment = equipment?.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        image: item.image,
        status: item.status,
        totalQuantity: item.total_quantity,
        availableQuantity: item.available_quantity,
        specifications: item.specifications,
        location: item.location,
        serialNumber: item.serial_number,
        condition: item.condition,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        // Creator info removed from list view for better performance
        // If needed, fetch it separately or in detail view
      }));

      // Add HTTP caching header (2 minutes for fresher data, 10 minutes stale-while-revalidate)
      res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=120, stale-while-revalidate=600');

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
