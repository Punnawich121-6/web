import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase-server';

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
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Fetch public-appropriate borrow requests (approved, active, and returned)
    const { data: borrowRequests, error } = await supabaseAdmin
      .from('borrow_requests')
      .select(`
        *,
        equipment:equipment!borrow_requests_equipment_id_fkey (
          name,
          category,
          image
        )
      `)
      .in('status', ['APPROVED', 'ACTIVE', 'RETURNED'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public borrow requests:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Transform to public data (hide user details)
    const publicData = borrowRequests?.map((request: any) => ({
      id: request.id,
      user: {
        displayName: 'ผู้ยืม', // Hide real name for public view
        email: '', // Don't show email
      },
      equipment: {
        name: request.equipment?.name || '',
        category: request.equipment?.category || '',
        serialNumber: '', // Hide serial number
        image: request.equipment?.image,
      },
      quantity: request.quantity,
      startDate: request.start_date,
      endDate: request.end_date,
      status: request.status,
      purpose: 'การยืมอุปกรณ์', // Generic purpose for public
      notes: null, // Hide notes
      createdAt: request.created_at,
    })) || [];

    res.status(200).json({ success: true, data: publicData });
  } catch (error) {
    console.error('Error in public borrow API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
