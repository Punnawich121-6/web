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
  User as UserIcon,
  FileText,
  RotateCcw,
} from "lucide-react";

interface BorrowRecord {
  id: string;
  equipmentName: string;
  equipmentId: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: "pending" | "approved" | "returned" | "overdue" | "rejected" | "pending_return";
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
  returnRequestedAt?: string;
}

const History = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowHistory, setBorrowHistory] = useState<BorrowRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(
    null
  );
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [recordToReturn, setRecordToReturn] = useState<BorrowRecord | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

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
          const transformedHistory = result.data.map((request: any) => {
            // Format dates consistently by extracting the date part and formatting in Thai locale
            const formatDate = (dateString: string) => {
              const date = new Date(dateString);
              const year = date.getFullYear() + 543; // Convert to Buddhist Era
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${day}/${month}/${year}`;
            };

            return {
              id: request.id,
              equipmentName: request.equipment.name,
              equipmentId: request.equipment.id,
              quantity: request.quantity,
              borrowDate: formatDate(request.startDate),
              returnDate: formatDate(request.endDate),
              actualReturnDate: request.actualReturnDate ? formatDate(request.actualReturnDate) : undefined,
              status: request.status.toLowerCase(),
              purpose: request.purpose,
              notes: request.notes || undefined,
              image: request.equipment.image || '/placeholder-image.jpg',
              createdAt: request.createdAt,
              approvedAt: request.approvedAt,
              approvedBy: request.approver,
              rejectionReason: request.rejectionReason,
            };
          });
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("status") === "pending") {
      setTimeout(() => {
        alert("Equipment borrow request submitted successfully! Awaiting staff approval");
      }, 500);
    }
  }, []);

  const handleReturnItem = async () => {
    if (!recordToReturn || !user) return;

    try {
      setReturnLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert("Please log in again");
        return;
      }

      const response = await fetch(`/api/borrow/${recordToReturn.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Equipment return request submitted successfully! Awaiting staff verification");
        setShowReturnModal(false);
        setRecordToReturn(null);
        if (session?.user) {
          await fetchBorrowHistory(session.user);
        }
      } else {
        alert(`An error occurred: ${result.error || 'Unable to submit equipment return request'}`);
      }
    } catch (error) {
      console.error('Error returning item:', error);
      alert("An error occurred while returning equipment. Please try again");
    } finally {
      setReturnLoading(false);
    }
  };

  const openReturnModal = (record: BorrowRecord) => {
    setRecordToReturn(record);
    setShowReturnModal(true);
  };

  const statusOptions = [
    {
      value: "all",
      label: "all",
      icon: Package,
      count: borrowHistory.length,
    },
    {
      value: "pending",
      label: "pending",
      icon: Clock,
      count: borrowHistory.filter((r) => r.status === "pending").length,
    },
    {
      value: "approved",
      label: "approved",
      icon: CheckCircle,
      count: borrowHistory.filter((r) => r.status === "approved").length,
    },
    {
      value: "pending_return",
      label: "pending_return",
      icon: RotateCcw,
      count: borrowHistory.filter((r) => r.status === "pending_return").length,
    },
    {
      value: "returned",
      label: "returned",
      icon: CheckCircle,
      count: borrowHistory.filter((r) => r.status === "returned").length,
    },
    {
      value: "overdue",
      label: "overdue",
      icon: AlertCircle,
      count: borrowHistory.filter((r) => r.status === "overdue").length,
    },
    {
      value: "rejected",
      label: "rejected",
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
      case "pending_return":
        return "bg-purple-100 text-purple-800 border-purple-200";
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
        return "pending";
      case "approved":
        return "approved";
      case "pending_return":
        return "pending_return";
      case "returned":
        return "returned";
      case "overdue":
        return "overdue";
      case "rejected":
        return "rejected";
      default:
        return "Unknown status";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return CheckCircle;
      case "pending_return":
        return RotateCcw;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  ประวัติการยืมอุปกรณ์
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600">
                  ติดตามสถานะและประวัติการยืมอุปกรณ์ทั้งหมดของคุณ
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 lg:mt-0">
                <a
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                  แดชบอร์ด
                </a>
                <a
                  href="/schedule"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                  Schedule
                </a>
                <a
                  href="/equipment/catalog"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                  Borrow New Equipment
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {statusOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[44px] touch-manipulation ${
                  selectedStatus === option.value
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <option.icon className="w-5 h-5 sm:w-6 sm:h-6" size={24} />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{option.count}</div>
                <div className="text-xs sm:text-sm font-medium">{option.label}</div>
              </motion.button>
            ))}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by equipment name, code, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base lg:text-lg touch-manipulation"
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
              <div className="p-8 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl">Loading borrowing history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400 w-10 h-10 sm:w-12 sm:h-12" size={48} />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  No borrowing history found
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base lg:text-lg">
                  {selectedStatus === "all"
                    ? "You have not borrowed any equipment yet, or try changing your search"
                    : `No items found with status "${
                        statusOptions.find((s) => s.value === selectedStatus)
                          ?.label
                      }"`}
                </p>
                <a
                  href="/equipment/catalog"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                  Start Borrowing Equipment
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
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={record.image}
                            alt={record.equipmentName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl">
                                {record.equipmentName}
                              </h3>
                              <p className="text-sm sm:text-base text-gray-500">
                                Code: {record.equipmentId} | quantity:{" "}
                                {record.quantity} Piece
                              </p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" size={14} />
                                {getStatusText(record.status)}
                              </span>
                              <button
                                onClick={() => setSelectedRecord(record)}
                                className="text-red-600 hover:text-red-700 p-1 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" size={16} />
                              <span>Borrow: {record.borrowDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" size={16} />
                              <span>Return Due Date: {record.returnDate}</span>
                            </div>
                            {record.actualReturnDate && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" size={16} />
                                <span>Returned: {record.actualReturnDate}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm sm:text-base mb-3">
                            <span className="font-medium">Purpose:</span>{" "}
                            {record.purpose}
                          </p>

                          {record.status === "approved" && (
                            <button
                              onClick={() => openReturnModal(record)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                            >
                              <RotateCcw className="w-4 h-4" size={16} />
                              Return Equipment
                            </button>
                          )}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Borrowing Details
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    #{selectedRecord.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={selectedRecord.image}
                    alt={selectedRecord.equipmentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    {selectedRecord.equipmentName}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                    <div>
                      <span className="font-medium text-gray-700">
                        Equipment Code:
                      </span>
                      <p className="text-gray-600">
                        {selectedRecord.equipmentId}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">quantity:</span>
                      <p className="text-gray-600">
                        {selectedRecord.quantity} Piece
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">
                    Borrowing Information
                  </h5>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Borrow Date:</span>
                      <span className="font-medium">
                        {selectedRecord.borrowDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return Due Date:</span>
                      <span className="font-medium">
                        {selectedRecord.returnDate}
                      </span>
                    </div>
                    {selectedRecord.actualReturnDate && (
                      <div className="flex justify-between">
                        <span>Actual Return Date:</span>
                        <span className="font-medium">
                          {selectedRecord.actualReturnDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">
                    Status
                  </h5>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-sm sm:text-base font-medium border ${getStatusColor(
                      selectedRecord.status
                    )}`}
                  >
                    {React.createElement(getStatusIcon(selectedRecord.status), {
                      size: 16,
                      className: "w-4 h-4",
                    })}
                    {getStatusText(selectedRecord.status)}
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">
                  วัตถุประสงค์
                </h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm sm:text-base lg:text-lg">
                  {selectedRecord.purpose}
                </p>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">
                    Note
                  </h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm sm:text-base lg:text-lg">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnModal && recordToReturn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-full sm:max-w-md w-full"
          >
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Confirm Equipment Return
              </h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                คุณต้องการส่งคำขอคืนอุปกรณ์ <strong>{recordToReturn.equipmentName}</strong> หรือไม่?
              </p>
              <p className="text-sm sm:text-base text-yellow-700 bg-yellow-50 p-3 rounded-lg mb-4">
                หมายเหตุ: หลังจากส่งคำขอ เจ้าหน้าที่จะตรวจสอบสภาพอุปกรณ์และอนุมัติการคืน
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setRecordToReturn(null);
                  }}
                  disabled={returnLoading}
                  className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReturnItem}
                  disabled={returnLoading}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  {returnLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>กำลังส่งคำขอ...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" size={16} />
                      <span>Confirm Return</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default History;
