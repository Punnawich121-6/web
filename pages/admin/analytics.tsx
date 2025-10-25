"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../../components/LibraryNavbar";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Statistics {
  overview: {
    total: number;
    pending: number;
    approved: number;
    returned: number;
    rejected: number;
  };
  topEquipment?: Array<{
    name: string;
    count: number;
    category: string;
  }>;
  monthlyTrends?: Array<{
    month: string;
    count: number;
  }>;
  categoryData?: Array<{
    name: string;
    value: number;
  }>;
}

const AdminAnalytics = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      // Check if admin
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: session.access_token }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data.role !== 'ADMIN' && result.data.role !== 'MODERATOR') {
          router.push('/dashboard');
          return;
        }
      }

      await fetchStatistics(session);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchStatistics = async (session: any) => {
    try {
      const token = session.access_token;
      const response = await fetch(`/api/statistics?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setStatistics(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-base sm:text-xl text-gray-600">
                  วิเคราะห์และสถิติการยืมอุปกรณ์ทั้งหมด
                </p>
              </div>
              <motion.a
                href="/dashboard"
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                <Activity size={18} />
                <span>กลับไป Dashboard</span>
              </motion.a>
            </div>
          </motion.div>

          {statistics && (
            <>
              {/* Statistics Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg w-fit">
                      <Package className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {statistics.overview.total}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">ทั้งหมด</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-yellow-100 rounded-lg w-fit">
                      <Clock className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                        {statistics.overview.pending}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">รออนุมัติ</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-green-100 rounded-lg w-fit">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">
                        {statistics.overview.approved}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">อนุมัติแล้ว</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg w-fit">
                      <CheckCircle className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {statistics.overview.returned}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">คืนแล้ว</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 col-span-2 sm:col-span-3 lg:col-span-1">
                  <div className="flex flex-col gap-2">
                    <div className="p-2 bg-red-100 rounded-lg w-fit">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">
                        {statistics.overview.rejected}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">ปฏิเสธ</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Monthly Trends */}
                {statistics.monthlyTrends && statistics.monthlyTrends.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-red-600" size={24} />
                        <span className="hidden sm:inline">แนวโน้มการยืม (6 เดือนล่าสุด)</span>
                        <span className="sm:hidden">แนวโน้มการยืม</span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {statistics.monthlyTrends.map((item, index) => {
                        const maxCount = Math.max(...statistics.monthlyTrends!.map(i => i.count));
                        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                        return (
                          <div key={index}>
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                              <span className="text-gray-700">{item.month}</span>
                              <span className="font-medium text-gray-900">{item.count} ครั้ง</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Top Equipment */}
                {statistics.topEquipment && statistics.topEquipment.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={24} />
                        <span className="hidden sm:inline">อุปกรณ์ที่ถูกยืมมากที่สุด</span>
                        <span className="sm:hidden">Top อุปกรณ์</span>
                      </h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {statistics.topEquipment.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{item.category}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-xl sm:text-2xl font-bold text-red-600">{item.count}</p>
                            <p className="text-xs text-gray-600">ครั้ง</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
