"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import app from "../pages/firebase";
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
} from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Mock data for dashboard stats
  const dashboardStats = [
    {
      icon: Package,
      title: "อุปกรณ์ที่กำลังยืม",
      count: "3",
      color: "blue",
      description: "รายการที่ยืมอยู่",
    },
    {
      icon: Clock,
      title: "รอการอนุมัติ",
      count: "1",
      color: "yellow",
      description: "คำขอที่รออนุมัติ",
    },
    {
      icon: CheckCircle,
      title: "ยืมสำเร็จแล้ว",
      count: "12",
      color: "green",
      description: "ครั้งที่ยืมทั้งหมด",
    },
    {
      icon: Calendar,
      title: "ใกล้ครบกำหนดคืน",
      count: "1",
      color: "red",
      description: "อุปกรณ์ที่ต้องคืนเร็วๆ นี้",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "ยืมอุปกรณ์สำเร็จ",
      item: "โปรเจคเตอร์ Epson EB-X41",
      date: "2024-01-15",
      status: "approved",
      returnDate: "2024-01-20",
    },
    {
      id: 2,
      action: "ส่งคำขอยืม",
      item: "กล้องถ่ายรูป Canon EOS R6",
      date: "2024-01-14",
      status: "pending",
      returnDate: "2024-01-18",
    },
    {
      id: 3,
      action: "คืนอุปกรณ์แล้ว",
      item: "ไมโครโฟนไร้สาย",
      date: "2024-01-13",
      status: "returned",
      returnDate: "2024-01-13",
    },
  ];

  const quickActions = [
    {
      title: "เริ่มจองอุปกรณ์",
      description: "เลือกอุปกรณ์ที่ต้องการยืมจากแคตตาล็อก",
      icon: ShoppingCart,
      href: "/Equipment_Catalog_User",
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
      title: "รายงานสถิติ",
      description: "ดูสถิติการใช้งานและรายงานต่างๆ",
      icon: BarChart3,
      href: "/statistics",
      color: "bg-gradient-to-r from-green-600 to-green-700",
      hoverColor: "hover:from-green-700 hover:to-green-800",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "returned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "อนุมัติแล้ว";
      case "pending":
        return "รออนุมัติ";
      case "returned":
        return "คืนแล้ว";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">กำลังโหลด...</p>
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับ, {user?.displayName || user?.email?.split("@")[0]}
            </h1>
            <p className="text-xl text-gray-600">
              จัดการการยืมอุปกรณ์ของคุณได้อย่างสะดวก
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {dashboardStats.map((stat, index) => (
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
                  <span className={`text-3xl font-bold text-${stat.color}-600`}>
                    {stat.count}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
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
              <h2 className="text-2xl font-bold text-gray-900">
                กิจกรรมล่าสุด
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity, index) => (
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
                        <h3 className="font-semibold text-gray-900">
                          {activity.action}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {getStatusText(activity.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{activity.item}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>วันที่: {activity.date}</span>
                        {activity.returnDate && (
                          <span>กำหนดคืน: {activity.returnDate}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <a
                href="/Borrowing_History"
                className="text-red-600 hover:text-red-700 font-medium text-sm"
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
