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
  Home,
  Plus,
  ArrowRight,
  User,
  FileText,
} from "lucide-react";

interface BorrowRecord {
  id: string;
  equipmentName: string;
  equipmentId: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: "pending" | "approved" | "returned" | "overdue" | "rejected";
  purpose: string;
  notes?: string;
  image: string;
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: {
    displayName?: string;
    email: string;
  };
  rejectionReason?: string;
}

const BorrowingHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(
    null
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      if (session?.user) {
        fetchBorrowHistory(session.user);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchBorrowHistory(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchBorrowHistory = async (currentUser?: User) => {
    try {
      setDataLoading(true);
      const userToUse = currentUser || user;
      if (!userToUse) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/borrow?token=${encodeURIComponent(token)}&myOnly=true`, {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform API response to match the interface
          const transformedHistory = result.data.map((request: any) => ({
          id: request.id,
          equipmentName: request.equipment.name,
          equipmentId: request.equipment.id,
          quantity: request.quantity,
          borrowDate: new Date(request.startDate).toLocaleDateString('th-TH'),
          returnDate: new Date(request.endDate).toLocaleDateString('th-TH'),
          actualReturnDate: request.actualReturnDate ? new Date(request.actualReturnDate).toLocaleDateString('th-TH') : undefined,
          status: request.status.toLowerCase(),
          purpose: request.purpose,
          notes: request.notes || undefined,
          image: request.equipment.image || '/placeholder-image.jpg',
          createdAt: request.createdAt,
          approvedAt: request.approvedAt,
          approvedBy: request.approver,
          rejectionReason: request.rejectionReason,
          }));
          setBorrowHistory(transformedHistory);
        } else {
          setBorrowHistory([]);
        }
      } else {
        console.error('Failed to fetch borrow history');
        setBorrowHistory([]);
      }
    } catch (error) {
      console.error('Error fetching borrow history:', error);
      setBorrowHistory([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Check for new pending request from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("status") === "pending") {
      // Show success message for new pending request
      setTimeout(() => {
        alert("ส่งคำขอยืมอุปกรณ์สำเร็จ! รอการอนุมัติจากเจ้าหน้าที่");
      }, 500);
    }
  }, []);


  const statusOptions = [
    {
      value: "all",
      label: "ทั้งหมด",
      icon: Package,
      count: borrowHistory.length,
    },
    {
      value: "pending",
      label: "รออนุมัติ",
      icon: Clock,
      count: borrowHistory.filter((r) => r.status === "pending").length,
    },
    {
      value: "approved",
      label: "อนุมัติแล้ว",
      icon: CheckCircle,
      count: borrowHistory.filter((r) => r.status === "approved").length,
    },
    {
      value: "returned",
      label: "คืนแล้ว",
      icon: CheckCircle,
      count: borrowHistory.filter((r) => r.status === "returned").length,
    },
    {
      value: "overdue",
      label: "เกินกำหนด",
      icon: AlertCircle,
      count: borrowHistory.filter((r) => r.status === "overdue").length,
    },
    {
      value: "rejected",
      label: "ถูกปฏิเสธ",
      icon: XCircle,
      count: borrowHistory.filter((r) => r.status === "rejected").length,
    },
  ];

  const filteredHistory = borrowHistory.filter((record) => {
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;
    const matchesSearch =
      record.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "returned":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "rejected":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รออนุมัติ";
      case "approved":
        return "อนุมัติแล้ว";
      case "returned":
        return "คืนแล้ว";
      case "overdue":
        return "เกินกำหนด";
      case "rejected":
        return "ถูกปฏิเสธ";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return CheckCircle;
      case "returned":
        return CheckCircle;
      case "overdue":
        return AlertCircle;
      case "rejected":
        return XCircle;
      default:
        return Package;
    }
  };

  // Format timestamp to Thai date and time
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">
                  ประวัติการยืมอุปกรณ์
                </h1>
                <p className="text-2xl text-gray-600">
                  ติดตามสถานะและประวัติการยืมอุปกรณ์ทั้งหมดของคุณ
                </p>
              </div>
              <div className="flex gap-3 mt-4 lg:mt-0">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base"
                >
                  <Home size={18} />
                  Dashboard
                </a>
                <a
                  href="/schedule"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-base"
                >
                  <Calendar size={18} />
                  Schedule
                </a>
                <a
                  href="/equipment/catalog"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base"
                >
                  <Plus size={18} />
                  ยืมอุปกรณ์ใหม่
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            {statusOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedStatus === option.value
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <option.icon size={24} />
                </div>
                <div className="text-3xl font-bold mb-1">{option.count}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </motion.button>
            ))}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="ค้นหาตามชื่ออุปกรณ์, รหัส, หรือวัตถุประสงค์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              />
            </div>
          </motion.div>

          {/* History List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {dataLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-xl">กำลังโหลดประวัติการยืม...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  ไม่พบประวัติการยืม
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  {selectedStatus === "all"
                    ? "คุณยังไม่เคยยืมอุปกรณ์ หรือลองเปลี่ยนคำค้นหา"
                    : `ไม่พบรายการที่มีสถานะ "${
                        statusOptions.find((s) => s.value === selectedStatus)
                          ?.label
                      }"`}
                </p>
                <a
                  href="/Equipment_Catalog_User"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-base"
                >
                  <Plus size={18} />
                  เริ่มยืมอุปกรณ์
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredHistory.map((record, index) => {
                  const StatusIcon = getStatusIcon(record.status);
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={record.image}
                            alt={record.equipmentName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xl">
                                {record.equipmentName}
                              </h3>
                              <p className="text-base text-gray-500">
                                รหัส: {record.equipmentId} | จำนวน:{" "}
                                {record.quantity} ชิ้น
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                <StatusIcon size={14} />
                                {getStatusText(record.status)}
                              </span>
                              <button
                                onClick={() => setSelectedRecord(record)}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="ดูรายละเอียด"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-base text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>ยืม: {record.borrowDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>กำหนดคืน: {record.returnDate}</span>
                            </div>
                            {record.actualReturnDate && (
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                <span>คืนแล้ว: {record.actualReturnDate}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 mb-2">
                            <p className="text-gray-700 text-base">
                              <span className="font-medium">วัตถุประสงค์:</span>{" "}
                              {record.purpose}
                            </p>
                            {record.createdAt && formatTimestamp(record.createdAt) && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <FileText size={14} />
                                สร้างคำขอ: {formatTimestamp(record.createdAt)?.date} เวลา {formatTimestamp(record.createdAt)?.time}
                              </p>
                            )}
                            {record.approvedAt && record.approvedBy && formatTimestamp(record.approvedAt) && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <User size={14} />
                                {record.status === 'rejected' ? 'ปฏิเสธ' : 'อนุมัติ'}โดย: {record.approvedBy.displayName || record.approvedBy.email} ({formatTimestamp(record.approvedAt)?.date} {formatTimestamp(record.approvedAt)?.time})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    รายละเอียดการยืม
                  </h3>
                  <p className="text-gray-600 text-lg">
                    #{selectedRecord.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedRecord.image}
                    alt={selectedRecord.equipmentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedRecord.equipmentName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-base">
                    <div>
                      <span className="font-medium text-gray-700">
                        รหัสอุปกรณ์:
                      </span>
                      <p className="text-gray-600">
                        {selectedRecord.equipmentId}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">จำนวน:</span>
                      <p className="text-gray-600">
                        {selectedRecord.quantity} ชิ้น
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">
                    ข้อมูลการยืม
                  </h5>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span>วันที่ยืม:</span>
                      <span className="font-medium">
                        {selectedRecord.borrowDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>กำหนดคืน:</span>
                      <span className="font-medium">
                        {selectedRecord.returnDate}
                      </span>
                    </div>
                    {selectedRecord.actualReturnDate && (
                      <div className="flex justify-between">
                        <span>วันที่คืนจริง:</span>
                        <span className="font-medium">
                          {selectedRecord.actualReturnDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">
                    สถานะ
                  </h5>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-base font-medium border ${getStatusColor(
                      selectedRecord.status
                    )}`}
                  >
                    {React.createElement(getStatusIcon(selectedRecord.status), {
                      size: 16,
                    })}
                    {getStatusText(selectedRecord.status)}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2 text-lg">
                  วัตถุประสงค์
                </h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-lg">
                  {selectedRecord.purpose}
                </p>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">
                    หมายเหตุ
                  </h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-lg">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {/* Timeline Section */}
              <div>
                <h5 className="font-medium text-gray-700 mb-4 text-lg flex items-center gap-2">
                  <Clock size={18} />
                  ประวัติการดำเนินการ
                </h5>
                <div className="space-y-4">
                  {/* Created */}
                  {selectedRecord.createdAt && (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">สร้างคำขอยืม</p>
                          {formatTimestamp(selectedRecord.createdAt) && (
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(selectedRecord.createdAt)?.time}
                            </span>
                          )}
                        </div>
                        {formatTimestamp(selectedRecord.createdAt) && (
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.createdAt)?.date}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Approved */}
                  {selectedRecord.status === 'approved' && selectedRecord.approvedAt && (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">อนุมัติคำขอ</p>
                          {formatTimestamp(selectedRecord.approvedAt) && (
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(selectedRecord.approvedAt)?.time}
                            </span>
                          )}
                        </div>
                        {formatTimestamp(selectedRecord.approvedAt) && (
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.approvedAt)?.date}
                          </p>
                        )}
                        {selectedRecord.approvedBy && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <User size={14} />
                            <span>โดย: {selectedRecord.approvedBy.displayName || selectedRecord.approvedBy.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejected */}
                  {selectedRecord.status === 'rejected' && selectedRecord.approvedAt && (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">ปฏิเสธคำขอ</p>
                          {formatTimestamp(selectedRecord.approvedAt) && (
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(selectedRecord.approvedAt)?.time}
                            </span>
                          )}
                        </div>
                        {formatTimestamp(selectedRecord.approvedAt) && (
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(selectedRecord.approvedAt)?.date}
                          </p>
                        )}
                        {selectedRecord.approvedBy && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                            <User size={14} />
                            <span>โดย: {selectedRecord.approvedBy.displayName || selectedRecord.approvedBy.email}</span>
                          </div>
                        )}
                        {selectedRecord.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">เหตุผล:</span> {selectedRecord.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Returned */}
                  {selectedRecord.status === 'returned' && selectedRecord.actualReturnDate && (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">คืนอุปกรณ์แล้ว</p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedRecord.actualReturnDate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BorrowingHistory;