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
  AlertTriangle,
  Package,
  Filter,
  Search,
  Eye,
  Check,
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  FileText,
  RotateCcw,
} from "lucide-react";

interface BorrowRequest {
  id: string;
  user: {
    displayName: string;
    email: string;
  };
  equipment: {
    name: string;
    category: string;
    serialNumber: string;
    image?: string;
  };
  quantity: number;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "RETURNED" | "OVERDUE" | "PENDING_RETURN";
  purpose: string;
  notes?: string;
  createdAt: string;
  approver?: {
    displayName: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  returnRequestedAt?: string;
  returnConfirmedBy?: string;
  returnConfirmedAt?: string;
}

const AdminBorrowRequests = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      if (session?.user) {
        await fetchBorrowRequests(session);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        if (session?.user) {
          await fetchBorrowRequests(session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Auto-select priority tab based on what needs attention
  useEffect(() => {
    if (borrowRequests.length > 0 && selectedStatus === "") {
      const pendingReturnCount = borrowRequests.filter(r => r.status === "PENDING_RETURN").length;
      const pendingCount = borrowRequests.filter(r => r.status === "PENDING").length;

      // Priority: PENDING_RETURN > PENDING > APPROVED
      if (pendingReturnCount > 0) {
        setSelectedStatus("PENDING_RETURN");
      } else if (pendingCount > 0) {
        setSelectedStatus("PENDING");
      } else {
        setSelectedStatus("APPROVED");
      }
    }
  }, [borrowRequests, selectedStatus]);

  const fetchBorrowRequests = async (sessionParam?: any) => {
    try {
      setDataLoading(true);

      // Use provided session or get current session
      let currentSession = sessionParam;
      if (!currentSession) {
        const { data: { session } } = await supabase.auth.getSession();
        currentSession = session;
      }

      if (!currentSession) {
        console.log('No session found');
        setBorrowRequests([]);
        return;
      }

      const token = currentSession.access_token;
      console.log('Fetching borrow requests with token');

      const response = await fetch(`/api/borrow?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Borrow requests result:', result);
        if (result.success && result.data) {
          setBorrowRequests(result.data);
        } else {
          console.error('No data in response:', result);
          setBorrowRequests([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch borrow requests:', response.status, errorText);
        setBorrowRequests([]);
      }
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      setBorrowRequests([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      setActionLoading(requestId);
      if (!user) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      const response = await fetch('/api/borrow/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          token,
          requestId,
          action,
          rejectionReason
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the requests list
        await fetchBorrowRequests();
        setSelectedRequest(null);
        alert(action === 'approve' ? 'Request approved successfully!' : 'Request rejected!');
      } else {
        alert('Error occurred: ' + result.error);
      }
    } catch (error) {
      console.error('Error handling request action:', error);
      alert('An error occurred during processing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReturn = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      if (!user) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      const response = await fetch(`/api/borrow/${requestId}/confirm-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh the requests list
        await fetchBorrowRequests();
        setSelectedRequest(null);
        alert('Equipment return confirmed!');
      } else {
        alert('Error occurred: ' + result.error);
      }
    } catch (error) {
      console.error('Error confirming return:', error);
      alert('An error occurred while confirming return');
    } finally {
      setActionLoading(null);
    }
  };

  // Section 1: Requests that need action
  const requestOptions = [
    {
      value: "PENDING",
      label: "Pending Approval",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      count: borrowRequests.filter((r) => r.status === "PENDING").length,
    },
    {
      value: "PENDING_RETURN",
      label: "Pending Return Verification",
      icon: RotateCcw,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      count: borrowRequests.filter((r) => r.status === "PENDING_RETURN").length,
    },
  ];

  // Section 2: Status overview
  const statusOptions = [
    {
      value: "APPROVED",
      label: "Approved",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
      count: borrowRequests.filter((r) => r.status === "APPROVED").length,
    },
    {
      value: "ACTIVE",
      label: "Borrowing",
      icon: Package,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      count: borrowRequests.filter((r) => r.status === "ACTIVE").length,
    },
    {
      value: "RETURNED",
      label: "Returned",
      icon: CheckCircle,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      count: borrowRequests.filter((r) => r.status === "RETURNED").length,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
      count: borrowRequests.filter((r) => r.status === "REJECTED").length,
    },
    {
      value: "OVERDUE",
      label: "Overdue",
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      count: borrowRequests.filter((r) => r.status === "OVERDUE").length,
    },
  ];

  // Calculate total pending actions
  const totalPendingActions = requestOptions.reduce((sum, option) => sum + option.count, 0);

  const filteredRequests = borrowRequests.filter((request) => {
    const matchesStatus = request.status === selectedStatus;
    const matchesSearch =
      request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    const allOptions = [...requestOptions, ...statusOptions];
    const option = allOptions.find(opt => opt.value === status);
    return option ? option.icon : Package;
  };

  const getStatusColor = (status: string) => {
    const allOptions = [...requestOptions, ...statusOptions];
    const option = allOptions.find(opt => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status: string) => {
    const allOptions = [...requestOptions, ...statusOptions];
    const option = allOptions.find(opt => opt.value === status);
    return option ? option.label : "Unknown Status";
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
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    Manage Equipment Borrow Requests
                  </h1>
                  {totalPendingActions > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                        className="bg-red-500 text-white rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 text-base sm:text-xl font-bold shadow-lg"
                      >
                        <span>{totalPendingActions}</span>
                        <span>!</span>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mt-1 sm:mt-2">
                  Approve or reject equipment borrow requests from users
                </p>
              </div>
            </div>
          </motion.div>

          {/* Section 1: Requests that need action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Requests Requiring Action</h2>
              {totalPendingActions > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold">
                  {totalPendingActions}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {requestOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 relative ${
                    selectedStatus === option.value
                      ? "border-red-600 bg-red-50 text-red-700 shadow-lg"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50 hover:shadow-md"
                  }`}
                >
                  {/* Notification Badge */}
                  {option.count > 0 && selectedStatus !== option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-bold shadow-lg"
                    >
                      {option.count}!
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-gray-100 flex-shrink-0">
                      <option.icon size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-0.5 sm:mb-1">{option.count}</div>
                      <div className="text-sm sm:text-base lg:text-lg font-medium">{option.label}</div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Section 2: All Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">All Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {statusOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedStatus === option.value
                      ? "border-red-600 bg-red-50 text-red-700 shadow-md"
                      : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1 sm:mb-2">
                    <option.icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{option.count}</div>
                  <div className="text-xs sm:text-sm font-medium">{option.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by equipment name, user, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base lg:text-lg"
              />
            </div>
          </motion.div>

          {/* Requests List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {dataLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-xl">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Package className="mx-auto mb-3 sm:mb-4 text-gray-400" size={40} />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">
                  No Requests Found
                </h3>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  There are currently no requests with status "{getStatusText(selectedStatus)}"
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map((request, index) => {
                  const StatusIcon = getStatusIcon(request.status);
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {request.equipment.image ? (
                            <img
                              src={request.equipment.image}
                              alt={request.equipment.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-gray-400" size={32} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl">
                                {request.equipment.name}
                              </h3>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                                {request.equipment.category} | Code: {request.equipment.serialNumber}
                              </p>
                              <p className="text-xs sm:text-sm lg:text-base text-gray-700 mt-1">
                                <UserIcon size={14} className="inline mr-1" />
                                {request.user.displayName} ({request.user.email})
                              </p>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                <StatusIcon size={12} />
                                {getStatusText(request.status)}
                              </span>
                              <button
                                onClick={() => setSelectedRequest(request)}
                                className="text-red-600 hover:text-red-700 p-2 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="View Details"
                              >
                                <Eye size={16} className="sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Calendar size={14} />
                              <span>Borrow: {new Date(request.startDate).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Clock size={14} />
                              <span>Return: {new Date(request.endDate).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <Package size={14} />
                              <span>Quantity: {request.quantity} pcs</span>
                            </div>
                          </div>

                          <p className="text-gray-700 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">
                            <span className="font-medium">Purpose:</span> {request.purpose}
                          </p>

                          {request.status === 'PENDING' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleRequestAction(request.id, 'approve')}
                                disabled={actionLoading === request.id}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                              >
                                {actionLoading === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Check size={16} />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for rejection (optional):');
                                  if (reason !== null) {
                                    handleRequestAction(request.id, 'reject', reason);
                                  }
                                }}
                                disabled={actionLoading === request.id}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                              >
                                <X size={16} />
                                Reject
                              </button>
                            </div>
                          )}

                          {request.status === 'PENDING_RETURN' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirmReturn(request.id)}
                                disabled={actionLoading === request.id}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                              >
                                {actionLoading === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                                Confirm Return
                              </button>
                            </div>
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
      {selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 touch-manipulation"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-full sm:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Borrow Request Details
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg break-all">#{selectedRequest.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl ml-2 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Equipment Info */}
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {selectedRequest.equipment.image ? (
                    <img
                      src={selectedRequest.equipment.image}
                      alt={selectedRequest.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-gray-400" size={32} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                    {selectedRequest.equipment.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <p className="text-gray-600">{selectedRequest.equipment.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Equipment Code:</span>
                      <p className="text-gray-600 break-all">{selectedRequest.equipment.serialNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Quantity:</span>
                      <p className="text-gray-600">{selectedRequest.quantity} pcs</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                          selectedRequest.status
                        )}`}
                      >
                        {React.createElement(getStatusIcon(selectedRequest.status), { size: 12 })}
                        {getStatusText(selectedRequest.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 text-base sm:text-lg">Borrower Information</h5>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span className="break-all">{selectedRequest.user.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="break-all">{selectedRequest.user.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Borrow Period</h5>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between gap-2">
                      <span>Borrow Date:</span>
                      <span className="font-medium text-right">
                        {new Date(selectedRequest.startDate).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Due Date:</span>
                      <span className="font-medium text-right">
                        {new Date(selectedRequest.endDate).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    {selectedRequest.returnRequestedAt && (
                      <div className="flex justify-between gap-2">
                        <span className="text-purple-700">Return Requested:</span>
                        <span className="font-medium text-purple-700 text-right">
                          {new Date(selectedRequest.returnRequestedAt).toLocaleDateString('en-US')} {new Date(selectedRequest.returnRequestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {selectedRequest.actualReturnDate && (
                      <div className="flex justify-between gap-2">
                        <span>Actual Return Date:</span>
                        <span className="font-medium text-right">
                          {new Date(selectedRequest.actualReturnDate).toLocaleDateString('en-US')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Request Information</h5>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between gap-2">
                      <span>Requested Date:</span>
                      <span className="font-medium text-right">
                        {new Date(selectedRequest.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    {selectedRequest.approver && (
                      <>
                        <div className="flex justify-between gap-2">
                          <span>Approved By:</span>
                          <span className="font-medium text-right">{selectedRequest.approver.displayName}</span>
                        </div>
                        {selectedRequest.approvedAt && (
                          <div className="flex justify-between gap-2">
                            <span>Approved Date:</span>
                            <span className="font-medium text-right">
                              {new Date(selectedRequest.approvedAt).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Purpose</h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm sm:text-base lg:text-lg">
                  {selectedRequest.purpose}
                </p>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Notes</h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm sm:text-base lg:text-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Rejection Reason</h5>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm sm:text-base lg:text-lg">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                Close
              </button>

              {selectedRequest.status === 'PENDING' && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    disabled={actionLoading === selectedRequest.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    {actionLoading === selectedRequest.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check size={16} />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):');
                      if (reason !== null) {
                        handleRequestAction(selectedRequest.id, 'reject', reason);
                      }
                    }}
                    disabled={actionLoading === selectedRequest.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              )}

              {selectedRequest.status === 'PENDING_RETURN' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleConfirmReturn(selectedRequest.id)}
                    disabled={actionLoading === selectedRequest.id}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    {actionLoading === selectedRequest.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Confirm Return
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminBorrowRequests;