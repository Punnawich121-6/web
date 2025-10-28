import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, getUserFromToken, getUserProfile } from '../../lib/supabase-server';

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

    const { token } = req.query;

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

    const user = userProfile as { id: string; role: 'USER' | 'ADMIN' | 'MODERATOR' };

    // Admin gets full statistics, regular users get their own statistics
    if (user.role === 'ADMIN') {
      // ✅ PERFORMANCE FIX: Use parallel queries instead of fetching all data
      // This is much faster and reduces memory usage

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Parallel queries for better performance
      const [
        totalResult,
        pendingResult,
        approvedResult,
        activeResult,
        returnedResult,
        rejectedResult,
        equipmentBorrowings,
        recentRequests
      ] = await Promise.all([
        // Total count
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }),
        // Count by status
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'RETURNED'),
        supabaseAdmin.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
        // Top equipment (need to fetch to aggregate)
        supabaseAdmin
          .from('borrow_requests')
          .select(`
            equipment_id,
            equipment:equipment!borrow_requests_equipment_id_fkey (
              id,
              name,
              category
            )
          `),
        // Recent requests for monthly trends
        supabaseAdmin
          .from('borrow_requests')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString())
          .order('created_at', { ascending: false })
      ]);

      // Calculate statistics
      const totalBorrows = totalResult.count || 0;
      const pendingCount = pendingResult.count || 0;
      const approvedCount = (approvedResult.count || 0) + (activeResult.count || 0);
      const returnedCount = returnedResult.count || 0;
      const rejectedCount = rejectedResult.count || 0;

      // Most borrowed equipment - aggregate from fetched data
      const equipmentCounts: Record<string, { name: string; count: number; category: string }> = {};

      equipmentBorrowings.data?.forEach((req: any) => {
        if (req.equipment) {
          const equipId = req.equipment.id;
          if (!equipmentCounts[equipId]) {
            equipmentCounts[equipId] = {
              name: req.equipment.name,
              count: 0,
              category: req.equipment.category
            };
          }
          equipmentCounts[equipId].count += 1;
        }
      });

      const topEquipment = Object.values(equipmentCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Monthly borrow trends (last 6 months)
      const monthlyData: Record<string, number> = {};
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = 0;
      }

      recentRequests.data?.forEach((req: any) => {
        const reqDate = new Date(req.created_at);
        const monthKey = reqDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += 1;
        }
      });

      const monthlyTrends = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }));

      // Category distribution - from top equipment
      const categoryCount: Record<string, number> = {};

      Object.values(equipmentCounts).forEach(({ category }) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

      // Add cache headers (2 minutes)
      res.setHeader('Cache-Control', 'private, max-age=120, s-maxage=120, stale-while-revalidate=240');

      res.status(200).json({
        success: true,
        data: {
          overview: {
            total: totalBorrows,
            pending: pendingCount,
            approved: approvedCount,
            returned: returnedCount,
            rejected: rejectedCount,
          },
          topEquipment,
          monthlyTrends,
          categoryData,
        }
      });
    } else {
      // Regular user gets their own statistics
      const { data: userRequests, error } = await supabaseAdmin
        .from('borrow_requests')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      const totalBorrows = userRequests?.length || 0;
      // ⭐️ START FIX: Add (r: any) to all filters
      const pendingCount = userRequests?.filter((r: any) => r.status === 'PENDING').length || 0;
      const approvedCount = userRequests?.filter((r: any) => r.status === 'APPROVED' || r.status === 'ACTIVE').length || 0;
      const returnedCount = userRequests?.filter((r: any) => r.status === 'RETURNED').length || 0;
      // ⭐️ END FIX

      res.status(200).json({
        success: true,
        data: {
          overview: {
            total: totalBorrows,
            pending: pendingCount,
            approved: approvedCount,
            returned: returnedCount,
            rejected: 0, // Users don't need to see their own rejected count here, or add: userRequests?.filter((r: any) => r.status === 'REJECTED').length || 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Error in statistics API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}