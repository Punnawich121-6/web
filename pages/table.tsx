"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LibraryNavbar from "../components/LibraryNavbar";

// --- Calendar Interfaces ---
interface BookingEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  type: "borrowed" | "requested" | "maintenance" | "reserved";
  equipmentName: string;
  borrowerName: string;
  details?: string;
  startTime?: string;
  endTime?: string;
  priority?: "high" | "medium" | "low";
}

interface Holiday {
  date: string;
  name: string;
  type: "national" | "religious" | "special";
}

interface CalendarTableProps {
  events?: BookingEvent[];
  currentMonth?: number;
  currentYear?: number;
  onDateClick?: (date: string) => void;
  onEventClick?: (event: BookingEvent) => void;
  showWeekNumbers?: boolean;
  highlightToday?: boolean;
  holidayApiKey?: string;
  calendarificApiKey?: string;
  preferredApiProvider?: "holidayapi" | "calendarific" | "auto";
}

// --- Day Detail Modal Component ---
const DayDetailModal = ({
  date,
  events,
  holiday,
  isVisible,
  onClose,
}: {
  date: string;
  events: BookingEvent[];
  holiday: Holiday | null;
  isVisible: boolean;
  onClose: () => void;
}) => {
  if (!isVisible) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const dayNames = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];

    return `วัน${dayNames[date.getDay()]}ที่ ${date.getDate()} ${
      monthNames[date.getMonth()]
    } ${date.getFullYear() + 543}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white p-4 sm:p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold">{formatDate(date)}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Holiday Information */}
            {holiday && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="font-bold text-red-800 text-lg">
                      {holiday.name}
                    </div>
                    <div className="text-red-600 text-sm">
                      {holiday.type === "national"
                        ? "วันหยุดราชการ"
                        : holiday.type === "religious"
                        ? "วันสำคัญทางพุทธศาสนา"
                        : "วันพิเศษ"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Events */}
            {events.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                  กิจกรรม ({events.length} รายการ)
                </h3>

                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-2xl border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                      event.type === "borrowed"
                        ? "bg-green-50 border-green-500"
                        : event.type === "requested"
                        ? "bg-red-50 border-red-500"
                        : event.type === "maintenance"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-rose-50 border-rose-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            event.type === "borrowed"
                              ? "bg-green-200 text-green-800"
                              : event.type === "requested"
                              ? "bg-red-200 text-red-800"
                              : event.type === "maintenance"
                              ? "bg-orange-200 text-orange-800"
                              : "bg-rose-200 text-rose-800"
                          }`}
                        >
                          {event.type === "borrowed"
                            ? "การยืม"
                            : event.type === "requested"
                            ? "คำขอ"
                            : event.type === "maintenance"
                            ? "บำรุงรักษา"
                            : "จอง"}
                        </div>

                        {event.priority && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.priority === "high"
                                ? "bg-red-200 text-red-800"
                                : event.priority === "medium"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {event.priority === "high"
                              ? "สำคัญ"
                              : event.priority === "medium"
                              ? "ปานกลาง"
                              : "ต่ำ"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">อุปกรณ์:</span>
                        <span>{event.equipmentName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium">ผู้ยืม:</span>
                        <span>{event.borrowerName}</span>
                      </div>

                      {event.startTime && event.endTime && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">เวลา:</span>
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      )}

                      {event.details && (
                        <div className="flex items-start gap-2">
                          <span className="font-medium">รายละเอียด:</span>
                          <span>{event.details}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !holiday && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">ไม่มีกิจกรรมในวันนี้</p>
                </div>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Calendar Component ---
const AdvancedCalendarTable: React.FC<CalendarTableProps> = ({
  events = [],
  currentMonth = new Date().getMonth(),
  currentYear = new Date().getFullYear(),
  onDateClick,
  onEventClick,
  showWeekNumbers = false,
  highlightToday = true,
  holidayApiKey = "39b28a3c-6d13-4e5c-946a-3ac1759e3f8d",
  calendarificApiKey,
  preferredApiProvider = "auto",
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(
    new Date(currentYear, currentMonth, 1)
  );
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [holidayError, setHolidayError] = useState<string | null>(null);
  const [currentApiProvider, setCurrentApiProvider] = useState<string>("");

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const dayNamesLong = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];

  const fetchFromHolidayAPI = async (year: number): Promise<Holiday[]> => {
    const response = await fetch(
      `https://holidayapi.com/v1/holidays?pretty&key=${holidayApiKey}&country=TH&year=${year}`
    );
    if (!response.ok) throw new Error(`HolidayAPI error: ${response.status}`);
    const data = await response.json();
    let formattedHolidays: Holiday[] = [];
    if (data.holidays) {
      if (Array.isArray(data.holidays)) {
        formattedHolidays = data.holidays.map((holiday: any) => ({
          date: holiday.date,
          name: holiday.name,
          type: holiday.public ? "national" : "special",
        }));
      } else if (typeof data.holidays === "object") {
        formattedHolidays = Object.entries(data.holidays).flatMap(
          ([date, holidayData]: [string, any]) => {
            if (Array.isArray(holidayData)) {
              return holidayData.map((holiday: any) => ({
                date,
                name: holiday.name,
                type: holiday.public ? "national" : "special",
              }));
            } else if (holidayData && typeof holidayData === "object") {
              return [
                {
                  date,
                  name: holidayData.name,
                  type: holidayData.public ? "national" : "special",
                },
              ];
            }
            return [];
          }
        );
      }
    }
    return formattedHolidays;
  };

  const fetchFromCalendarific = async (year: number): Promise<Holiday[]> => {
    const response = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${calendarificApiKey}&country=TH&year=${year}`
    );
    if (!response.ok) throw new Error(`Calendarific error: ${response.status}`);
    const data = await response.json();
    if (data.response && data.response.holidays) {
      return data.response.holidays.map((holiday: any) => ({
        date: holiday.date.iso,
        name: holiday.name,
        type:
          holiday.primary_type === "National holiday" ? "national" : "special",
      }));
    }
    return [];
  };

  const fetchHolidays = async (year: number) => {
    setLoadingHolidays(true);
    setHolidayError(null);
    setCurrentApiProvider("");

    const apis = [];
    if (preferredApiProvider === "holidayapi" && holidayApiKey)
      apis.push({ name: "HolidayAPI", fetch: () => fetchFromHolidayAPI(year) });
    if (preferredApiProvider === "calendarific" && calendarificApiKey)
      apis.push({
        name: "Calendarific",
        fetch: () => fetchFromCalendarific(year),
      });
    if (preferredApiProvider === "auto" || apis.length === 0) {
      if (holidayApiKey)
        apis.push({
          name: "HolidayAPI",
          fetch: () => fetchFromHolidayAPI(year),
        });
      if (calendarificApiKey)
        apis.push({
          name: "Calendarific",
          fetch: () => fetchFromCalendarific(year),
        });
    }

    for (const api of apis) {
      try {
        const holidays = await api.fetch();
        if (holidays.length > 0) {
          setHolidays(holidays);
          setCurrentApiProvider(api.name);
          setLoadingHolidays(false);
          return;
        }
      } catch (error) {
        console.warn(`${api.name} failed:`, error);
      }
    }

    // If all APIs fail, show error and empty holidays
    console.warn("All holiday APIs failed");
    setHolidayError("ไม่สามารถโหลดข้อมูลวันหยุดได้");
    setHolidays([]);
    setCurrentApiProvider("API Error");
    setLoadingHolidays(false);
  };

  useEffect(() => {
    fetchHolidays(currentDate.getFullYear());
  }, [
    currentDate.getFullYear(),
    holidayApiKey,
    calendarificApiKey,
    preferredApiProvider,
  ]);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(
      direction === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1
    );
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const startingDayOfWeek = firstDay.getDay();
  const calendarDays = [
    ...Array(startingDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEventsForDay = (day: number) =>
    events.filter(
      (event) =>
        event.date ===
        `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );

  const getHolidayForDay = (day: number) =>
    holidays.find(
      (holiday) =>
        holiday.date ===
        `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    ) || null;

  const isWeekend = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const isToday = (day: number) =>
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}` === todayString;

  const getWeekNumber = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getDayStyle = (day: number | null): string => {
    if (!day) return "text-slate-300";
    let baseStyle =
      "relative h-16 sm:h-20 p-1 sm:p-2 text-center cursor-pointer transition-all duration-300 rounded-lg sm:rounded-xl text-xs sm:text-base";
    if (isToday(day) && highlightToday) {
      baseStyle += " ring-2 ring-red-500 bg-red-50";
    } else if (getHolidayForDay(day)) {
      baseStyle += " bg-red-50 text-red-700 border-2 border-red-200";
    } else if (isWeekend(day)) {
      baseStyle += " bg-slate-50 text-slate-600";
    } else {
      const dayEvents = getEventsForDay(day);
      const hasMaintenance = dayEvents.some((e) => e.type === "maintenance");
      const hasRequests = dayEvents.some((e) => e.type === "requested");
      const hasBorrowed = dayEvents.some((e) => e.type === "borrowed");
      const hasReserved = dayEvents.some((e) => e.type === "reserved");
      if (hasMaintenance) {
        baseStyle +=
          " bg-orange-100 border-2 border-orange-400 text-orange-800";
      } else if (hasRequests && hasBorrowed) {
        baseStyle +=
          " bg-yellow-100 border-2 border-yellow-400 text-yellow-800";
      } else if (hasRequests) {
        baseStyle += " bg-red-100 border-2 border-red-400 text-red-800";
      } else if (hasBorrowed) {
        baseStyle += " bg-green-100 border-2 border-green-400 text-green-800";
      } else if (hasReserved) {
        baseStyle += " bg-rose-100 border-2 border-rose-400 text-rose-800";
      } else {
        baseStyle +=
          " hover:bg-slate-100 border border-slate-200 hover:border-red-300";
      }
    }
    return baseStyle;
  };

  const handleMouseMove = (e: React.MouseEvent) =>
    setMousePosition({ x: e.clientX, y: e.clientY });

  const handleDateClick = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateString);
    onDateClick?.(dateString);
  };

  const renderTooltip = (day: number) => {
    const dayEvents = getEventsForDay(day);
    const holiday = getHolidayForDay(day);
    if (dayEvents.length === 0 && !holiday) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 max-w-sm pointer-events-none"
        style={{
          left: Math.min(mousePosition.x + 15, window.innerWidth - 300),
          top: Math.max(mousePosition.y - 10, 10),
        }}
      >
        <div className="font-bold text-lg mb-3 text-slate-900">
          {day} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>

        {holiday && (
          <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-200">
            <div className="font-medium text-red-700 flex items-center gap-2">
              {holiday.name}
            </div>
            <div className="text-xs text-red-600 mt-1 capitalize">
              {holiday.type === "national"
                ? "วันหยุดราชการ"
                : holiday.type === "religious"
                ? "วันสำคัญทางพุทธศาสนา"
                : "วันพิเศษ"}
            </div>
          </div>
        )}

        {dayEvents.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600">
              กิจกรรม ({dayEvents.length} รายการ)
            </div>

            <div className="text-sm text-slate-700 space-y-1">
              {dayEvents.slice(0, 2).map((event, index) => (
                <div key={event.id} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      event.type === "borrowed"
                        ? "bg-green-400"
                        : event.type === "requested"
                        ? "bg-red-400"
                        : event.type === "maintenance"
                        ? "bg-orange-400"
                        : "bg-rose-400"
                    }`}
                  ></div>
                  <span className="truncate">
                    {event.type === "borrowed"
                      ? "ยืม"
                      : event.type === "requested"
                      ? "คำขอ"
                      : event.type === "maintenance"
                      ? "บำรุง"
                      : "จอง"}{" "}
                    - {event.equipmentName}
                  </span>
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-slate-500">
                  และอีก {dayEvents.length - 2} รายการ
                </div>
              )}
            </div>

            <div className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              คลิกเพื่อดูรายละเอียด
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-10xl mx-auto p-4 sm:p-6">
      {/* Status Summary - moved to top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            title: "รายการยืม",
            value: events.filter((e) => e.type === "borrowed").length,
            color: "green",
          },
          {
            title: "คำขอรออนุมัติ",
            value: events.filter((e) => e.type === "requested").length,
            color: "red",
          },
          {
            title: "บำรุงรักษา",
            value: events.filter((e) => e.type === "maintenance").length,
            color: "orange",
          },
          {
            title: "จองล่วงหน้า",
            value: events.filter((e) => e.type === "reserved").length,
            color: "rose",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-2xl font-bold ${
                    stat.color === "green"
                      ? "text-green-600"
                      : stat.color === "red"
                      ? "text-red-600"
                      : stat.color === "orange"
                      ? "text-orange-600"
                      : "text-rose-600"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.title}</div>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stat.color === "green"
                    ? "bg-green-100"
                    : stat.color === "red"
                    ? "bg-red-100"
                    : stat.color === "orange"
                    ? "bg-orange-100"
                    : "bg-rose-100"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full ${
                    stat.color === "green"
                      ? "bg-green-400"
                      : stat.color === "red"
                      ? "bg-red-400"
                      : stat.color === "orange"
                      ? "bg-orange-400"
                      : "bg-rose-400"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  {loadingHolidays && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {currentApiProvider && !holidayError && (
                    <div
                      className="text-xs bg-white/20 px-2 py-1 rounded-full"
                      title={`Holiday data from ${currentApiProvider}`}
                    >
                      {currentApiProvider}
                    </div>
                  )}
                  {holidayError && (
                    <div
                      className="text-red-200 text-xs bg-red-500/20 px-2 py-1 rounded-full"
                      title={holidayError}
                    >
                      API Error
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all font-medium"
              >
                วันนี้
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded-lg"></div>
              <span className="text-slate-700">การยืม</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded-lg"></div>
              <span className="text-slate-700">คำขอ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 border-2 border-orange-400 rounded-lg"></div>
              <span className="text-slate-700">บำรุงรักษา</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-200 border-2 border-rose-400 rounded-lg"></div>
              <span className="text-slate-700">จอง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-lg"></div>
              <span className="text-slate-700">วันหยุด</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {dayNames.map((dayName, index) => (
              <div
                key={index}
                className="p-2 sm:p-4 text-center font-bold bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-base"
              >
                <div className="hidden sm:block">{dayNamesLong[index]}</div>
                <div className="sm:hidden">{dayName}</div>
              </div>
            ))}
            <AnimatePresence>
              {calendarDays.map((day, index) => (
                <motion.div
                  key={`${currentDate.getMonth()}-${day || index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.01 }}
                  className={getDayStyle(day)}
                  onMouseEnter={() => day && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onMouseMove={handleMouseMove}
                  onClick={() => day && handleDateClick(day)}
                >
                  {day && (
                    <>
                      <div className="text-sm sm:text-lg font-semibold mb-1">{day}</div>
                      {isToday(day) && highlightToday && (
                        <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {getEventsForDay(day).length > 0 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-1 flex-wrap justify-center max-w-full">
                            {getEventsForDay(day)
                              .slice(0, 3)
                              .map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={`w-2 h-2 rounded-full ${
                                    event.type === "borrowed"
                                      ? "bg-green-500"
                                      : event.type === "requested"
                                      ? "bg-red-500"
                                      : event.type === "maintenance"
                                      ? "bg-orange-500"
                                      : "bg-rose-500"
                                  }`}
                                />
                              ))}
                            {getEventsForDay(day).length > 3 && (
                              <div className="w-2 h-2 rounded-full bg-slate-400 text-xs flex items-center justify-center">
                                +
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {showWeekNumbers && index % 7 === 0 && (
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
                          W{getWeekNumber(day)}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {hoveredDay && renderTooltip(hoveredDay)}
        </AnimatePresence>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          events={getEventsForDay(parseInt(selectedDate.split("-")[2]))}
          holiday={getHolidayForDay(parseInt(selectedDate.split("-")[2]))}
          isVisible={!!selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingEvents();
  }, []);

  const fetchBookingEvents = async () => {
    try {
      setLoading(true);
      // For now, we'll use empty array since the booking API might not be fully implemented
      // In the future, this would fetch from /api/bookings or /api/borrow
      setEvents([]);
    } catch (err) {
      setError('Failed to fetch booking events');
      console.error('Error fetching booking events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: string) => {
    console.log("Date clicked:", date);
  };

  const handleEventClick = (event: BookingEvent) => {
    console.log("Event clicked:", event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <LibraryNavbar />
      <div className="max-w-full px-4 sm:px-6 pt-20 sm:pt-24">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-xl">กำลังโหลดตารางการจอง...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-xl mb-4">เกิดข้อผิดพลาด: {error}</p>
            <button
              onClick={fetchBookingEvents}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <AdvancedCalendarTable
            events={events}
            currentMonth={new Date().getMonth()}
            currentYear={new Date().getFullYear()}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            showWeekNumbers={true}
            highlightToday={true}
          />
        )}
      </div>
    </div>
  );
};

export default App;
