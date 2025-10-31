"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Calendar,
  FileText,
  Package,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Trash2,
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
  location: string;
  serialNumber: string;
}

interface CartItem {
  equipment: Equipment;
  quantity: number;
}

export default function BookDetail() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Load cart from localStorage
    const savedCart = localStorage.getItem('equipmentCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const removeFromCart = (equipmentId: string) => {
    const updatedCart = cart.filter(item => item.equipment.id !== equipmentId);
    setCart(updatedCart);
    localStorage.setItem('equipmentCart', JSON.stringify(updatedCart));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (cart.length === 0) {
      setError('กรุณาเลือกอุปกรณ์ที่ต้องการยืม');
      return;
    }

    // Prevent double submission
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        router.push('/auth');
        return;
      }

      const token = session.access_token;

      // Submit each equipment borrow request
      const results = await Promise.all(
        cart.map(async (item) => {
          const borrowData = {
            equipmentId: item.equipment.id,
            quantity: item.quantity,
            startDate: formData.startDate,
            endDate: formData.endDate,
            purpose: formData.purpose,
            notes: formData.notes || null,
          };

          const response = await fetch('/api/borrow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ token, borrowData }),
          });

          return await response.json();
        })
      );

      // Check if all requests succeeded
      const allSuccess = results.every(result => result.success);

      if (allSuccess) {
        setSuccess(true);
        // Clear cart
        setCart([]);
        localStorage.removeItem('equipmentCart');

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/Borrowing_History');
        }, 2000);
      } else {
        const failedItems = results.filter(r => !r.success);
        setError(`ไม่สามารถยืมอุปกรณ์บางรายการได้: ${failedItems.map(r => r.error).join(', ')}`);
      }
    } catch (err) {
      console.error('Error submitting borrow request:', err);
      setError('เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LibraryNavbar />
        <div className="pt-20 sm:pt-24 pb-6 sm:pb-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 text-center"
            >
              <CheckCircle className="mx-auto mb-4 text-green-600 w-12 h-12 sm:w-16 sm:h-16" size={64} />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Borrow request submitted successfully!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Your equipment borrow request has been sent to the administrator
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Redirecting you to the borrowing history page...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Confirm Equipment Borrowing
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Fill in the information and confirm equipment borrowing
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 sm:gap-3"
            >
              <AlertCircle className="flex-shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" size={20} />
              <div className="flex-1 text-sm sm:text-base">
                {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 min-h-[44px] touch-manipulation flex items-center justify-center"
              >
                ✕
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-24">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" size={24} />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Equipment List
                  </h3>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Package className="mx-auto mb-3 text-gray-400 w-10 h-10 sm:w-12 sm:h-12" size={48} />
                    <p className="text-sm sm:text-base text-gray-500">ไม่มีรายการอุปกรณ์</p>
                    <button
                      onClick={() => router.push('/equipment/catalog')}
                      className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                    >
                      เลือกอุปกรณ์
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.equipment.id}
                        className="p-2.5 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                              {item.equipment.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {item.equipment.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.equipment.id)}
                            className="text-red-600 hover:text-red-700 p-1 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium text-gray-900">
                            {item.quantity} Piece
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          Total:
                        </span>
                        <span className="text-base sm:text-lg font-bold text-red-600">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} Piece
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Borrow Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Borrowing Information
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        <Calendar className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" size={16} />
                        Borrow Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={getTodayDate()}
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm sm:text-base touch-manipulation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        <Calendar className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" size={16} />
                        Return Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={formData.startDate || getTodayDate()}
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm sm:text-base touch-manipulation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      <FileText className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" size={16} />
                      Purpose of Borrowing *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      placeholder="Please specify the purpose of borrowing the equipment"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm sm:text-base touch-manipulation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      <FileText className="inline mr-2 w-4 h-4 sm:w-5 sm:h-5" size={16} />
                      Additional Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Additional Notes or Information (if any)"
                      className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 text-sm sm:text-base touch-manipulation"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    type="button"
                    onClick={() => router.push('/equipment/catalog')}
                    disabled={submitting}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    Back to Select Equipment
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        <span>Submitting Request หรือ Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" size={20} />
                        <span>Confirm Borrowing</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
