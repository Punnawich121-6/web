"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
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

  // Fetch holidays from HolidayAPI.com
  const fetchFromHolidayAPI = async (year: number): Promise<Holiday[]> => {
    const response = await fetch(
      `https://holidayapi.com/v1/holidays?pretty&key=${holidayApiKey}&country=TH&year=${year}`
    );

    if (!response.ok) {
      throw new Error(`HolidayAPI error: ${response.status}`);
    }

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

  // Fetch holidays from Calendarific.com
  const fetchFromCalendarific = async (year: number): Promise<Holiday[]> => {
    const response = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${calendarificApiKey}&country=TH&year=${year}`
    );

    if (!response.ok) {
      throw new Error(`Calendarific error: ${response.status}`);
    }

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

  // Fetch holidays from multiple APIs with fallback
  const fetchHolidays = async (year: number) => {
    setLoadingHolidays(true);
    setHolidayError(null);
    setCurrentApiProvider("");

    const apis = [];

    // Determine API priority based on preference and available keys
    if (preferredApiProvider === "holidayapi" && holidayApiKey) {
      apis.push({ name: "HolidayAPI", fetch: () => fetchFromHolidayAPI(year) });
    }
    if (preferredApiProvider === "calendarific" && calendarificApiKey) {
      apis.push({
        name: "Calendarific",
        fetch: () => fetchFromCalendarific(year),
      });
    }

    // Auto mode - try available APIs
    if (preferredApiProvider === "auto" || apis.length === 0) {
      if (holidayApiKey) {
        apis.push({
          name: "HolidayAPI",
          fetch: () => fetchFromHolidayAPI(year),
        });
      }
      if (calendarificApiKey) {
        apis.push({
          name: "Calendarific",
          fetch: () => fetchFromCalendarific(year),
        });
      }
    }

    // Try each API until one succeeds
    for (const api of apis) {
      try {
        console.log(`Trying ${api.name}...`);
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

    // If all APIs fail, use fallback data
    console.warn("All holiday APIs failed, using fallback data");
    setHolidayError("Using offline holiday data");
    setHolidays(getDefaultThaiHolidays(year));
    setCurrentApiProvider("Offline");
    setLoadingHolidays(false);
  };

  // Fallback Thai holidays data
  const getDefaultThaiHolidays = (year: number): Holiday[] => {
    const baseHolidays = [
      { date: `${year}-01-01`, name: "วันขึ้นปีใหม่", type: "national" },
      { date: `${year}-04-06`, name: "วันจักรี", type: "national" },
      { date: `${year}-04-13`, name: "วันสงกรานต์", type: "national" },
      { date: `${year}-04-14`, name: "วันสงกรานต์", type: "national" },
      { date: `${year}-04-15`, name: "วันสงกรานต์", type: "national" },
      { date: `${year}-05-01`, name: "วันแรงงานแห่งชาติ", type: "national" },
      { date: `${year}-05-04`, name: "วันฉัตรมงคล", type: "national" },
      {
        date: `${year}-07-28`,
        name: "วันเฉลิมพระชนมพรรษา ร.10",
        type: "national",
      },
      { date: `${year}-08-12`, name: "วันแม่แห่งชาติ", type: "national" },
      {
        date: `${year}-10-13`,
        name: "วันคล้ายวันสวรรคต ร.9",
        type: "national",
      },
      { date: `${year}-10-23`, name: "วันปิยมหาราช", type: "national" },
      { date: `${year}-12-05`, name: "วันพ่อแห่งชาติ", type: "national" },
      { date: `${year}-12-10`, name: "วันรัฐธรรมนูญ", type: "national" },
      { date: `${year}-12-31`, name: "วันสิ้นปี", type: "national" },
    ];

    return baseHolidays as Holiday[];
  };

  // Fetch holidays when year changes
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

  // Navigation functions
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar data
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create calendar grid
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get events for a specific day
  const getEventsForDay = (day: number): BookingEvent[] => {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateString);
  };

  // Get holiday for a specific day
  const getHolidayForDay = (day: number): Holiday | null => {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return holidays.find((holiday) => holiday.date === dateString) || null;
  };

  // Check if day is weekend
  const isWeekend = (day: number): boolean => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return date.getDay() === 0 || date.getDay() === 6;
  };

  // Check if day is today
  const isToday = (day: number): boolean => {
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateString === todayString;
  };

  // Get week number
  const getWeekNumber = (day: number): number => {
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

  // Get day style based on events and conditions
  const getDayStyle = (day: number | null): string => {
    if (!day) return "text-slate-300 dark:text-slate-700";

    const dayEvents = getEventsForDay(day);
    const holiday = getHolidayForDay(day);
    const weekend = isWeekend(day);
    const isCurrentDay = isToday(day);

    let baseStyle =
      "relative h-20 p-2 text-center cursor-pointer transition-all duration-300 rounded-xl";

    // Today highlight
    if (isCurrentDay && highlightToday) {
      baseStyle +=
        " ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20";
    }

    // Holiday style
    else if (holiday) {
      baseStyle +=
        " bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800";
    }

    // Weekend style
    else if (weekend) {
      baseStyle +=
        " bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400";
    }

    // Event-based styles
    else {
      const hasRequests = dayEvents.some((event) => event.type === "requested");
      const hasBorrowed = dayEvents.some((event) => event.type === "borrowed");
      const hasMaintenance = dayEvents.some(
        (event) => event.type === "maintenance"
      );
      const hasReserved = dayEvents.some((event) => event.type === "reserved");

      if (hasMaintenance) {
        baseStyle +=
          " bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-400 dark:border-orange-600 text-orange-800 dark:text-orange-300";
      } else if (hasRequests && hasBorrowed) {
        baseStyle +=
          " bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300";
      } else if (hasRequests) {
        baseStyle +=
          " bg-red-100 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300";
      } else if (hasBorrowed) {
        baseStyle +=
          " bg-green-100 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300";
      } else if (hasReserved) {
        baseStyle +=
          " bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-300";
      } else {
        baseStyle +=
          " hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600";
      }
    }

    return baseStyle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

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
        className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl shadow-2xl p-4 max-w-sm"
        style={{
          left: Math.min(mousePosition.x + 15, window.innerWidth - 300),
          top: Math.max(mousePosition.y - 10, 10),
          pointerEvents: "none",
        }}
      >
        <div className="font-bold text-lg mb-3 text-slate-900 dark:text-white">
          {day} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>

        {holiday && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
              <span className="text-lg">🎉</span> {holiday.name}
            </div>
            <div className="text-xs text-red-600 dark:text-red-500 mt-1 capitalize">
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
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              กิจกรรม ({dayEvents.length} รายการ)
            </div>
            {dayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-xl text-sm border-l-4 cursor-pointer hover:scale-105 transition-transform ${
                  event.type === "borrowed"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600"
                    : event.type === "requested"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600"
                    : event.type === "maintenance"
                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600"
                    : "bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-600"
                }`}
                onClick={() => onEventClick?.(event)}
              >
                <div className="font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="text-base">
                    {event.type === "borrowed"
                      ? "✅"
                      : event.type === "requested"
                      ? "📝"
                      : event.type === "maintenance"
                      ? "🔧"
                      : "📅"}
                  </span>
                  {event.type === "borrowed"
                    ? "การยืม"
                    : event.type === "requested"
                    ? "คำขอ"
                    : event.type === "maintenance"
                    ? "บำรุงรักษา"
                    : "จอง"}
                  {event.priority && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.priority === "high"
                          ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                          : event.priority === "medium"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                          : "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
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
                <div className="text-slate-700 dark:text-slate-300 mt-1">
                  <div>
                    <strong>อุปกรณ์:</strong> {event.equipmentName}
                  </div>
                  <div>
                    <strong>ผู้ยืม:</strong> {event.borrowerName}
                  </div>
                  {event.startTime && event.endTime && (
                    <div>
                      <strong>เวลา:</strong> {event.startTime} - {event.endTime}
                    </div>
                  )}
                  {event.details && (
                    <div>
                      <strong>รายละเอียด:</strong> {event.details}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header with Navigation */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white p-6 rounded-t-3xl">
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
                  {currentApiProvider && (
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
                      ⚠️ Offline
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

              <div className="flex rounded-xl bg-white/20 p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                    viewMode === "month"
                      ? "bg-white text-blue-600"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  เดือน
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${
                    viewMode === "week"
                      ? "bg-white text-blue-600"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  สัปดาห์
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Legend */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded-lg"></div>
              <span className="text-slate-700 dark:text-slate-300">การยืม</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded-lg"></div>
              <span className="text-slate-700 dark:text-slate-300">คำขอ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 border-2 border-orange-400 rounded-lg"></div>
              <span className="text-slate-700 dark:text-slate-300">
                บำรุงรักษา
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 border-2 border-purple-400 rounded-lg"></div>
              <span className="text-slate-700 dark:text-slate-300">จอง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-lg"></div>
              <span className="text-slate-700 dark:text-slate-300">
                วันหยุด
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map((dayName, index) => (
              <div
                key={index}
                className="p-4 text-center font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                <div className="hidden md:block">{dayNamesLong[index]}</div>
                <div className="md:hidden">{dayName}</div>
              </div>
            ))}

            {/* Calendar days */}
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
                      <div className="text-lg font-semibold mb-1">{day}</div>

                      {/* Holiday indicator */}
                      {getHolidayForDay(day) && (
                        <div className="absolute top-1 right-1 text-red-500 text-xs">
                          🎉
                        </div>
                      )}

                      {/* Today indicator */}
                      {isToday(day) && highlightToday && (
                        <div className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}

                      {/* Event indicators */}
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
                                      : "bg-purple-500"
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

                      {/* Week number */}
                      {showWeekNumbers && index % 7 === 0 && (
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400">
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

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredDay && renderTooltip(hoveredDay)}
        </AnimatePresence>
      </div>

      {/* Statistics Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            title: "รายการยืม",
            value: events.filter((e) => e.type === "borrowed").length,
            color: "green",
            icon: "✅",
          },
          {
            title: "คำขอรออนุมัติ",
            value: events.filter((e) => e.type === "requested").length,
            color: "red",
            icon: "📝",
          },
          {
            title: "บำรุงรักษา",
            value: events.filter((e) => e.type === "maintenance").length,
            color: "orange",
            icon: "🔧",
          },
          {
            title: "จองล่วงหน้า",
            value: events.filter((e) => e.type === "reserved").length,
            color: "purple",
            icon: "📅",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.title}
                </div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Enhanced example with more features
const App: React.FC = () => {
  const sampleEvents: BookingEvent[] = [
    {
      id: "1",
      date: "2024-12-15",
      type: "borrowed",
      equipmentName: "โปรเจคเตอร์ EPSON",
      borrowerName: "นายสมชาย ใจดี",
      details: "ใช้สำหรับประชุมใหญ่",
      startTime: "09:00",
      endTime: "17:00",
      priority: "high",
    },
    {
      id: "2",
      date: "2024-12-20",
      type: "requested",
      equipmentName: "ไมโครโฟน Wireless",
      borrowerName: "นางสาวมาลี สวยงาม",
      details: "งานสัมมนา",
      startTime: "13:00",
      endTime: "16:00",
      priority: "medium",
    },
    {
      id: "3",
      date: "2024-12-25",
      type: "maintenance",
      equipmentName: "กล้องถ่ายรูป Canon",
      borrowerName: "ช่างเทคนิค",
      details: "ตรวจสอบและทำความสะอาดเลนส์",
    },
    {
      id: "4",
      date: "2024-12-25",
      type: "reserved",
      equipmentName: "ลำโพง JBL",
      borrowerName: "นางสุดา เพียงพอ",
      details: "งานเลี้ยงสังสรรค์",
      priority: "low",
    },
    {
      id: "5",
      date: "2024-12-31",
      type: "maintenance",
      equipmentName: "โปรเจคเตอร์ Panasonic",
      borrowerName: "ทีมบำรุงรักษา",
      details: "เปลี่ยนหลอดไฟและทำความสะอาด",
      startTime: "08:00",
      endTime: "12:00",
    },
  ];

  const handleDateClick = (date: string) => {
    console.log("Date clicked:", date);
    // Handle date selection
  };

  const handleEventClick = (event: BookingEvent) => {
    console.log("Event clicked:", event);
    // Handle event selection - could open modal, navigate to details, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-full px-4">
        <AdvancedCalendarTable
          events={sampleEvents}
          currentMonth={11} // December (0-based)
          currentYear={2024}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          showWeekNumbers={true}
          highlightToday={true}
        />
      </div>
    </div>
  );
};

export default App;
