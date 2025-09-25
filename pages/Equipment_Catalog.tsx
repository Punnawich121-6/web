"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  MapPin,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";
interface equipment {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  status: "available" | "borrowed" | "maintenance";
  borrower: string | null;
  dueDate: string | null;
  specifications?: string[];
  location: string;
  serialNumber: string;
  condition?: string;
}

export default function Equipment_Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [equipmentData] = useState<equipment[]>([
    {
      id: 1,
      name: "โปรเจคเตอร์ Epson EB-X41",
      category: "อิเล็กทรอนิกส์",
      description:
        "โปรเจคเตอร์ความละเอียดสูง เหมาะสำหรับการนำเสนองาน สามารถใช้งานในห้องประชุมขนาดใหญ่ได้",
      image:
        "https://www.miapartyhire.com.au/wp-content/uploads/2018/09/Projector-Screen.jpg",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง IT-101",
      serialNumber: "EP-2024-001",
    },
    {
      id: 2,
      name: "กล้องดิจิตอล Canon EOS 850D",
      category: "อิเล็กทรอนิกส์",
      description:
        "กล้อง DSLR สำหรับถ่ายภาพคุณภาพสูง มีเลนส์ kit 18-55mm พร้อมใช้งาน",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง Media-202",
      serialNumber: "CN-2024-002",
    },
    {
      id: 3,
      name: "ไมโครโฟนไร้สาย Shure SM58",
      category: "เครื่องเสียง",
      description:
        "ไมโครโฟนไร้สายคุณภาพดี สำหรับงานนำเสนอและการแสดง มีแบตเตอรี่สำรอง",
      image:
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง Audio-301",
      serialNumber: "SH-2024-003",
      condition: "ปรับปรุง",
    },
    {
      id: 4,
      name: "แท็บเล็ต iPad Air (5th Gen)",
      category: "อิเล็กทรอนิกส์",
      description:
        "แท็บเล็ตสำหรับการนำเสนอและงานกราฟิก มาพร้อม Apple Pencil และ Magic Keyboard",
      image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง IT-105",
      serialNumber: "AP-2024-004",
      condition: "ดีมาก",
    },
    {
      id: 5,
      name: "เครื่องพิมพ์ 3D Ender 3 V2",
      category: "เครื่องจักร",
      description:
        "เครื่องพิมพ์ 3D สำหรับสร้างชิ้นงานต้นแบบ พร้อมฟิลาเมนต์ PLA และ ABS",
      image:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง Workshop-401",
      serialNumber: "EN-2024-005",
    },
    {
      id: 6,
      name: "ลำโพงบลูทูธ JBL Charge 5",
      category: "เครื่องเสียง",
      description: "ลำโพงพกพาเสียงดี กันน้ำ เหมาะสำหรับงานกิจกรรมกลางแจ้ง",
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: [
        "20 Hours Battery",
        "IP67 Waterproof",
        "Bluetooth 5.1",
        "Power Bank Function",
      ],
      location: "ห้อง Audio-301",
      serialNumber: "JB-2024-006",
    },
    {
      id: 7,
      name: "โน๊ตบุ๊ค MacBook Air M2",
      category: "อิเล็กทรอนิกส์",
      description:
        "โน๊ตบุ๊คสำหรับงานกราฟิกและการพัฒนาโปรแกรม มาพร้อมซอฟต์แวร์พื้นฐาน",
      image:
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: ["M2 Chip", "8GB RAM", "256GB SSD", "13.6-inch Display"],
      location: "ห้อง IT-103",
      serialNumber: "MB-2024-007",
    },
    {
      id: 8,
      name: "เครื่องสแกนเอกสาร Epson V600",
      category: "อิเล็กทรอนิกส์",
      description:
        "เครื่องสแกนเอกสารขนาด A4 ความละเอียดสูง พร้อมซอฟต์แวร์แก้ไขภาพ",
      image:
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: [
        "6400 x 9600 DPI",
        "A4 Size Support",
        "USB 3.0",
        "Auto Document Feeder",
      ],
      location: "ห้อง Office-201",
      serialNumber: "EP-2024-008",
    },
    {
      id: 9,
      name: "กล้องวิดีโอ Sony FX3",
      category: "อิเล็กทรอนิกส์",
      description: "กล้องวิดีโอระดับมืออาชีพ สำหรับการถ่ายทำสื่อคุณภาพสูง",
      image:
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: [
        "4K 120p Recording",
        "Full-Frame Sensor",
        "S-Log3",
        "Dual Base ISO",
      ],
      location: "ห้อง Media-203",
      serialNumber: "SN-2024-009",
    },
    {
      id: 10,
      name: "เครื่องเชื่อม MIG-200A",
      category: "เครื่องจักร",
      description: "เครื่องเชื่อมอาร์กไฟฟ้า สำหรับงานโลหะขนาดกลาง",
      image:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: [
        "200A Output",
        "IGBT Technology",
        "Arc Force Control",
        "Hot Start",
      ],
      location: "ห้อง Workshop-402",
      serialNumber: "MG-2024-010",
    },
    {
      id: 11,
      name: "เครื่องขัดกระดาษทราย Orbital",
      category: "เครื่องจักร",
      description: "เครื่องขัดผิวไม้และโลหะ มีระบบดูดฝุ่น",
      image:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      specifications: [
        "Variable Speed",
        "Dust Collection",
        "Hook & Loop Base",
        "Ergonomic Design",
      ],
      location: "ห้อง Workshop-403",
      serialNumber: "OR-2024-011",
    },
    {
      id: 12,
      name: "ชุดไฟแสงLED สตูดิโอ",
      category: "เครื่องเสียง",
      description: "ชุดไฟสำหรับถ่ายภาพและวิดีโอ ปรับแสงได้",
      image:
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop",
      status: "available",
      borrower: null,
      dueDate: null,
      location: "ห้อง Studio-301",
      serialNumber: "LD-2024-012",
    },
  ]);

  const categories = ["all", "อิเล็กทรอนิกส์", "เครื่องเสียง", "เครื่องจักร"];

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEquipment = filteredEquipment.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 py-8 pt-32">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2 tracking-wide uppercase">
            Equipment <span className="text-red-600">Catalog</span>
          </h1>
          <p className="text-xl text-gray-600">
            ค้นหาและดูรายละเอียดอุปกรณ์ที่สามารถยืมได้
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={22}
              />
              <input
                type="text"
                placeholder="ค้นหาอุปกรณ์, รหัสอุปกรณ์..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={22}
              />
              <select
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white transition-all text-lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">หมวดหมู่ทั้งหมด</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 text-md text-gray-600 flex justify-between items-center">
            <span>
              พบอุปกรณ์ {filteredEquipment.length} รายการ
            </span>
            <span>
              หน้า {currentPage} จาก {totalPages}
            </span>
          </div>
        </div>

        {/* Statistics - MOVED HERE */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center uppercase tracking-wide">
            <span className="text-red-600">Statistics</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-4xl font-extrabold text-green-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "available")
                    .length
                }
              </div>
              <div className="text-lg text-green-800 font-semibold">พร้อมใช้งาน</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="text-4xl font-extrabold text-red-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "borrowed")
                    .length
                }
              </div>
              <div className="text-lg text-red-800 font-semibold">ถูกยืม</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="text-4xl font-extrabold text-yellow-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "maintenance")
                    .length
                }
              </div>
              <div className="text-lg text-yellow-800 font-semibold">ซ่อมบำรุง</div>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {currentEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {equipment.serialNumber}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 h-14">
                  {equipment.name}
                </h3>

                <div className="flex items-center justify-between text-md text-gray-500 mb-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                    {equipment.category}
                  </span>
                  {equipment.condition && (
                    <span className="flex items-center font-semibold text-gray-600">
                      <Zap size={16} className="mr-1 text-yellow-500" />
                      {equipment.condition}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-5 text-md leading-relaxed line-clamp-3 h-20">
                  {equipment.description}
                </p>

                <div className="flex items-center text-md text-gray-600 mb-6 font-medium">
                  <MapPin size={16} className="mr-2 text-red-500" />
                  {equipment.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg mb-8">
            <Package size={72} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              ไม่พบอุปกรณ์ที่ค้นหา
            </h3>
            <p className="text-lg text-gray-500">ลองเปลี่ยนคำค้นหาหรือฟิลเตอร์ดู</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-md font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} className="mr-1" />
                ก่อนหน้า
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 text-md font-semibold rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-red-600 text-white shadow-md"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-md font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
                <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}