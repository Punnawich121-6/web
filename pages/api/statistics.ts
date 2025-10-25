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
      // Get all borrow requests for statistics
      const { data: allRequests, error } = await supabaseAdmin
        .from('borrow_requests')
        .select(`
          *,
          equipment:equipment!borrow_requests_equipment_id_fkey (
            id,
            name,
            category
          )
        `);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }

      // Calculate statistics
      const totalBorrows = allRequests?.length || 0;
      const pendingCount = allRequests?.filter(r => r.status === 'PENDING').length || 0;
      const approvedCount = allRequests?.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length || 0;
      const returnedCount = allRequests?.filter(r => r.status === 'RETURNED').length || 0;
      const rejectedCount = allRequests?.filter(r => r.status === 'REJECTED').length || 0;

      // Most borrowed equipment
      const equipmentCounts: Record<string, { name: string; count: number; category: string }> = {};
      allRequests?.forEach(req => {
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

      allRequests?.forEach(req => {
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

      // Category distribution
      const categoryCount: Record<string, number> = {};
      allRequests?.forEach(req => {
        if (req.equipment?.category) {
          const category = req.equipment.category;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

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
      const pendingCount = userRequests?.filter(r => r.status === 'PENDING').length || 0;
      const approvedCount = userRequests?.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length || 0;
      const returnedCount = userRequests?.filter(r => r.status === 'RETURNED').length || 0;

      res.status(200).json({
        success: true,
        data: {
          overview: {
            total: totalBorrows,
            pending: pendingCount,
            approved: approvedCount,
            returned: returnedCount,
            rejected: 0,
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
