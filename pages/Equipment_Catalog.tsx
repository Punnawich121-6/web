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

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE" | "RETIRED";
  totalQuantity: number;
  availableQuantity: number;
  specifications?: any;
  location: string;
  serialNumber: string;
  condition?: string;
  creator?: {
    displayName?: string;
    email: string;
  };
  borrowings?: any[];
}

export default function Equipment_Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipment');
      const result = await response.json();

      if (result.success) {
        setEquipmentData(result.data);
      } else {
        setError(result.error || 'Failed to fetch equipment');
      }
    } catch (err) {
      setError('Failed to fetch equipment');
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "อิเล็กทรอนิกส์", "เครื่องเสียง", "เครื่องจักร"];

  // Get status text in Thai
  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Available";
      case "BORROWED":
        return "Borrowed";
      case "MAINTENANCE":
        return "Maintenance";
      case "RETIRED":
        return "Retired";
      default:
        return "Unknown";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600";
      case "BORROWED":
        return "text-red-600";
      case "MAINTENANCE":
        return "text-yellow-600";
      case "RETIRED":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl">กำลังโหลดข้อมูลอุปกรณ์...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 text-base sm:text-lg lg:text-xl mb-4">เกิดข้อผิดพลาด: {error}</p>
              <button
                onClick={fetchEquipment}
                className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 min-h-[44px] text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-2 tracking-wide uppercase">
            Equipment <span className="text-red-600">Catalog</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            Search and view details of equipment available for borrowing
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6"
              />
              <input
                type="text"
                placeholder="ค้นหาอุปกรณ์, รหัสอุปกรณ์..."
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base lg:text-lg min-h-[44px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6"
              />
              <select
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white transition-all text-sm sm:text-base lg:text-lg min-h-[44px]"
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
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm lg:text-base text-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span>
              Found {filteredEquipment.length} equipment
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Statistics - MOVED HERE */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center uppercase tracking-wide">
            <span className="text-red-600">Statistics</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "AVAILABLE")
                    .length
                }
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-green-800 font-semibold">Available</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-red-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "BORROWED")
                    .length
                }
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-red-800 font-semibold">Borrowed</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-yellow-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "MAINTENANCE")
                    .length
                }
              </div>
              <div className="text-sm sm:text-base lg:text-lg text-yellow-800 font-semibold">Maintenance</div>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {currentEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={equipment.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={equipment.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black bg-opacity-60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  {equipment.serialNumber}
                </div>
                <div className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-2 py-1 rounded-full text-xs font-medium bg-white ${getStatusColor(equipment.status)}`}>
                  {getStatusText(equipment.status)}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {equipment.name}
                </h3>

                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
                  <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                    {equipment.category}
                  </span>
                </div>

                {/* Availability Status */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm text-gray-600">Available:</span>
                    <span className={`text-xs sm:text-sm font-bold ${
                      equipment.availableQuantity === 0
                        ? "text-red-600"
                        : equipment.availableQuantity <= equipment.totalQuantity * 0.3
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}>
                      {equipment.availableQuantity}/{equipment.totalQuantity} ชิ้น
                      {equipment.availableQuantity === 0 && (
                        <span className="ml-1 sm:ml-2 text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                          หมด
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        equipment.availableQuantity === 0
                          ? "bg-red-500"
                          : equipment.availableQuantity <= equipment.totalQuantity * 0.3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${(equipment.availableQuantity / equipment.totalQuantity) * 100}%`,
                      }}
                    />
                  </div>
                  {equipment.availableQuantity === 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Not Available
                    </p>
                  )}
                  {equipment.availableQuantity > 0 && equipment.availableQuantity <= equipment.totalQuantity * 0.3 && (
                    <p className="text-xs text-yellow-600 mt-1 font-medium">
                      ⚡ เหลือน้อย!
                    </p>
                  )}
                </div>

                <p className="text-gray-600 mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed line-clamp-3 min-h-[4rem] sm:min-h-[4.5rem]">
                  {equipment.description}
                </p>

                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-medium">
                  <MapPin className="mr-1.5 sm:mr-2 text-red-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{equipment.location}</span>
                </div>
                {equipment.condition && (
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Zap className="mr-1 sm:mr-1.5 text-yellow-500 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-600">สภาพ: {equipment.condition}</span>
                  </div>
                )}
                {equipment.creator && (
                  <div className="text-xs text-gray-500 mb-2 truncate">
                    เพิ่มโดย: {equipment.creator.displayName || equipment.creator.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20 bg-white rounded-xl shadow-lg mb-6 sm:mb-8 px-4">
            <Package className="mx-auto text-gray-300 mb-4 w-16 h-16 sm:w-20 sm:h-20" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">
              Equipment not found
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-500">Try changing the search term or filter</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
              >
                <ChevronLeft className="mr-1 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">ก่อนหน้า</span>
                <span className="sm:hidden">ก่อน</span>
              </button>

              <div className="flex gap-1 sm:gap-2">
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
                        className={`w-10 h-10 sm:w-11 sm:h-11 text-sm sm:text-base font-semibold rounded-lg transition-colors min-h-[44px] touch-manipulation ${
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
                      <span key={page} className="px-2 sm:px-3 py-2 text-gray-500 text-xs sm:text-sm">
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
                className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <span className="sm:hidden">ถัดไป</span>
                <ChevronRight className="ml-1 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}