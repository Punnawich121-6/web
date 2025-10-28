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
      // Get borrow requests (filter by user for non-admin)
      const { token, myOnly } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, error: 'Token is required' });
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

      // Build query based on user role
      let borrowRequestsQuery = supabaseAdmin
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

      // Filter by user if not admin OR if myOnly parameter is set
      if (user.role !== 'ADMIN' || myOnly === 'true') {
        borrowRequestsQuery = borrowRequestsQuery.eq('user_id', user.id);
      }

      const { data: borrowRequests, error } = await borrowRequestsQuery;

      if (error) {
        console.error('Error fetching borrow requests:', error);
        return res.status(500).json({ success: false, error: error.message });
      }

      // Transform snake_case to camelCase for frontend
      const transformedRequests = borrowRequests?.map((request: any) => ({
        id: request.id,
        user: {
          displayName: request.user?.display_name || 'Unknown',
          email: request.user?.email || '',
        },
        equipment: {
          name: request.equipment?.name || '',
          category: request.equipment?.category || '',
          serialNumber: request.equipment?.serial_number || '',
          image: request.equipment?.image,
        },
        quantity: request.quantity,
        startDate: request.start_date,
        endDate: request.end_date,
        actualReturnDate: request.actual_return_date,
        status: request.status,
        purpose: request.purpose,
        notes: request.notes,
        createdAt: request.created_at,
        approver: request.approver ? {
          displayName: request.approver.display_name,
          email: request.approver.email,
        } : undefined,
        approvedAt: request.approved_at,
        rejectionReason: request.rejection_reason,
      })) || [];

      console.log(`Returning ${transformedRequests.length} borrow requests for user role: ${user.role}`);

      // Add HTTP caching header (2 minutes for frequently changing data)
      res.setHeader('Cache-Control', 'private, max-age=120, s-maxage=120, stale-while-revalidate=240');

      res.status(200).json({ success: true, data: transformedRequests });
    } else if (req.method === 'POST') {
      // Create new borrow request
      const { token, borrowData } = req.body;
      console.log('Received borrow request:', { token: token ? 'present' : 'missing', borrowData });

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required' });
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

      if (!borrowData) {
        return res.status(400).json({
          success: false,
          error: 'Borrow request data is required'
        });
      }

      // Check equipment availability
      const { data: equipment, error: equipmentError } = await supabaseAdmin
        .from('equipment')
        .select('*')
        .eq('id', borrowData.equipmentId)
        .single<any>();

      if (equipmentError || !equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }

      if (equipment.available_quantity < borrowData.quantity) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient equipment quantity available'
        });
      }

      // Convert camelCase to snake_case for database
      const dbBorrowData = {
        equipment_id: borrowData.equipmentId,
        user_id: user.id,
        quantity: borrowData.quantity,
        purpose: borrowData.purpose,
        start_date: borrowData.startDate,
        end_date: borrowData.endDate,
        notes: borrowData.notes || null,
        status: borrowData.status || 'PENDING',
      };

      // Create borrow request
      const { data: borrowRequest, error: createError } = await supabaseAdmin
        .from('borrow_requests')
        // @ts-ignore
        .insert(dbBorrowData)
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
          )
        `)
        .single<any>();

      if (createError) {
        console.error('Error creating borrow request:', createError);
        return res.status(500).json({ success: false, error: createError.message });
      }

      res.status(201).json({ success: true, data: borrowRequest });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in borrow API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
