"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../components/LibraryNavbar";
import UserRoleBadge from "../components/UserRoleBadge";
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  History,
} from "lucide-react";

interface BorrowRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  borrowDate: string;
  returnDate: string;
  equipment: {
    name: string;
    serialNumber: string;
  };
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      if (session?.user) {
        fetchUserBorrowRequests();
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        if (session?.user) {
          fetchUserBorrowRequests();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserBorrowRequests = async () => {
    try {
      setStatsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setBorrowRequests([]);
        return;
      }

      const token = session.access_token;
      const response = await fetch(`/api/borrow?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform data to match interface
          const transformed = result.data.map((req: any) => ({
            id: req.id,
            status: req.status,
            borrowDate: req.startDate,
            returnDate: req.endDate,
            equipment: {
              name: req.equipment.name,
              serialNumber: req.equipment.serialNumber,
            },
          }));
          setBorrowRequests(transformed);
        } else {
          setBorrowRequests([]);
        }
      } else {
        setBorrowRequests([]);
      }
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      setBorrowRequests([]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Calculate stats from real borrow data
  const dashboardStats = [
    {
      icon: Package,
      title: "อุปกรณ์ที่กำลังยืม",
      count: borrowRequests.filter(req => req.status === 'APPROVED').length.toString(),
      color: "blue",
      description: "รายการที่ยืมอยู่",
    },
    {
      icon: Clock,
      title: "รอการอนุมัติ",
      count: borrowRequests.filter(req => req.status === 'PENDING').length.toString(),
      color: "yellow",
      description: "คำขอที่รออนุมัติ",
    },
    {
      icon: CheckCircle,
      title: "ยืมสำเร็จแล้ว",
      count: borrowRequests.filter(req => req.status === 'RETURNED').length.toString(),
      color: "green",
      description: "ครั้งที่ยืมทั้งหมด",
    },
    {
      icon: Calendar,
      title: "ใกล้ครบกำหนดคืน",
      count: borrowRequests.filter(req => {
        if (req.status !== 'APPROVED') return false;
        const returnDate = new Date(req.returnDate);
        const today = new Date();
        const daysDiff = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysDiff <= 3 && daysDiff >= 0;
      }).length.toString(),
      color: "red",
      description: "อุปกรณ์ที่ต้องคืนเร็วๆ นี้",
    },
  ];

  // Get recent activity from borrow requests
  const recentActivity = borrowRequests
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 5)
    .map(request => ({
      id: request.id,
      action: request.status === 'PENDING' ? 'ส่งคำขอยืม' :
              request.status === 'APPROVED' ? 'ยืมอุปกรณ์สำเร็จ' :
              request.status === 'RETURNED' ? 'คืนอุปกรณ์แล้ว' : 'คำขอถูกปฏิเสธ',
      item: request.equipment.name,
      date: request.borrowDate,
      status: request.status.toLowerCase(),
      returnDate: request.returnDate,
    }));

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "อนุมัติแล้ว";
      case "pending":
        return "รออนุมัติ";
      case "returned":
        return "คืนแล้ว";
      case "rejected":
        return "ปฏิเสธ";
      default:
        return "ไม่ทราบสถานะ";
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

      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  ยินดีต้อนรับ, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
                </h1>
                <p className="text-2xl text-gray-600">
                  จัดการการยืมอุปกรณ์ของคุณได้อย่างสะดวก
                </p>
              </div>
              <div className="flex-shrink-0">
                <UserRoleBadge />
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : (
              dashboardStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-4xl font-bold text-${stat.color}-600`}>
                    {stat.count}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                  {stat.title}
                </h3>
                <p className="text-base text-gray-500">{stat.description}</p>
              </motion.div>
              ))
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              การดำเนินการด่วน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.a
                  key={index}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`${action.color} ${action.hoverColor} text-white rounded-xl p-6 block group transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <action.icon className="w-8 h-8" />
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90 text-base">
                    {action.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900">
                กิจกรรมล่าสุด
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {activity.action}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            {getStatusText(activity.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1 text-lg">
                          {activity.item}
                        </p>
                        <div className="flex gap-4 text-base text-gray-500">
                          <span>วันที่: {activity.date}</span>
                          {activity.returnDate && (
                            <span>กำหนดคืน: {activity.returnDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <button className="text-red-600 hover:text-red-700 text-base font-medium">
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">ยังไม่มีกิจกรรม</p>
                  <p className="text-base mt-2">เริ่มยืมอุปกรณ์เพื่อดูประวัติการใช้งาน</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <a
                href="/Borrowing_History"
                className="text-red-600 hover:text-red-700 font-medium text-base"
              >
                ดูประวัติทั้งหมด →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
