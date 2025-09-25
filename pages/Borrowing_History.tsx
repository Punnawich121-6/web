"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import app from "../pages/firebase";
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
}

const BorrowingHistory = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(
    null
  );

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

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

  // Mock borrowing history data
  const borrowHistory: BorrowRecord[] = [
    {
      id: "BR-2024-001",
      equipmentName: "กล้องถ่ายรูป Canon EOS R6",
      equipmentId: "EP-001",
      quantity: 1,
      borrowDate: "2024-01-20",
      returnDate: "2024-01-25",
      status: "pending",
      purpose: "การถ่ายทำงานโปรเจคของนักศึกษา",
      notes: "ต้องการเลนส์เพิ่มเติม",
      image: "/api/placeholder/80/80",
    },
    {
      id: "BR-2024-002",
      equipmentName: "โปรเจคเตอร์ Epson EB-X41",
      equipmentId: "EP-002",
      quantity: 2,
      borrowDate: "2024-01-15",
      returnDate: "2024-01-18",
      actualReturnDate: "2024-01-18",
      status: "returned",
      purpose: "การนำเสนอในชั้นเรียน",
      image: "/api/placeholder/80/80",
    },
    {
      id: "BR-2024-003",
      equipmentName: "ไมโครโฟนไร้สาย Shure SM58",
      equipmentId: "EP-003",
      quantity: 3,
      borrowDate: "2024-01-10",
      returnDate: "2024-01-13",
      actualReturnDate: "2024-01-13",
      status: "returned",
      purpose: "กิจกรรมของสโมสรนักศึกษา",
      image: "/api/placeholder/80/80",
    },
    {
      id: "BR-2024-004",
      equipmentName: 'แล็ปท็อป MacBook Pro 16"',
      equipmentId: "EP-005",
      quantity: 1,
      borrowDate: "2024-01-05",
      returnDate: "2024-01-12",
      actualReturnDate: "2024-01-14",
      status: "overdue",
      purpose: "งานออกแบบกราฟิก",
      image: "/api/placeholder/80/80",
    },
    {
      id: "BR-2024-005",
      equipmentName: "เครื่องพิมพ์ HP LaserJet Pro",
      equipmentId: "EP-004",
      quantity: 1,
      borrowDate: "2024-01-01",
      returnDate: "2024-01-05",
      status: "rejected",
      purpose: "พิมพ์เอกสารส่วนตัว",
      notes: "ไม่เป็นไปตามวัตถุประสงค์การใช้งาน",
      image: "/api/placeholder/80/80",
    },
  ];

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  ประวัติการยืมอุปกรณ์
                </h1>
                <p className="text-xl text-gray-600">
                  ติดตามสถานะและประวัติการยืมอุปกรณ์ทั้งหมดของคุณ
                </p>
              </div>
              <div className="flex gap-3 mt-4 lg:mt-0">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Home size={18} />
                  Dashboard
                </a>
                <a
                  href="/Equipment_Catalog_User"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                <div className="text-2xl font-bold mb-1">{option.count}</div>
                <div className="text-xs font-medium">{option.label}</div>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบประวัติการยืม
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedStatus === "all"
                    ? "คุณยังไม่เคยยืมอุปกรณ์ หรือลองเปลี่ยนคำค้นหา"
                    : `ไม่พบรายการที่มีสถานะ "${
                        statusOptions.find((s) => s.value === selectedStatus)
                          ?.label
                      }"`}
                </p>
                <a
                  href="/Equipment_Catalog_User"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {record.equipmentName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                รหัส: {record.equipmentId} | จำนวน:{" "}
                                {record.quantity} ชิ้น
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
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

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
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

                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">วัตถุประสงค์:</span>{" "}
                            {record.purpose}
                          </p>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    รายละเอียดการยืม
                  </h3>
                  <p className="text-gray-600">#{selectedRecord.id}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
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
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedRecord.equipmentName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <h5 className="font-medium text-gray-700 mb-2">
                    ข้อมูลการยืม
                  </h5>
                  <div className="space-y-2 text-sm">
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
                  <h5 className="font-medium text-gray-700 mb-2">สถานะ</h5>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
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
                <h5 className="font-medium text-gray-700 mb-2">วัตถุประสงค์</h5>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedRecord.purpose}
                </p>
              </div>

              {selectedRecord.notes && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">หมายเหตุ</h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
