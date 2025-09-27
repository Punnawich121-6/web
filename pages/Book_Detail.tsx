"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, User, getAuth } from "firebase/auth";
import app from "../pages/firebase";
import LibraryNavbar from "../components/LibraryNavbar";
import {
  Calendar,
  User as UserIcon,
  Mail,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Send,
} from "lucide-react";

interface CartItem {
  equipment: {
    id: string;
    name: string;
    serialNumber: string;
    image?: string;
    location: string;
    category: string;
  };
  quantity: number;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE" | "RETIRED";
  totalQuantity: number;
  availableQuantity: number;
  location: string;
  serialNumber: string;
  condition?: string;
}

const BookDetail = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [formData, setFormData] = useState({
    borrowDate: "",
    returnDate: "",
    purpose: "",
    additionalNotes: "",
    department: "",
    studentId: "",
    phone: "",
  });

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadCartData();
        fetchEquipmentData();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const loadCartData = () => {
    try {
      const savedCart = localStorage.getItem('equipmentCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } else {
        // Redirect back if no cart data
        window.location.href = '/Equipment_Catalog_User';
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      setCartItems([]);
    }
  };

  const fetchEquipmentData = async () => {
    try {
      const response = await fetch('/api/equipment');
      const result = await response.json();
      if (result.success) {
        setEquipmentData(result.data);
      }
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    }
  };


  const departments = [
    "วิศวกรรมศาสตร์",
    "วิทยาศาสตร์",
    "เทคโนโลยีสารสนเทศ",
    "บริหารธุรกิจ",
    "ศิลปศาสตร์",
    "อื่นๆ",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      // Get Firebase auth token
      const token = await user.getIdToken();

      // Create borrow request for each item in cart
      for (const item of cartItems) {
        const borrowData = {
          equipmentId: item.equipment.id,
          quantity: item.quantity,
          startDate: new Date(formData.borrowDate).toISOString(),
          endDate: new Date(formData.returnDate).toISOString(),
          purpose: formData.purpose,
          notes: formData.additionalNotes ? `${formData.additionalNotes} | แผนก: ${formData.department} | รหัสนักศึกษา: ${formData.studentId} | โทร: ${formData.phone}` : `แผนก: ${formData.department} | รหัสนักศึกษา: ${formData.studentId} | โทร: ${formData.phone}`
        };

        const response = await fetch('/api/borrow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, borrowData }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to submit borrow request');
        }
      }

      // Clear cart after successful submission
      localStorage.removeItem('equipmentCart');

      // Redirect to Borrowing History
      window.location.href = "/Borrowing_History?status=pending";

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการส่งคำขอ:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="pt-24 pb-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ไม่พบรายการอุปกรณ์ที่เลือก
              </h1>
              <p className="text-gray-600 mb-6">
                กรุณาเลือกอุปกรณ์ที่ต้องการยืมก่อนดำเนินการต่อ
              </p>
              <a
                href="/Equipment_Catalog_User"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowLeft className="mr-2" size={20} />
                กลับไปเลือกอุปกรณ์
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowLeft size={20} />
                กลับไปเลือกอุปกรณ์
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ยืนยันการยืมอุปกรณ์
            </h1>
            <p className="text-xl text-gray-600">
              กรุณาตรวจสอบข้อมูลและกรอกรายละเอียดเพิ่มเติม
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  รายการที่เลือก ({totalItems} รายการ)
                </h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.equipment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                        <img
                          src={item.equipment.image || 'https://via.placeholder.com/100x100?text=No+Image'}
                          alt={item.equipment.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {item.equipment.name}
                        </h4>
                        <p className="text-xs text-gray-500">#{item.equipment.serialNumber}</p>
                        <p className="text-xs text-gray-400">{item.equipment.location}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        ×{item.quantity}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      รวมทั้งหมด:
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {totalItems} ชิ้น
                    </span>
                  </div>
                </div>

                {/* User Info Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon size={16} />
                      <span>
                        {user?.displayName || user?.email?.split("@")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="mr-2" size={20} />
                      ข้อมูลเพิ่มเติม
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          รหัสนักศึกษา <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="เช่น 6410001234"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="0XX-XXX-XXXX"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          คณะ/ภาควิชา <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        >
                          <option value="">-- เลือกคณะ/ภาควิชา --</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="mr-2" size={20} />
                      วันที่ยืม - คืน
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          วันที่ต้องการยืม{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="borrowDate"
                          value={formData.borrowDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          วันที่กำหนดคืน <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          min={
                            formData.borrowDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purpose and Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="mr-2" size={20} />
                      วัตถุประสงค์และหมายเหตุ
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          วัตถุประสงค์ในการยืม{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          placeholder="เช่น ใช้สำหรับการนำเสนอโปรเจคในชั้นเรียน, การจัดกิจกรรม, ฯลฯ"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          หมายเหตุเพิ่มเติม
                        </label>
                        <textarea
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                          placeholder="ข้อมูลเพิ่มเติมหรือความต้องการพิเศษ (ถ้ามี)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle
                        className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          ข้อตกลงและเงื่อนไข
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1 mb-3">
                          <li>
                            •
                            ผู้ยืมต้องดูแลอุปกรณ์ให้อยู่ในสภาพดีและคืนตามกำหนดเวลา
                          </li>
                          <li>
                            • หากอุปกรณ์เสียหายหรือสูญหาย
                            ผู้ยืมจะต้องรับผิดชอบค่าซ่อมแซมหรือทดแทน
                          </li>
                          <li>
                            • การยืมเกิน 7 วัน
                            ต้องได้รับอนุมัติจากอาจารย์ผู้ดูแล
                          </li>
                          <li>
                            •
                            สำรองสิทธิ์ในการปฏิเสธการยืมหากไม่เป็นไปตามเงื่อนไข
                          </li>
                        </ul>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="agreeTerms"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            required
                          />
                          <label
                            htmlFor="agreeTerms"
                            className="ml-2 text-sm text-yellow-700 font-medium"
                          >
                            ข้าพเจ้ายอมรับข้อตกลงและเงื่อนไขข้างต้น{" "}
                            <span className="text-red-500">*</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>กำลังส่งคำขอ...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>ส่งคำขอยืมอุปกรณ์</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
