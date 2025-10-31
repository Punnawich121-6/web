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
        return "PENDING";
      case "APPROVED":
        return "APPROVED";
      case "ACTIVE":
        return "ACTIVE";
      case "RETURNED":
        return "RETURNED";
      case "REJECTED":
        return "REJECTED";
      case "OVERDUE":
        return "OVERDUE";
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
          <p className="text-gray-600 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <ActivityIcon className="text-red-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Whole system activities
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                  View all equipment borrowing and returning activities
                </p>
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">All</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-yellow-700 mb-1">Pending approval</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-700 mb-1">Borrowing</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-700 mb-1">Returned</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.returned}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-3 sm:p-4 col-span-2 sm:col-span-3 lg:col-span-1">
              <p className="text-xs sm:text-sm text-red-700 mb-1">Reject</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search equipment or borrowers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
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
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredActivities.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* Equipment Image */}
                    {record.equipment.image ? (
                      <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={record.equipment.image}
                          alt={record.equipment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        <Package className="text-gray-400" size={32} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 truncate">
                            {record.equipment.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {record.equipment.category} • {record.equipment.serialNumber}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            จำนวน: <span className="font-medium">{record.quantity}</span> ชิ้น
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {getStatusText(record.status)}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-md">
                        <UserIcon size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 truncate">
                          <span className="font-medium">{record.user.displayName}</span>
                          <span className="text-gray-500"> • {record.user.email}</span>
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>ยืม: <span className="font-medium">{new Date(record.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                          <Clock size={14} className="flex-shrink-0" />
                          <span>คืน: <span className="font-medium">{new Date(record.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>
                        </div>
                      </div>

                      {/* Purpose */}
                      {record.purpose && (
                        <div className="mb-3">
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium text-gray-700">วัตถุประสงค์:</span> {record.purpose}
                          </p>
                        </div>
                      )}

                      {/* View Details Button */}
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-h-[40px] touch-manipulation"
                      >
                        <Eye size={16} />
                        ดูรายละเอียดเพิ่มเติม
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 touch-manipulation"
          onClick={() => setSelectedRecord(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-full sm:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between z-10">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  รายละเอียดการยืม
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">ID: {selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="ปิด"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Equipment Image */}
              {selectedRecord.equipment.image ? (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedRecord.equipment.image}
                    alt={selectedRecord.equipment.name}
                    className="w-full h-48 sm:h-64 lg:h-80 object-cover"
                  />
                </div>
              ) : (
                <div className="mb-6 rounded-lg bg-gray-100 flex items-center justify-center h-48 sm:h-64">
                  <Package className="text-gray-400" size={64} />
                </div>
              )}

              {/* Equipment Details */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {selectedRecord.equipment.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedRecord.equipment.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {selectedRecord.equipment.serialNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">จำนวนที่ยืม</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRecord.quantity} <span className="text-base font-normal text-gray-600">ชิ้น</span>
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">สถานะ</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedRecord.status
                      )}`}
                    >
                      {getStatusIcon(selectedRecord.status)}
                      {getStatusText(selectedRecord.status)}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium mb-2">ข้อมูลผู้ยืม</p>
                  <div className="flex items-start gap-2">
                    <UserIcon size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedRecord.user.displayName}</p>
                      <p className="text-sm text-gray-600 break-all">{selectedRecord.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-green-600" />
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">วันที่ยืม</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedRecord.startDate)}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={16} className="text-orange-600" />
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">กำหนดคืน</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedRecord.endDate)}
                    </p>
                  </div>
                </div>

                {selectedRecord.purpose && (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">วัตถุประสงค์</p>
                    <p className="text-sm sm:text-base text-gray-900">{selectedRecord.purpose}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4 sm:p-6 rounded-lg">
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-red-600" />
                    Timeline กิจกรรม
                  </h4>
                  <div className="space-y-4 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    {formatTimestamp(selectedRecord.createdAt) && (
                      <div className="flex gap-3 relative">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md z-10">
                          <Calendar size={16} className="text-white" />
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            สร้างคำขอยืม
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.createdAt)?.date}{" "}
                            เวลา {formatTimestamp(selectedRecord.createdAt)?.time} น.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.approvedAt && (
                      <div className="flex gap-3 relative">
                        <div
                          className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md z-10 ${
                            selectedRecord.status === "REJECTED"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        >
                          {selectedRecord.status === "REJECTED" ? (
                            <XCircle size={16} className="text-white" />
                          ) : (
                            <CheckCircle size={16} className="text-white" />
                          )}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg border ${
                          selectedRecord.status === "REJECTED"
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {selectedRecord.status === "REJECTED"
                              ? "❌ ปฏิเสธคำขอ"
                              : "✅ อนุมัติคำขอ"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.approvedAt)?.date}{" "}
                            เวลา {formatTimestamp(selectedRecord.approvedAt)?.time} น.
                          </p>
                          {selectedRecord.approvedBy && (
                            <p className="text-xs sm:text-sm text-gray-700 mt-1">
                              <span className="font-medium">โดย:</span> {selectedRecord.approvedBy.displayName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRecord.actualReturnDate && (
                      <div className="flex gap-3 relative">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-md z-10">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1 bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            🎉 คืนอุปกรณ์แล้ว
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.actualReturnDate)?.date}{" "}
                            เวลา {formatTimestamp(selectedRecord.actualReturnDate)?.time} น.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRecord.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg ml-11">
                        <p className="text-xs sm:text-sm font-semibold text-red-900 mb-1.5">
                          💬 เหตุผลที่ปฏิเสธ:
                        </p>
                        <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                          {selectedRecord.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex justify-center">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Activity;
