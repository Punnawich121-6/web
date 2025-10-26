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
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Fetch all borrow requests with related data (public access)
    const { data: borrowRequests, error } = await supabaseAdmin
      .from('borrow_requests')
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activity:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Transform to public data
    const activityData = borrowRequests?.map((request: any) => ({
      id: request.id,
      user: {
        displayName: request.user?.display_name || 'ผู้ใช้',
        email: request.user?.email || ''
      },
      equipment: {
        name: request.equipment?.name || '',
        category: request.equipment?.category || '',
        serialNumber: request.equipment?.serial_number || '',
        image: request.equipment?.image || ''
      },
      quantity: request.quantity,
      startDate: request.start_date,
      endDate: request.end_date,
      actualReturnDate: request.actual_return_date,
      status: request.status,
      purpose: request.purpose || 'การยืมอุปกรณ์',
      notes: request.notes,
      createdAt: request.created_at,
      approvedAt: request.approved_at,
      approvedBy: request.approver ? {
        displayName: request.approver.display_name,
        email: request.approver.email
      } : null,
      rejectionReason: request.rejection_reason
    })) || [];

    res.status(200).json({ success: true, data: activityData });
  } catch (error) {
    console.error('Error in activity API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
