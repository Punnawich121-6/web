"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import app from "../../lib/firebase";
import LibraryNavbar from "../../components/LibraryNavbar";
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "RETURNED" | "OVERDUE";
  purpose: string;
  notes?: string;
  createdAt: string;
  approver?: {
    displayName: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
}

const AdminBorrowRequests = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchBorrowRequests();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchBorrowRequests = async () => {
    try {
      setDataLoading(true);
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/borrow?token=${encodeURIComponent(token)}`, {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setBorrowRequests(result.data);
        } else {
          setBorrowRequests([]);
        }
      } else {
        console.error('Failed to fetch borrow requests');
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

      const token = await user.getIdToken();
      const response = await fetch('/api/borrow/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        alert(action === 'approve' ? 'คำขออนุมัติแล้ว!' : 'คำขอถูกปฏิเสธแล้ว!');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      console.error('Error handling request action:', error);
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setActionLoading(null);
    }
  };

  const statusOptions = [
    {
      value: "PENDING",
      label: "รออนุมัติ",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      count: borrowRequests.filter((r) => r.status === "PENDING").length,
    },
    {
      value: "APPROVED",
      label: "อนุมัติแล้ว",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
      count: borrowRequests.filter((r) => r.status === "APPROVED").length,
    },
    {
      value: "ACTIVE",
      label: "กำลังยืม",
      icon: Package,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      count: borrowRequests.filter((r) => r.status === "ACTIVE").length,
    },
    {
      value: "RETURNED",
      label: "คืนแล้ว",
      icon: CheckCircle,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      count: borrowRequests.filter((r) => r.status === "RETURNED").length,
    },
    {
      value: "REJECTED",
      label: "ปฏิเสธ",
      icon: XCircle,
      color: "bg-red-100 text-red-800 border-red-200",
      count: borrowRequests.filter((r) => r.status === "REJECTED").length,
    },
    {
      value: "OVERDUE",
      label: "เกินกำหนด",
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      count: borrowRequests.filter((r) => r.status === "OVERDUE").length,
    },
  ];

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
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.icon : Package;
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : "ไม่ทราบสถานะ";
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
                  จัดการคำขอยืมอุปกรณ์
                </h1>
                <p className="text-2xl text-gray-600">
                  อนุมัติหรือปฏิเสธคำขอยืมอุปกรณ์จากผู้ใช้
                </p>
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

          {/* Search */}
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
                placeholder="ค้นหาตามชื่ออุปกรณ์, ผู้ใช้, หรือวัตถุประสงค์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
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
                <p className="text-gray-600 text-xl">กำลังโหลดคำขอ...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  ไม่พบคำขอ
                </h3>
                <p className="text-gray-600 text-lg">
                  ไม่มีคำขอที่มีสถานะ "{getStatusText(selectedStatus)}" ในขณะนี้
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
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
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
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xl">
                                {request.equipment.name}
                              </h3>
                              <p className="text-base text-gray-500">
                                {request.equipment.category} | รหัส: {request.equipment.serialNumber}
                              </p>
                              <p className="text-base text-gray-700 mt-1">
                                <UserIcon size={16} className="inline mr-1" />
                                {request.user.displayName} ({request.user.email})
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                <StatusIcon size={14} />
                                {getStatusText(request.status)}
                              </span>
                              <button
                                onClick={() => setSelectedRequest(request)}
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
                              <span>ยืม: {new Date(request.startDate).toLocaleDateString('th-TH')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>คืน: {new Date(request.endDate).toLocaleDateString('th-TH')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package size={16} />
                              <span>จำนวน: {request.quantity} ชิ้น</span>
                            </div>
                          </div>

                          <p className="text-gray-700 text-base mb-3">
                            <span className="font-medium">วัตถุประสงค์:</span> {request.purpose}
                          </p>

                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRequestAction(request.id, 'approve')}
                                disabled={actionLoading === request.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Check size={16} />
                                )}
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('เหตุผลในการปฏิเสธ (ไม่จำเป็น):');
                                  if (reason !== null) {
                                    handleRequestAction(request.id, 'reject', reason);
                                  }
                                }}
                                disabled={actionLoading === request.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                <X size={16} />
                                ปฏิเสธ
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
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    รายละเอียดคำขอยืม
                  </h3>
                  <p className="text-gray-600 text-lg">#{selectedRequest.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Equipment Info */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {selectedRequest.equipment.image ? (
                    <img
                      src={selectedRequest.equipment.image}
                      alt={selectedRequest.equipment.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-gray-400" size={40} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-gray-900 mb-2">
                    {selectedRequest.equipment.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-base">
                    <div>
                      <span className="font-medium text-gray-700">หมวดหมู่:</span>
                      <p className="text-gray-600">{selectedRequest.equipment.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">รหัสอุปกรณ์:</span>
                      <p className="text-gray-600">{selectedRequest.equipment.serialNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">จำนวน:</span>
                      <p className="text-gray-600">{selectedRequest.quantity} ชิ้น</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">สถานะ:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(
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
                <h5 className="font-medium text-gray-700 mb-3 text-lg">ข้อมูลผู้ขอยืม</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span>{selectedRequest.user.displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{selectedRequest.user.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">ระยะเวลายืม</h5>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span>วันที่ยืม:</span>
                      <span className="font-medium">
                        {new Date(selectedRequest.startDate).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>กำหนดคืน:</span>
                      <span className="font-medium">
                        {new Date(selectedRequest.endDate).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    {selectedRequest.actualReturnDate && (
                      <div className="flex justify-between">
                        <span>วันที่คืนจริง:</span>
                        <span className="font-medium">
                          {new Date(selectedRequest.actualReturnDate).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">ข้อมูลคำขอ</h5>
                  <div className="space-y-2 text-base">
                    <div className="flex justify-between">
                      <span>วันที่ขอ:</span>
                      <span className="font-medium">
                        {new Date(selectedRequest.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                    {selectedRequest.approver && (
                      <>
                        <div className="flex justify-between">
                          <span>ผู้อนุมัติ:</span>
                          <span className="font-medium">{selectedRequest.approver.displayName}</span>
                        </div>
                        {selectedRequest.approvedAt && (
                          <div className="flex justify-between">
                            <span>วันที่อนุมัติ:</span>
                            <span className="font-medium">
                              {new Date(selectedRequest.approvedAt).toLocaleDateString('th-TH')}
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
                <h5 className="font-medium text-gray-700 mb-2 text-lg">วัตถุประสงค์</h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-lg">
                  {selectedRequest.purpose}
                </p>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">หมายเหตุ</h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 text-lg">เหตุผลการปฏิเสธ</h5>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg text-lg">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base"
              >
                ปิด
              </button>

              {selectedRequest.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedRequest.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check size={16} />
                    )}
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('เหตุผลในการปฏิเสธ (ไม่จำเป็น):');
                      if (reason !== null) {
                        handleRequestAction(selectedRequest.id, 'reject', reason);
                      }
                    }}
                    disabled={actionLoading === selectedRequest.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                    ปฏิเสธ
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