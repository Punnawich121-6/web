"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface BorrowEvent {
  id: string;
  user: {
    displayName: string;
    email: string;
  };
  equipment: {
    name: string;
    category: string;
  };
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "RETURNED" | "OVERDUE";
  purpose: string;
}

export default function Schedule() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<BorrowEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      await fetchBorrowEvents(session);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
        fetchBorrowEvents(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchBorrowEvents = async (session: any) => {
    try {
      const token = session.access_token;
      const response = await fetch(`/api/borrow?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEvents(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching borrow events:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const start = event.startDate.split('T')[0];
      const end = event.endDate.split('T')[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-100 rounded-lg p-2 h-24" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: 1.02 }}
          onClick={() => setSelectedDate(date)}
          className={`border rounded-lg p-2 h-24 cursor-pointer transition-all ${
            isToday
              ? "bg-red-50 border-red-300 shadow-sm"
              : isSelected
              ? "bg-blue-50 border-blue-300 shadow-sm"
              : "bg-white border-gray-200 hover:border-red-200 hover:shadow-sm"
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium ${
                isToday ? "text-red-600" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs p-1 rounded truncate ${
                  event.status === "APPROVED" || event.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : event.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {event.equipment.name}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "ACTIVE":
        return <CheckCircle size={16} className="text-green-600" />;
      case "PENDING":
        return <Clock size={16} className="text-yellow-600" />;
      case "REJECTED":
        return <XCircle size={16} className="text-red-600" />;
      case "RETURNED":
        return <CheckCircle size={16} className="text-gray-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "ACTIVE":
        return "กำลังยืม";
      case "PENDING":
        return "รออนุมัติ";
      case "REJECTED":
        return "ปฏิเสธ";
      case "RETURNED":
        return "คืนแล้ว";
      case "OVERDUE":
        return "เกินกำหนด";
      default:
        return "ไม่ทราบสถานะ";
    }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ปฏิทินการยืมอุปกรณ์
            </h1>
            <p className="text-xl text-gray-600">
              ดูกำหนดการและสถานะการยืมอุปกรณ์
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={today}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      วันนี้
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <CalendarIcon className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Dashboard</div>
                      <div className="text-sm text-blue-700">ภาพรวมการยืม</div>
                    </div>
                  </div>
                </motion.a>

                <motion.a
                  href="/Borrowing_History"
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Package className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-green-900">History</div>
                      <div className="text-sm text-green-700">ประวัติการยืม</div>
                    </div>
                  </div>
                </motion.a>
              </div>
            </div>

            {/* Sidebar - Selected Date Events */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-red-600" />
                  {selectedDate
                    ? selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })
                    : "เลือกวันที่"}
                </h3>

                {selectedDate ? (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{event.equipment.name}</h4>
                            {getStatusIcon(event.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <UserIcon size={14} />
                              <span>{event.user.displayName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package size={14} />
                              <span>{event.equipment.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{getStatusText(event.status)}</span>
                            </div>
                            {event.purpose && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  วัตถุประสงค์: {event.purpose}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="mx-auto mb-3 text-gray-400" size={48} />
                        <p className="text-gray-500">ไม่มีกิจกรรมในวันนี้</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-gray-500">เลือกวันที่เพื่อดูรายละเอียด</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
