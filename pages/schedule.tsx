"use client";

import React, { useState, useEffect, useRef } from "react";
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
  quantity: number;
}

interface Holiday {
  name: string;
  date: string;
  observed: string;
  public: boolean;
}

export default function Schedule() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<BorrowEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      await fetchBorrowEvents(session);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      fetchBorrowEvents(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBorrowEvents = async (session: any) => {
    try {
      // If user is logged in, fetch their specific data
      if (session) {
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
      } else {
        // If not logged in, fetch public schedule
        const response = await fetch('/api/borrow/public', {
          method: 'GET',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setEvents(result.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching borrow events:', error);
    }
  };

  const fetchHolidays = async (year: number) => {
    try {
      const response = await fetch(`/api/holidays?year=${year}&country=TH`);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.holidays) {
          setHolidays(result.holidays);
        }
      } else {
        console.error('Error fetching holidays:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  useEffect(() => {
    fetchHolidays(currentDate.getFullYear());
  }, [currentDate.getFullYear()]);

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

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.filter(holiday => {
      const holidayDate = holiday.date.split('T')[0];
      return holidayDate === dateStr && holiday.public;
    });
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
        return <CheckCircle size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Approved";
      case "ACTIVE":
        return "Borrowing";
      case "PENDING":
        return "Pending";
      case "REJECTED":
        return "Rejected";
      case "RETURNED":
        return "Returned";
      case "OVERDUE":
        return "Overdue";
      default:
        return "Unknown Status";
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 border border-gray-100 rounded-md sm:rounded-lg p-1 sm:p-3 h-16 sm:h-24 md:h-28" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const dayHolidays = getHolidaysForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isHoliday = dayHolidays.length > 0;

      days.push(
        <motion.div
          key={day}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          className={`border rounded-md sm:rounded-lg p-1 sm:p-2 md:p-3 h-16 sm:h-24 md:h-28 cursor-pointer transition-all touch-manipulation ${
            isToday
              ? "bg-red-50 border-red-300 shadow-md"
              : isSelected
              ? "bg-blue-50 border-blue-300 shadow-md"
              : isHoliday
              ? "bg-purple-50 border-purple-300"
              : "bg-white border-gray-200 hover:border-red-200 hover:shadow-sm active:bg-gray-50"
          }`}
        >
          <div className="flex justify-between items-start mb-0.5 sm:mb-1 md:mb-2">
            <span
              className={`text-sm sm:text-base md:text-lg font-semibold ${
                isToday ? "text-red-600" : isHoliday ? "text-purple-700" : "text-gray-700"
              }`}
            >
              {day}
            </span>
            {(dayEvents.length > 0 || dayHolidays.length > 0) && (
              <span className={`text-xs ${isHoliday ? 'bg-purple-500' : 'bg-red-500'} text-white px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-full font-medium`}>
                {dayEvents.length + dayHolidays.length}
              </span>
            )}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayHolidays.slice(0, 1).map((holiday, idx) => (
              <div
                key={`holiday-${idx}`}
                className="text-xs p-0.5 sm:p-1 md:p-1.5 rounded truncate font-medium bg-purple-100 text-purple-800 border border-purple-300"
              >
                <span className="hidden sm:inline">{holiday.name}</span>
                <span className="sm:hidden">🎉</span>
              </div>
            ))}
            {dayEvents.slice(0, dayHolidays.length > 0 ? 1 : 2).map((event, idx) => {
              const isReturned = event.status === "RETURNED";
              const isActive = event.status === "APPROVED" || event.status === "ACTIVE";
              const isPending = event.status === "PENDING";

              return (
                <div
                  key={idx}
                  className={`text-xs p-0.5 sm:p-1 md:p-1.5 rounded truncate font-medium ${
                    isReturned
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : isActive
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : isPending
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="hidden sm:inline">{event.equipment.name}</span>
                  <span className="sm:hidden">•</span>
                </div>
              );
            })}
            {(dayEvents.length + dayHolidays.length) > 2 && (
              <div className="text-xs text-gray-500 font-medium hidden sm:block">+{(dayEvents.length + dayHolidays.length) - 2}</div>
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

  // Swipe handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextMonth();
    }
    if (isRightSwipe) {
      previousMonth();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibraryNavbar />

      <div className="pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Equipment Borrowing Schedule
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              View which days have equipment borrowing or returns
            </p>
          </motion.div>

          {/* Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6"
                ref={calendarRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={previousMonth}
                      className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-1 sm:flex-initial"
                      aria-label="เดือนก่อนหน้า"
                    >
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={today}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base touch-manipulation flex-1 sm:flex-initial"
                    >
                      Today
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-1 sm:flex-initial"
                      aria-label="เดือนถัดไป"
                    >
                      <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>

                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                    <div key={day} className="text-center text-xs sm:text-sm font-bold text-gray-700 py-1 sm:py-2">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][idx]}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {renderCalendar()}
                </div>

                {/* Color Legend */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 border border-purple-300 rounded flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700">Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700">Borrowing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700">Returned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-100 border border-amber-300 rounded flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border border-gray-300 rounded flex-shrink-0"></div>
                      <span className="text-xs sm:text-sm text-gray-700">Others</span>
                    </div>
                  </div>
                </div>

                {/* Swipe hint for mobile */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 sm:hidden">
                  <p className="text-xs text-gray-500 text-center">
                    Swipe left-right to change month
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Selected Date Events */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24"
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-red-600 sm:w-6 sm:h-6" />
                  <span className="truncate">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : "Select Date"}
                  </span>
                </h3>

                {selectedDate ? (
                  <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {/* Show Holidays First */}
                    {getHolidaysForDate(selectedDate).map((holiday, idx) => (
                      <div
                        key={`holiday-${idx}`}
                        className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-300 hover:border-purple-400 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-purple-900 text-base sm:text-lg break-words flex-1 pr-2">
                            {holiday.name}
                          </h4>
                          <span className="text-2xl flex-shrink-0">🎉</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-sm text-purple-700">
                          <p className="font-medium">Public Holiday</p>
                          <p className="text-xs text-purple-600">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Show Borrow Events */}
                    {getEventsForDate(selectedDate).length > 0 ? (
                      getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg break-words flex-1 pr-2">
                              {event.equipment.name}
                            </h4>
                            <div className="flex-shrink-0">{getStatusIcon(event.status)}</div>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2 text-sm text-gray-600">
                            {user && event.user.displayName && (
                              <div className="flex items-center gap-2">
                                <UserIcon size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                <span className="truncate">{event.user.displayName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Package size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                              <span className="truncate">{event.equipment.category} • Quantity: {event.quantity} pcs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                              <span className="font-medium">{getStatusText(event.status)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200 mt-2 space-y-1">
                              <p className="text-xs text-gray-500">
                                Borrow: {new Date(event.startDate).toLocaleDateString('en-US')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Return: {new Date(event.endDate).toLocaleDateString('en-US')}
                              </p>
                            </div>
                            {user && event.purpose && event.purpose !== 'การยืมอุปกรณ์' && (
                              <div className="pt-2 border-t border-gray-200 mt-2">
                                <p className="text-xs text-gray-500 break-words">
                                  <span className="font-medium">Purpose:</span> {event.purpose}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : getHolidaysForDate(selectedDate).length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <CalendarIcon className="mx-auto mb-3 text-gray-400" size={40} />
                        <p className="text-gray-500 text-sm sm:text-base">No activities on this day</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <CalendarIcon className="mx-auto mb-3 sm:mb-4 text-gray-400" size={48} />
                    <p className="text-gray-500 text-base sm:text-lg">Click on a day in the calendar</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">to view details</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
