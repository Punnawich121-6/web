import React, { useState } from "react";
import {
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import Navbar from "@/components/LibraryNavbar";

export default function Borrow_Equipment() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    borrowerName: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    equipmentId: "",
    equipmentName: "",
    quantity: 1,
    borrowDate: "",
    returnDate: "",
    purpose: "",
    additionalNotes: "",
  });

  // Simple Navbar Component
  const SimpleNavbar = () => (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600">TimeToUse</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                หน้าแรก
              </a>
              <a
                href="#"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                แคตตาล็อกอุปกรณ์
              </a>
              <a
                href="#"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                การยืมของฉัน
              </a>
              <a
                href="#"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                เกี่ยวกับเรา
              </a>
              <a
                href="#"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                เข้าสู่ระบบ
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-900 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
            >
              หน้าแรก
            </a>
            <a
              href="#"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
            >
              แคตตาล็อกอุปกรณ์
            </a>
            <a
              href="#"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
            >
              การยืมของฉัน
            </a>
            <a
              href="#"
              className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium"
            >
              เกี่ยวกับเรา
            </a>
            <a
              href="#"
              className="bg-blue-600 text-white block px-3 py-2 rounded-lg text-base font-medium hover:bg-blue-700 mt-2"
            >
              เข้าสู่ระบบ
            </a>
          </div>
        </div>
      )}
    </nav>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    alert("ส่งคำขอยืมสำเร็จ! เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง");
    console.log("Form data:", formData);
  };

  const departments = [
    "วิศวกรรมศาสตร์",
    "วิทยาศาสตร์",
    "เทคโนโลยีสารสนเทศ",
    "บริหารธุรกิจ",
    "ศิลปศาสตร์",
    "อื่นๆ",
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              ฟอร์มขอยืมอุปกรณ์
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              กรอกข้อมูลเพื่อขอยืมอุปกรณ์ที่ต้องการ
            </p>
          </div>

          {/* Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Package className="mr-2 sm:mr-3 w-6 h-6 sm:w-7 sm:h-7" size={28} />
                แบบฟอร์มขอยืมอุปกรณ์
              </h2>
              <p className="text-blue-100 mt-2 text-sm sm:text-base">
                กรุณากรอกข้อมูลให้ครบถ้วนเพื่อความสะดวกในการดำเนินการ
              </p>
            </div>

            <div onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* ข้อมูลผู้ยืม */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <User className="mr-2 w-5 h-5 sm:w-6 sm:h-6" size={20} />
                  ข้อมูลผู้ยืม
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      ชื่อ - นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="borrowerName"
                      value={formData.borrowerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      placeholder="กรุณากรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      รหัสนักศึกษา <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      placeholder="เช่น 6410001234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"
                        size={20}
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                        placeholder="example@student.university.ac.th"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5"
                        size={20}
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                        placeholder="0XX-XXX-XXXX"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      คณะ/ภาควิชา <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
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

              {/* Equipment Information */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Package className="mr-2 w-5 h-5 sm:w-6 sm:h-6" size={20} />
                  ข้อมูลอุปกรณ์ที่ต้องการยืม
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      รหัสอุปกรณ์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentId"
                      value={formData.equipmentId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      placeholder="เช่น EP-2024-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      ชื่ออุปกรณ์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={formData.equipmentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      placeholder="เช่น โปรเจคเตอร์ Epson EB-X41"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      จำนวนที่ต้องการ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Calendar className="mr-2 w-5 h-5 sm:w-6 sm:h-6" size={20} />
                  วันที่ยืม - คืน
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      วันที่ต้องการยืม <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="borrowDate"
                      value={formData.borrowDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      วันที่กำหนดคืน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base touch-manipulation"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Purpose and Notes */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <FileText className="mr-2 w-5 h-5 sm:w-6 sm:h-6" size={20} />
                  วัตถุประสงค์และหมายเหตุ
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      วัตถุประสงค์ในการยืม{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base touch-manipulation"
                      placeholder="เช่น ใช้สำหรับการนำเสนอโปรเจคในชั้นเรียน, การจัดกิจกรรม, ฯลฯ"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      หมายเหตุเพิ่มเติม
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base touch-manipulation"
                      placeholder="ข้อมูลเพิ่มเติมหรือความต้องการพิเศษ (ถ้ามี)"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start">
                  <AlertCircle
                    className="text-yellow-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6"
                    size={20}
                  />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">
                      ข้อตกลงและเงื่อนไข
                    </h4>
                    <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                      <li>
                        • ผู้ยืมต้องดูแลอุปกรณ์ให้อยู่ในสภาพดีและคืนตามกำหนดเวลา
                      </li>
                      <li>
                        • หากอุปกรณ์เสียหายหรือสูญหาย
                        ผู้ยืมจะต้องรับผิดชอบค่าซ่อมแซมหรือทดแทน
                      </li>
                      <li>
                        • การยืมเกิน 7 วัน ต้องได้รับอนุมัติจากอาจารย์ผู้ดูแล
                      </li>
                      <li>
                        • สำรองสิทธิ์ในการปฏิเสธการยืมหากไม่เป็นไปตามเงื่อนไข
                      </li>
                    </ul>
                    <div className="flex items-center mt-3">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded touch-manipulation"
                        required
                      />
                      <label
                        htmlFor="agreeTerms"
                        className="ml-2 text-xs sm:text-sm text-yellow-700 font-medium"
                      >
                        ข้าพเจ้ายอมรับข้อตกลงและเงื่อนไขข้างต้น{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4 sm:pt-6">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" size={20} />
                  <span>ส่งคำขอยืมอุปกรณ์</span>
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center text-xs sm:text-sm text-gray-500 border-t pt-4 sm:pt-6">
                <p>
                  หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อ:{" "}
                  <span className="font-medium">
                    equipment@university.ac.th
                  </span>{" "}
                  หรือ <span className="font-medium">02-XXX-XXXX</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
