"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import LibraryNavbar from "../../components/LibraryNavbar";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  MapPin,
  User as UserIcon,
  Calendar,
  AlertCircle,
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
  specifications?: string;
  location: string;
  serialNumber: string;
  condition?: string;
  creator?: {
    displayName?: string;
    email: string;
  };
  borrowings?: any[];
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  role: "USER" | "ADMIN" | "MODERATOR" | null;
  displayName?: string;
  email?: string;
}

const AdminEquipmentPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session.user);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchUserData(session.user);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userData?.role === "ADMIN") {
      fetchEquipment();
    }
  }, [userData]);

  const fetchUserData = async (currentUser: User) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const result = await response.json();

      if (result.success) {
        setEquipment(result.data);
      } else {
        setError(result.error || 'Failed to fetch equipment');
      }
    } catch (err) {
      setError('Failed to fetch equipment');
      console.error('Error fetching equipment:', err);
    }
  };

  const handleAddEquipment = async (equipmentData: any): Promise<void> => {
    try {
      if (!user) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const token = session.access_token;
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token, equipmentData }),
      });

      const result = await response.json();

      if (result.success) {
        setEquipment([result.data, ...equipment]);
        setShowAddModal(false);
        // Clear any previous errors
        setError(null);
      } else {
        setError(result.error || 'ไม่สามารถเพิ่มอุปกรณ์ได้');
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถเพิ่มอุปกรณ์ได้';
      setError(errorMessage);
      console.error('Error adding equipment:', err);
      throw err; // Re-throw to handle in modal
    }
  };

  const handleUpdateEquipment = async (id: string, equipmentData: any): Promise<void> => {
    try {
      if (!user) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const token = session.access_token;
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token, equipmentData }),
      });

      const result = await response.json();

      if (result.success) {
        setEquipment(equipment.map(item =>
          item.id === id ? result.data : item
        ));
        setEditingEquipment(null);
        // Clear any previous errors
        setError(null);
      } else {
        setError(result.error || 'ไม่สามารถแก้ไขอุปกรณ์ได้');
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถแก้ไขอุปกรณ์ได้';
      setError(errorMessage);
      console.error('Error updating equipment:', err);
      throw err; // Re-throw to handle in modal
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      if (!user) return;
      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบอุปกรณ์นี้?')) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const token = session.access_token;
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setEquipment(equipment.filter(item => item.id !== id));
      } else {
        setError(result.error || 'Failed to delete equipment');
      }
    } catch (err) {
      setError('Failed to delete equipment');
      console.error('Error deleting equipment:', err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "BORROWED":
        return "bg-red-100 text-red-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "RETIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categories = ["all", "อิเล็กทรอนิกส์", "เครื่องเสียง", "เครื่องจักร"];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  if (!user || userData?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ไม่มีสิทธิ์เข้าถึง
              </h2>
              <p className="text-gray-600">
                หน้านี้เฉพาะสำหรับผู้ดูแลระบบเท่านั้น
              </p>
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
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  จัดการอุปกรณ์
                </h1>
                <p className="text-xl text-gray-600">
                  เพิ่ม แก้ไข และจัดการอุปกรณ์ในระบบ
                </p>
              </div>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={20} />
                <span>เพิ่มอุปกรณ์</span>
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ค้นหาอุปกรณ์, รหัสอุปกรณ์..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white transition-all"
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
            <div className="mt-4 text-sm text-gray-600">
              พบอุปกรณ์ {filteredEquipment.length} รายการ
            </div>
          </div>

          {/* Equipment Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.name}
                    </h3>
                    <span className="text-sm text-gray-500">#{item.serialNumber}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Package size={14} className="mr-1" />
                      {item.category}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {item.location}
                    </div>
                    <div>
                      พร้อมใช้: {item.availableQuantity}/{item.totalQuantity}
                    </div>
                    <div className="flex items-center">
                      <UserIcon size={14} className="mr-1" />
                      {item.creator?.displayName || item.creator?.email}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEquipment(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg">
                ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Equipment Modal */}
      {(showAddModal || editingEquipment) && (
        <EquipmentModal
          equipment={editingEquipment}
          onSave={editingEquipment ?
            (data) => handleUpdateEquipment(editingEquipment.id, data) :
            handleAddEquipment
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingEquipment(null);
          }}
        />
      )}
    </div>
  );
};

// Equipment Modal Component
const EquipmentModal = ({
  equipment,
  onSave,
  onClose
}: {
  equipment?: Equipment | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    category: equipment?.category || 'อิเล็กทรอนิกส์',
    description: equipment?.description || '',
    image: equipment?.image || '',
    location: equipment?.location || '',
    serialNumber: equipment?.serialNumber || '',
    condition: equipment?.condition || '',
    totalQuantity: equipment?.totalQuantity || 1,
    availableQuantity: equipment?.availableQuantity || 1,
    status: equipment?.status || 'AVAILABLE',
    specifications: equipment?.specifications || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(equipment?.image || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (JPEG, PNG, WebP, GIF)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
        return;
      }

      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
        setUploadingImage(false);
      }

      const submitData = {
        ...formData,
        image: imageUrl,
        specifications: formData.specifications || null,
      };
      await onSave(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {equipment ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่ออุปกรณ์ *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่ *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="อิเล็กทรอนิกส์">อิเล็กทรอนิกส์</option>
                <option value="เครื่องเสียง">เครื่องเสียง</option>
                <option value="เครื่องจักร">เครื่องจักร</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสอุปกรณ์ *
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานที่ *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนทั้งหมด *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalQuantity}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนที่พร้อมใช้ *
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.totalQuantity}
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="AVAILABLE">พร้อมใช้งาน</option>
                <option value="BORROWED">ถูกยืม</option>
                <option value="MAINTENANCE">ซ่อมบำรุง</option>
                <option value="RETIRED">เลิกใช้งาน</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพอุปกรณ์
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                รองรับไฟล์: JPEG, PNG, WebP, GIF (ขนาดไม่เกิน 5MB)
              </p>
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สภาพ
              </label>
              <input
                type="text"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คุณสมบัติ
            </label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows={4}
              placeholder="ระบุคุณสมบัติของอุปกรณ์ เช่น ขนาด, น้ำหนัก, สี, แบรนด์ ฯลฯ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>กำลังอัปโหลดรูปภาพ...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                equipment ? 'บันทึกการแก้ไข' : 'เพิ่มอุปกรณ์'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminEquipmentPage;