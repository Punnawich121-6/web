"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../components/LibraryNavbar";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  History,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

interface UserData {
  role: "USER" | "ADMIN" | "MODERATOR" | null;
  displayName?: string;
  email?: string;
}

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

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session);
        await fetchStatistics(session);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchUserData(session);
          await fetchStatistics(session);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (session: any) => {
    try {
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
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchStatistics = async (session: any) => {
    try {
      setStatsLoading(true);
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
    } finally {
      setStatsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "เริ่มจองอุปกรณ์",
      description: "เลือกอุปกรณ์ที่ต้องการยืมจากแคตตาล็อก",
      icon: ShoppingCart,
      href: "/equipment/catalog",
      color: "bg-gradient-to-r from-red-600 to-red-700",
      hoverColor: "hover:from-red-700 hover:to-red-800",
    },
    {
      title: "ประวัติการยืม",
      description: "ดูประวัติและสถานะการยืมอุปกรณ์ทั้งหมด",
      icon: History,
      href: "/Borrowing_History",
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-700 hover:to-blue-800",
    },
    {
      title: "ปฏิทินการยืม",
      description: "ดูปฏิทินและกำหนดการยืมอุปกรณ์",
      icon: Calendar,
      href: "/schedule",
      color: "bg-gradient-to-r from-purple-600 to-purple-700",
      hoverColor: "hover:from-purple-700 hover:to-purple-800",
    },
  ];

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

  const isAdmin = userData?.role === 'ADMIN' || userData?.role === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
            <p className="text-xl text-gray-600">
              {isAdmin
                ? 'ภาพรวมและสถิติการยืมอุปกรณ์ทั้งหมด'
                : `ยินดีต้อนรับ, ${userData?.displayName || user?.email}`}
            </p>
          </motion.div>

          {/* Statistics Overview */}
          {statistics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {statistics.overview.total}
                    </p>
                    <p className="text-sm text-gray-600">ทั้งหมด</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">
                      {statistics.overview.pending}
                    </p>
                    <p className="text-sm text-gray-600">รออนุมัติ</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.overview.approved}
                    </p>
                    <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {statistics.overview.returned}
                    </p>
                    <p className="text-sm text-gray-600">คืนแล้ว</p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-red-600">
                        {statistics.overview.rejected}
                      </p>
                      <p className="text-sm text-gray-600">ปฏิเสธ</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Admin Analytics */}
          {isAdmin && statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trends */}
              {statistics.monthlyTrends && statistics.monthlyTrends.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="text-red-600" size={24} />
                      แนวโน้มการยืม (6 เดือนล่าสุด)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {statistics.monthlyTrends.map((item, index) => {
                      const maxCount = Math.max(...statistics.monthlyTrends!.map(i => i.count));
                      const percentage = (item.count / maxCount) * 100;

                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
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
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="text-blue-600" size={24} />
                      อุปกรณ์ที่ถูกยืมมากที่สุด
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {statistics.topEquipment.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">{item.count}</p>
                          <p className="text-xs text-gray-600">ครั้ง</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">การดำเนินการด่วน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.a
                  key={index}
                  href={action.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${action.color} ${action.hoverColor} rounded-xl shadow-lg p-6 text-white transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <action.icon size={28} />
                    </div>
                    <ArrowRight
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90">{action.description}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
