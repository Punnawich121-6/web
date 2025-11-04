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
    rejected: number; // Added rejected count
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
        await fetchStatistics(session); // Fetch stats only if logged in
      }
      setLoading(false); // Set main loading false after checking session
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchUserData(session);
          await fetchStatistics(session); // Fetch stats on auth change
        } else {
          setUserData(null);
          setStatistics(null); // Clear stats if logged out
          setStatsLoading(false); // No stats to load if logged out
        }
        setLoading(false); // Set main loading false after auth change
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
    // Only attempt to fetch stats if there's a valid session and user token
    if (!session || !session.access_token) {
        setStatsLoading(false); // No session, no stats to load
        setStatistics(null);
        return;
    }
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
        } else {
            console.error("Failed to fetch statistics:", result.error);
            setStatistics(null); // Set to null on failure
        }
      } else {
         console.error("HTTP Error fetching statistics:", response.status);
         setStatistics(null); // Set to null on HTTP error
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(null); // Set to null on exception
    } finally {
      setStatsLoading(false);
    }
  };


 const quickActions = [
  {
    title: "เริ่มจองอุปกรณ์",
    description: "เลือกอุปกรณ์ที่ต้องการยืมจากรายการ",
    icon: ShoppingCart,
    href: "/equipment/catalog",
    color: "bg-gradient-to-r from-red-600 to-red-700",
    hoverColor: "hover:from-red-700 hover:to-red-800",
    textColor: "text-white",
    iconBgColor: "bg-red-700",
    descriptionColor: "text-red-100",
  },
  {
    title: "ประวัติการยืม/คืน",
    description: "ดูประวัติและสถานะการยืมทั้งหมด และส่งคำขอคืนก่อนกำหนด",
    icon: History,
    href: "/history",
    color: "bg-gradient-to-r from-gray-700 to-gray-800",
    hoverColor: "hover:from-gray-800 hover:to-gray-900",
    textColor: "text-white",
    iconBgColor: "bg-gray-800",
    descriptionColor: "text-gray-300",
  },
  {
    title: "ปฏิทินการยืม",
    description: "ดูปฏิทินและตารางการยืมอุปกรณ์",
    icon: Calendar,
    href: "/schedule",
    color: "bg-gradient-to-r from-gray-500 to-gray-600",
    hoverColor: "hover:from-gray-600 hover:to-gray-700",
    textColor: "text-white",
    iconBgColor: "bg-gray-600",
    descriptionColor: "text-gray-200",
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

  // Determine if the user is an admin based on fetched userData
  const isAdmin = userData?.role === 'ADMIN' || userData?.role === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {/* Display appropriate header based on admin status */}
              {isAdmin ? 'แดชบอร์ดผู้ดูแล' : 'แดชบอร์ด'}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              {/* Display appropriate subtitle based on admin status */}
              {isAdmin
                ? 'ภาพรวมและสถิติการยืมอุปกรณ์ทั้งหมด'
                : `ยินดีต้อนรับ, ${userData?.displayName || user?.email?.split('@')[0] || 'ผู้ใช้'}`}
            </p>
          </motion.div>

          {/* Statistics Overview - Only render if stats are loaded */}
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-pulse">
                {[...Array(isAdmin ? 5 : 4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 h-24 sm:h-28">
                       <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                       <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
          ) : statistics ? (
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              {/* Card: Total */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    <Package className="text-gray-600" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {statistics.overview.total}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">ทั้งหมด</p>
                  </div>
                </div>
              </div>

              {/* Card: รออนุมัติ */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                    <Clock className="text-yellow-600" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                      {statistics.overview.pending}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">รออนุมัติ</p>
                  </div>
                </div>
              </div>

              {/* Card: อนุมัติแล้ว */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {statistics.overview.approved}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">อนุมัติแล้ว</p>
                  </div>
                </div>
              </div>

              {/* Card: คืนแล้ว */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <CheckCircle className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {statistics.overview.returned}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">คืนแล้ว</p>
                  </div>
                </div>
              </div>

              {/* Card: ปฏิเสธ (แสดงเฉพาะ Admin) */}
              {isAdmin && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                      <XCircle className="text-red-600" size={16} />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600">
                        {statistics.overview.rejected}
                      </p>
                      <p className="text-sm sm:text-base text-gray-600">ปฏิเสธ</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
              // Optional: Show a message if stats failed to load or user isn't logged in
              !statsLoading && <p className="text-gray-500 mb-8">ไม่สามารถโหลดสถิติได้</p>
          )}

          {/* Admin Analytics - Only render if admin and stats are loaded */}
          {isAdmin && statistics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Trends */}
              {statistics.monthlyTrends && statistics.monthlyTrends.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="text-red-600" size={24} />
                      แนวโน้มการยืม (6 เดือนที่ผ่านมา)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {statistics.monthlyTrends.map((item, index) => {
                      const maxCount = Math.max(1, ...statistics.monthlyTrends!.map(i => i.count)); // Ensure maxCount is at least 1
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

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
              ) : (
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center text-gray-500">
                       ไม่มีข้อมูลแนวโน้มการยืม
                   </div>
              )}

              {/* Top Equipment */}
              {statistics.topEquipment && statistics.topEquipment.length > 0 ? (
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
                          <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-sm"> {/* Adjusted font size */}
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
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center text-gray-500">
                        ไม่มีข้อมูลอุปกรณ์ยอดนิยม
                    </div>
                )}
            </div>
          )}

          {/* Quick Actions - Always visible if user is logged in */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAdmin && statistics ? 0.4 : 0.2 }} // Adjust delay based on whether admin sections are shown
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">เมนูด่วน</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {quickActions.map((action, index) => (
                  <motion.a
                    key={index}
                    href={action.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg ${action.color} ${action.hoverColor} ${action.textColor} transition-all duration-300 group`}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 ${action.iconBgColor} rounded-lg bg-opacity-80 flex-shrink-0`}>
                        <action.icon size={24} className="sm:w-7 sm:h-7" />
                      </div>
                      <ArrowRight
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1 flex-shrink-0"
                        size={20}
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{action.title}</h3>
                    <p className={`text-sm sm:text-base ${action.descriptionColor}`}>{action.description}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;