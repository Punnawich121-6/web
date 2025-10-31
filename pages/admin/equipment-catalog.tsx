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
import LibraryNavbar from "../../components/LibraryNavbar";

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

  const categories = ["all", "Electronics", "Audio system", "Machine"];

  // Get status text in Thai
  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "AVAILABLE";
      case "BORROWED":
        return "BORROWED";
      case "MAINTENANCE":
        return "MAINTENANCE";
      case "RETIRED":
        return "RETIRED";
      default:
        return "Unknown status";
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
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-xl">Loading equipment data...</p>
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
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 text-xl mb-4">error: {error}</p>
              <button
                onClick={fetchEquipment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ลองใหม่
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
        <div className="container mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 lg:pt-32">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-2 tracking-wide uppercase">
            Equipment <span className="text-red-600">Catalog</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Search and view details of equipment available for borrowing
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={22}
              />
              <input
                type="text"
                placeholder="Search equipment, equipment code..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm sm:text-base lg:text-lg"
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
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white transition-all text-sm sm:text-base lg:text-lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
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
              Equipment found {filteredEquipment.length} List
            </span>
            <span>
              หน้า {currentPage} จาก {totalPages}
            </span>
          </div>
        </div>

        {/* Statistics - MOVED HERE */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center uppercase tracking-wide">
            <span className="text-red-600">Statistics</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <div className="text-3xl sm:text-4xl font-extrabold text-green-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "AVAILABLE")
                    .length
                }
              </div>
              <div className="text-base sm:text-lg text-green-800 font-semibold">Ready to use</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-xl border-2 border-red-200">
              <div className="text-3xl sm:text-4xl font-extrabold text-red-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "BORROWED")
                    .length
                }
              </div>
              <div className="text-base sm:text-lg text-red-800 font-semibold">Borrowed</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-600 mb-2">
                {
                  equipmentData.filter((item) => item.status === "MAINTENANCE")
                    .length
                }
              </div>
              <div className="text-base sm:text-lg text-yellow-800 font-semibold">Repair</div>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {currentEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={equipment.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={equipment.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {equipment.serialNumber}
                </div>
                <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-white ${getStatusColor(equipment.status)}`}>
                  {getStatusText(equipment.status)}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
                  {equipment.name}
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm lg:text-base text-gray-500 mb-4">
                  <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full font-medium text-xs sm:text-sm">
                    {equipment.category}
                  </span>
                  <div className="text-xs sm:text-sm text-gray-600">
                    พร้อมใช้: {equipment.availableQuantity}/{equipment.totalQuantity}
                  </div>
                </div>

                <p className="text-gray-600 mb-4 sm:mb-5 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-3 min-h-[3.5rem] sm:min-h-[4rem]">
                  {equipment.description}
                </p>

                <div className="flex items-center text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4 font-medium">
                  <MapPin size={16} className="mr-2 text-red-500" />
                  {equipment.location}
                </div>
                {equipment.condition && (
                  <div className="flex items-center mb-4">
                    <Zap size={16} className="mr-1 text-yellow-500" />
                    <span className="text-sm text-gray-600">Condition: {equipment.condition}</span>
                  </div>
                )}
                {equipment.creator && (
                  <div className="text-xs text-gray-500 mb-2">
                    Added by: {equipment.creator.displayName || equipment.creator.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg mb-8">
            <Package size={72} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              Equipment not found
            </h3>
            <p className="text-lg text-gray-500">Try changing the search term or filter.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex justify-center items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm lg:text-base font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
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
                        className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm lg:text-base font-semibold rounded-lg transition-colors ${
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
                className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm lg:text-base font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} className="sm:ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}