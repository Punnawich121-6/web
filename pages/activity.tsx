"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../components/LibraryNavbar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Filter,
  Search,
  Eye,
  User as UserIcon,
  Activity as ActivityIcon,
} from "lucide-react";

interface ActivityRecord {
  id: string;
  user: {
    displayName: string;
    email: string;
  };
  equipment: {
    name: string;
    category: string;
    serialNumber: string;
    image: string;
  };
  quantity: number;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED" | "ACTIVE" | "OVERDUE";
  purpose: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: {
    displayName: string;
    email: string;
  };
  rejectionReason?: string;
}

const Activity = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      fetchActivities();
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchActivities = async () => {
    try {
      setDataLoading(true);

      const response = await fetch('/api/activity', {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setActivities(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "RETURNED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
      case "ACTIVE":
        return <CheckCircle size={18} />;
      case "PENDING":
        return <Clock size={18} />;
      case "RETURNED":
        return <CheckCircle size={18} />;
      case "REJECTED":
        return <XCircle size={18} />;
      case "OVERDUE":
        return <AlertCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "รออนุมัติ";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "ACTIVE":
        return "กำลังยืม";
      case "RETURNED":
        return "คืนแล้ว";
      case "REJECTED":
        return "ปฏิเสธ";
      case "OVERDUE":
        return "เกินกำหนด";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const filteredActivities = activities.filter((record) => {
    const matchesStatus =
      selectedStatus === "all" ||
      record.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      record.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === "PENDING").length,
    approved: activities.filter(a => a.status === "APPROVED" || a.status === "ACTIVE").length,
    returned: activities.filter(a => a.status === "RETURNED").length,
    rejected: activities.filter(a => a.status === "REJECTED").length,
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
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <ActivityIcon className="text-red-600" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  กิจกรรมทั้งระบบ
                </h1>
                <p className="text-lg text-gray-600">
                  ดูกิจกรรมการยืม-คืนอุปกรณ์ทั้งหมด
                </p>
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">ทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
              <p className="text-sm text-yellow-700 mb-1">รออนุมัติ</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
              <p className="text-sm text-green-700 mb-1">กำลังยืม</p>
              <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
              <p className="text-sm text-blue-700 mb-1">คืนแล้ว</p>
              <p className="text-3xl font-bold text-blue-900">{stats.returned}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
              <p className="text-sm text-red-700 mb-1">ปฏิเสธ</p>
              <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ค้นหาอุปกรณ์หรือผู้ยืม..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="PENDING">รออนุมัติ</option>
                  <option value="APPROVED">อนุมัติแล้ว</option>
                  <option value="ACTIVE">กำลังยืม</option>
                  <option value="RETURNED">คืนแล้ว</option>
                  <option value="REJECTED">ปฏิเสธ</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Activities List */}
          {dataLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <ActivityIcon className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่พบกิจกรรม
              </h3>
              <p className="text-gray-600">ยังไม่มีกิจกรรมในระบบ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredActivities.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Equipment Image */}
                    {record.equipment.image && (
                      <img
                        src={record.equipment.image}
                        alt={record.equipment.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {record.equipment.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {record.equipment.category} • จำนวน {record.quantity} ชิ้น
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {getStatusText(record.status)}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <UserIcon size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {record.user.displayName}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>ยืม: {formatDate(record.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>คืน: {formatDate(record.endDate)}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                รายละเอียดการยืม
              </h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Equipment Image */}
            {selectedRecord.equipment.image && (
              <img
                src={selectedRecord.equipment.image}
                alt={selectedRecord.equipment.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedRecord.equipment.name}
                </h3>
                <p className="text-gray-600">
                  {selectedRecord.equipment.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">จำนวน</p>
                  <p className="font-medium text-gray-900">
                    {selectedRecord.quantity} ชิ้น
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedRecord.status
                    )}`}
                  >
                    {getStatusIcon(selectedRecord.status)}
                    {getStatusText(selectedRecord.status)}
                  </span>
                </div>
              </div>

              {/* User */}
              <div>
                <p className="text-sm text-gray-600 mb-1">ผู้ยืม</p>
                <p className="font-medium text-gray-900">
                  {selectedRecord.user.displayName}
                </p>
              </div>

              {/* Dates */}
              <div>
                <p className="text-sm text-gray-600 mb-1">วันที่ยืม</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedRecord.startDate)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">กำหนดคืน</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedRecord.endDate)}
                </p>
              </div>

              {selectedRecord.purpose && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">วัตถุประสงค์</p>
                  <p className="text-gray-900">{selectedRecord.purpose}</p>
                </div>
              )}

              {/* Timeline */}
              {user && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Timeline
                  </h4>
                  <div className="space-y-4">
                    {formatTimestamp(selectedRecord.createdAt) && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            สร้างคำขอยืม
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.createdAt)?.date}{" "}
                            {formatTimestamp(selectedRecord.createdAt)?.time}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.approvedAt && (
                      <div className="flex gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedRecord.status === "REJECTED"
                              ? "bg-red-100"
                              : "bg-green-100"
                          }`}
                        >
                          {selectedRecord.status === "REJECTED" ? (
                            <XCircle
                              size={16}
                              className="text-red-600"
                            />
                          ) : (
                            <CheckCircle
                              size={16}
                              className="text-green-600"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedRecord.status === "REJECTED"
                              ? "ปฏิเสธคำขอ"
                              : "อนุมัติคำขอ"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.approvedAt)?.date}{" "}
                            {formatTimestamp(selectedRecord.approvedAt)?.time}
                          </p>
                          {selectedRecord.approvedBy && (
                            <p className="text-sm text-gray-500">
                              โดย {selectedRecord.approvedBy.displayName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRecord.actualReturnDate && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            คืนอุปกรณ์แล้ว
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.actualReturnDate)
                              ?.date}{" "}
                            {formatTimestamp(selectedRecord.actualReturnDate)
                              ?.time}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.rejectionReason && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-1">
                          เหตุผลที่ปฏิเสธ:
                        </p>
                        <p className="text-sm text-red-700">
                          {selectedRecord.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Activity;
