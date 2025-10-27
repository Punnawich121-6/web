"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LibraryNavbar from "../../components/LibraryNavbar";
import {
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Minus,
  XCircle,
  Camera,
  Monitor,
  Mic,
  Printer,
  Laptop,
  Speaker,
} from "lucide-react";

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

interface CartItem {
  equipment: Equipment;
  quantity: number;
}

const EquipmentCatalogUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('equipmentCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    // Auto-refresh equipment data every 30 seconds to keep availability up-to-date
    const refreshInterval = setInterval(() => {
      fetchEquipment();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('equipmentCart', JSON.stringify(cart));
  }, [cart]);

  // Sync cart with latest equipment data (remove unavailable items, adjust quantities)
  useEffect(() => {
    if (equipmentData.length > 0 && cart.length > 0) {
      const updatedCart = cart
        .map((cartItem) => {
          const latestEquipment = equipmentData.find(
            (eq) => eq.id === cartItem.equipment.id
          );

          if (!latestEquipment) {
            // Equipment no longer exists
            return null;
          }

          if (latestEquipment.availableQuantity === 0) {
            // Equipment no longer available
            return null;
          }

          // Adjust quantity if it exceeds available quantity
          if (cartItem.quantity > latestEquipment.availableQuantity) {
            return {
              ...cartItem,
              quantity: latestEquipment.availableQuantity,
              equipment: latestEquipment,
            };
          }

          // Update equipment data
          return {
            ...cartItem,
            equipment: latestEquipment,
          };
        })
        .filter((item): item is CartItem => item !== null);

      // Only update if cart changed
      if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
        setCart(updatedCart);
      }
    }
  }, [equipmentData]);

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

  // Get categories from actual data
  const categories = [
    { id: "all", name: "ทั้งหมด", icon: Filter },
    { id: "อิเล็กทรอนิกส์", name: "อิเล็กทรอนิกส์", icon: Camera },
    { id: "เครื่องเสียง", name: "เครื่องเสียง", icon: Mic },
    { id: "เครื่องจักร", name: "เครื่องจักร", icon: Laptop },
  ];

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (equipment: Equipment) => {
    // Check if equipment is available
    if (equipment.availableQuantity === 0) {
      alert('❌ ขออภัย อุปกรณ์นี้ไม่มีให้ยืมในขณะนี้');
      return;
    }

    const existingItem = cart.find(
      (item) => item.equipment.id === equipment.id
    );

    if (existingItem) {
      if (existingItem.quantity < equipment.availableQuantity) {
        setCart((prev) =>
          prev.map((item) =>
            item.equipment.id === equipment.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        alert(`⚠️ คุณได้เพิ่มจำนวนสูงสุดแล้ว (${equipment.availableQuantity} ชิ้น)`);
      }
    } else {
      setCart((prev) => [...prev, { equipment, quantity: 1 }]);
    }
  };

  const removeFromCart = (equipmentId: string) => {
    const existingItem = cart.find((item) => item.equipment.id === equipmentId);
    if (existingItem && existingItem.quantity > 1) {
      setCart((prev) =>
        prev.map((item) =>
          item.equipment.id === equipmentId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart((prev) =>
        prev.filter((item) => item.equipment.id !== equipmentId)
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600 bg-green-100";
      case "BORROWED":
        return "text-red-600 bg-red-100";
      case "MAINTENANCE":
        return "text-yellow-600 bg-yellow-100";
      case "RETIRED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "พร้อมใช้งาน";
      case "BORROWED":
        return "ถูกยืม";
      case "MAINTENANCE":
        return "ซ่อมบำรุง";
      case "RETIRED":
        return "เลิกใช้งาน";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getItemStatus = (item: Equipment) => {
    if (item.availableQuantity === 0) return "unavailable";
    if (item.availableQuantity <= item.totalQuantity * 0.3) return "limited";
    return "available";
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-xl">กำลังโหลดอุปกรณ์...</p>
              </div>
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
        <div className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 text-xl mb-4">เกิดข้อผิดพลาด: {error}</p>
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
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              เลือกอุปกรณ์ที่ต้องการยืม
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              เลือกอุปกรณ์จากแคตตาล็อกและเพิ่มลงในตะกร้า
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ค้นหาอุปกรณ์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base touch-manipulation"
                />
              </div>
            </div>

            {/* Cart Button */}
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation w-full lg:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" size={20} />
              <span>ตะกร้า ({cartItemCount})</span>
              {cartItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <category.icon className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
                <span>{category.name}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Equipment Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
          >
            {filteredEquipment.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={item.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {getStatusText(item.status)}
                  </div>
                </div>

                <div className="p-3 sm:p-4 lg:p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                      {item.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500">#{item.serialNumber}</span>
                  </div>

                  <p className="text-gray-600 text-sm sm:text-base mb-3">
                    {item.description}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-600">พร้อมใช้งาน:</span>
                      <span className={`font-bold ${
                        item.availableQuantity === 0
                          ? "text-red-600"
                          : item.availableQuantity <= item.totalQuantity * 0.3
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        {item.availableQuantity}/{item.totalQuantity} ชิ้น
                        {item.availableQuantity === 0 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            หมด
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          getItemStatus(item) === "available"
                            ? "bg-green-500"
                            : getItemStatus(item) === "limited"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${(item.availableQuantity / item.totalQuantity) * 100}%`,
                        }}
                      />
                    </div>
                    {item.availableQuantity === 0 && (
                      <p className="text-sm text-red-600 mt-1 font-medium">
                        ⚠️ ไม่มีให้ยืมในขณะนี้
                      </p>
                    )}
                    {item.availableQuantity > 0 && item.availableQuantity <= item.totalQuantity * 0.3 && (
                      <p className="text-sm text-yellow-600 mt-1 font-medium">
                        ⚡ เหลือน้อย รีบจองเลย!
                      </p>
                    )}
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <div className="text-xs sm:text-sm text-gray-500 mb-1">สถานที่:</div>
                    <div className="text-sm sm:text-base text-gray-700 mb-2">{item.location}</div>
                    {item.specifications && (
                      <>
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">คุณสมบัติ:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.specifications).slice(0, 2).map(([key, value], i) => (
                            <span
                              key={i}
                              className="bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 py-1 rounded"
                            >
                              {typeof value === 'string' ? value : `${key}: ${value}`}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {item.availableQuantity === 0 ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium border-2 border-gray-300 min-h-[44px] touch-manipulation"
                      >
                        <XCircle className="w-4 h-4" size={16} />
                        หมด - ไม่สามารถเพิ่มได้
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        {cart.find(
                          (cartItem) => cartItem.equipment.id === item.id
                        ) && (
                          <>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] touch-manipulation"
                            >
                              <Minus className="w-4 h-4" size={16} />
                            </button>
                            <span className="font-bold min-w-[2rem] sm:min-w-[2.5rem] text-center text-base sm:text-lg text-gray-900">
                              {cart.find(
                                (cartItem) => cartItem.equipment.id === item.id
                              )?.quantity || 0}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(item)}
                          disabled={
                            (cart.find(
                              (cartItem) => cartItem.equipment.id === item.id
                            )?.quantity || 0) >= item.availableQuantity
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium min-h-[44px] touch-manipulation"
                        >
                          <Plus className="w-4 h-4" size={16} />
                          {cart.find(
                            (cartItem) => cartItem.equipment.id === item.id
                          ) ? (
                            (cart.find((cartItem) => cartItem.equipment.id === item.id)?.quantity || 0) >= item.availableQuantity
                              ? "ถึงจำนวนสูงสุด"
                              : "เพิ่ม"
                          ) : (
                            "เพิ่มลงตะกร้า"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
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
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  ตะกร้าของฉัน
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {cart.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <ShoppingCart
                    className="mx-auto mb-4 text-gray-400 w-10 h-10 sm:w-12 sm:h-12"
                    size={48}
                  />
                  <p className="text-gray-500 text-sm sm:text-base">ตะกร้าของคุณยังว่างเปล่า</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    เลือกอุปกรณ์
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.equipment.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex-shrink-0">
                          <img
                            src={item.equipment.image}
                            alt={item.equipment.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {item.equipment.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            #{item.equipment.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.equipment.id)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors min-h-[44px] touch-manipulation"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" size={14} />
                          </button>
                          <span className="font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.equipment)}
                            disabled={item.quantity >= item.equipment.availableQuantity}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors min-h-[44px] touch-manipulation"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-base sm:text-lg font-semibold">รวมทั้งหมด:</span>
                      <span className="text-base sm:text-lg font-bold text-red-600">
                        {cartItemCount} รายการ
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                      >
                        เลือกอุปกรณ์เพิ่ม
                      </button>
                      <a
                        href="/Book_Detail"
                        className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center font-medium text-sm sm:text-base min-h-[44px] touch-manipulation flex items-center justify-center"
                      >
                        ดำเนินการต่อ
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EquipmentCatalogUser;