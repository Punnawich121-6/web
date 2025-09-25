"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Navbar Component ---
const LibraryNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-md border-b border-gray-200"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <a href="/" className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-2xl">T2U</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-gray-800 uppercase tracking-wide">
                  Time2Use
                </span>
              </div>
            </a>
  
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12">
              <a
                href="/table"
                className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                Schedule
              </a>
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                HOME
              </a>
              <a
                href="/contact"
                className="text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
              >
                Contact
              </a>
              <a href="/auth">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
              </a>
            </div>
  
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
  
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-5"
            >
              <div className="space-y-5">
                <a
                  href="#"
                  className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
                >
                  YOUR LOCATION
                </a>
                <a
                  href="/"
                  className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
                >
                  HOME
                </a>
                <a
                  href="/table"
                  className="block p-4 text-gray-600 hover:text-gray-900 font-medium uppercase tracking-wide text-xl"
                >
                  BOOK
                </a>
                <a href="/auth">
                  <button className="w-full p-5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-xl">
                    เข้าสู่ระบบ
                  </button>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    );
  };


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
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(
    new Date(currentYear, currentMonth, 1)
  );
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [holidayError, setHolidayError] = useState<string | null>(null);
  const [currentApiProvider, setCurrentApiProvider] = useState<string>("");

  const monthNames = [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม", ];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const dayNamesLong = [ "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", ];

  const fetchFromHolidayAPI = async (year: number): Promise<Holiday[]> => {
    const response = await fetch( `https://holidayapi.com/v1/holidays?pretty&key=${holidayApiKey}&country=TH&year=${year}` );
    if (!response.ok) throw new Error(`HolidayAPI error: ${response.status}`);
    const data = await response.json();
    let formattedHolidays: Holiday[] = [];
    if (data.holidays) {
      if (Array.isArray(data.holidays)) {
        formattedHolidays = data.holidays.map((holiday: any) => ({ date: holiday.date, name: holiday.name, type: holiday.public ? "national" : "special" }));
      } else if (typeof data.holidays === "object") {
        formattedHolidays = Object.entries(data.holidays).flatMap( ([date, holidayData]: [string, any]) => {
            if (Array.isArray(holidayData)) {
              return holidayData.map((holiday: any) => ({ date, name: holiday.name, type: holiday.public ? "national" : "special" }));
            } else if (holidayData && typeof holidayData === "object") {
              return [ { date, name: holidayData.name, type: holidayData.public ? "national" : "special" } ];
            } return [];
          }
        );
      }
    } return formattedHolidays;
  };

  const fetchFromCalendarific = async (year: number): Promise<Holiday[]> => {
    const response = await fetch( `https://calendarific.com/api/v2/holidays?api_key=${calendarificApiKey}&country=TH&year=${year}` );
    if (!response.ok) throw new Error(`Calendarific error: ${response.status}`);
    const data = await response.json();
    if (data.response && data.response.holidays) {
      return data.response.holidays.map((holiday: any) => ({ date: holiday.date.iso, name: holiday.name, type: holiday.primary_type === "National holiday" ? "national" : "special" }));
    } return [];
  };

  const fetchHolidays = async (year: number) => {
    setLoadingHolidays(true); setHolidayError(null); setCurrentApiProvider("");
    const apis = [];
    if (preferredApiProvider === "holidayapi" && holidayApiKey) apis.push({ name: "HolidayAPI", fetch: () => fetchFromHolidayAPI(year) });
    if (preferredApiProvider === "calendarific" && calendarificApiKey) apis.push({ name: "Calendarific", fetch: () => fetchFromCalendarific(year) });
    if (preferredApiProvider === "auto" || apis.length === 0) {
      if (holidayApiKey) apis.push({ name: "HolidayAPI", fetch: () => fetchFromHolidayAPI(year) });
      if (calendarificApiKey) apis.push({ name: "Calendarific", fetch: () => fetchFromCalendarific(year) });
    }
    for (const api of apis) {
      try {
        const holidays = await api.fetch();
        if (holidays.length > 0) {
          setHolidays(holidays); setCurrentApiProvider(api.name); setLoadingHolidays(false); return;
        }
      } catch (error) { console.warn(`${api.name} failed:`, error); }
    }
    console.warn("All holiday APIs failed, using fallback data"); setHolidayError("Using offline holiday data"); setHolidays(getDefaultThaiHolidays(year)); setCurrentApiProvider("Offline"); setLoadingHolidays(false);
  };

  const getDefaultThaiHolidays = (year: number): Holiday[] => {
    return [ { date: `${year}-01-01`, name: "วันขึ้นปีใหม่", type: "national" }, { date: `${year}-04-06`, name: "วันจักรี", type: "national" }, { date: `${year}-04-13`, name: "วันสงกรานต์", type: "national" }, { date: `${year}-04-14`, name: "วันสงกรานต์", type: "national" }, { date: `${year}-04-15`, name: "วันสงกรานต์", type: "national" }, { date: `${year}-05-01`, name: "วันแรงงานแห่งชาติ", type: "national" }, { date: `${year}-05-04`, name: "วันฉัตรมงคล", type: "national" }, { date: `${year}-07-28`, name: "วันเฉลิมพระชนมพรรษา ร.10", type: "national" }, { date: `${year}-08-12`, name: "วันแม่แห่งชาติ", type: "national" }, { date: `${year}-10-13`, name: "วันคล้ายวันสวรรคต ร.9", type: "national" }, { date: `${year}-10-23`, name: "วันปิยมหาราช", type: "national" }, { date: `${year}-12-05`, name: "วันพ่อแห่งชาติ", type: "national" }, { date: `${year}-12-10`, name: "วันรัฐธรรมนูญ", type: "national" }, { date: `${year}-12-31`, name: "วันสิ้นปี", type: "national" } ] as Holiday[];
  };

  useEffect(() => { fetchHolidays(currentDate.getFullYear()); }, [ currentDate.getFullYear(), holidayApiKey, calendarificApiKey, preferredApiProvider ]);

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String( today.getMonth() + 1 ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(direction === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startingDayOfWeek = firstDay.getDay();
  const calendarDays = [ ...Array(startingDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1) ];
  const getEventsForDay = (day: number) => events.filter(event => event.date === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  const getHolidayForDay = (day: number) => holidays.find(holiday => holiday.date === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`) || null;
  const isWeekend = (day: number) => { const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day); return d.getDay() === 0 || d.getDay() === 6; };
  const isToday = (day: number) => `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` === todayString;
  const getWeekNumber = (day: number) => { const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day); const firstDayOfYear = new Date(date.getFullYear(), 0, 1); const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000; return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7); };

  const getDayStyle = (day: number | null): string => {
    if (!day) return "text-slate-300";
    let baseStyle = "relative h-20 p-2 text-center cursor-pointer transition-all duration-300 rounded-xl";
    if (isToday(day) && highlightToday) { baseStyle += " ring-2 ring-red-500 bg-red-50"; }
    else if (getHolidayForDay(day)) { baseStyle += " bg-red-50 text-red-700 border-2 border-red-200"; }
    else if (isWeekend(day)) { baseStyle += " bg-slate-50 text-slate-600"; }
    else {
      const dayEvents = getEventsForDay(day);
      const hasMaintenance = dayEvents.some(e => e.type === "maintenance");
      const hasRequests = dayEvents.some(e => e.type === "requested");
      const hasBorrowed = dayEvents.some(e => e.type === "borrowed");
      const hasReserved = dayEvents.some(e => e.type === "reserved");
      if (hasMaintenance) { baseStyle += " bg-orange-100 border-2 border-orange-400 text-orange-800"; }
      else if (hasRequests && hasBorrowed) { baseStyle += " bg-yellow-100 border-2 border-yellow-400 text-yellow-800"; }
      else if (hasRequests) { baseStyle += " bg-red-100 border-2 border-red-400 text-red-800"; }
      else if (hasBorrowed) { baseStyle += " bg-green-100 border-2 border-green-400 text-green-800"; }
      else if (hasReserved) { baseStyle += " bg-rose-100 border-2 border-rose-400 text-rose-800"; }
      else { baseStyle += " hover:bg-slate-100 border border-slate-200 hover:border-red-300"; }
    } return baseStyle;
  };

  const handleMouseMove = (e: React.MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
  const handleDateClick = (day: number) => { const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; setSelectedDate(dateString); onDateClick?.(dateString); };

  const renderTooltip = (day: number) => {
    const dayEvents = getEventsForDay(day); const holiday = getHolidayForDay(day);
    if (dayEvents.length === 0 && !holiday) return null;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 max-w-sm" style={{ left: Math.min(mousePosition.x + 15, window.innerWidth - 300), top: Math.max(mousePosition.y - 10, 10), pointerEvents: "none" }} >
        <div className="font-bold text-lg mb-3 text-slate-900"> {day} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} </div>
        {holiday && (
          <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-200">
            <div className="font-medium text-red-700 flex items-center gap-2"> {holiday.name} </div>
            <div className="text-xs text-red-600 mt-1 capitalize"> {holiday.type === "national" ? "วันหยุดราชการ" : holiday.type === "religious" ? "วันสำคัญทางพุทธศาสนา" : "วันพิเศษ"} </div>
          </div>
        )}
        {dayEvents.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600 mb-2"> กิจกรรม ({dayEvents.length} รายการ) </div>
            {dayEvents.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`p-3 rounded-xl text-sm border-l-4 cursor-pointer hover:scale-105 transition-transform ${ event.type === "borrowed" ? "bg-green-50 border-green-400" : event.type === "requested" ? "bg-red-50 border-red-400" : event.type === "maintenance" ? "bg-orange-50 border-orange-400" : "bg-rose-50 border-rose-400" }`} onClick={() => onEventClick?.(event)} >
                <div className="font-medium flex items-center gap-2 text-slate-900">
                  <span> {event.type === "borrowed" ? "การยืม" : event.type === "requested" ? "คำขอ" : event.type === "maintenance" ? "บำรุงรักษา" : "จอง"} </span>
                  {event.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs ${ event.priority === "high" ? "bg-red-200 text-red-800" : event.priority === "medium" ? "bg-yellow-200 text-yellow-800" : "bg-green-200 text-green-800" }`}>
                      {event.priority === "high" ? "สำคัญ" : event.priority === "medium" ? "ปานกลาง" : "ต่ำ"}
                    </span>
                  )}
                </div>
                <div className="text-slate-700 mt-1">
                  <div> <strong>อุปกรณ์:</strong> {event.equipmentName} </div>
                  <div> <strong>ผู้ยืม:</strong> {event.borrowerName} </div>
                  {event.startTime && event.endTime && ( <div> <strong>เวลา:</strong> {event.startTime} - {event.endTime} </div> )}
                  {event.details && ( <div> <strong>รายละเอียด:</strong> {event.details} </div> )}
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
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateMonth("prev")} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /> </svg> </button>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold"> {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()} </h2>
                <div className="flex items-center gap-2">
                  {loadingHolidays && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                  {currentApiProvider && <div className="text-xs bg-white/20 px-2 py-1 rounded-full" title={`Holiday data from ${currentApiProvider}`}> {currentApiProvider} </div>}
                  {holidayError && <div className="text-red-200 text-xs bg-red-500/20 px-2 py-1 rounded-full" title={holidayError}> Offline </div>}
                </div>
              </div>
              <button onClick={() => navigateMonth("next")} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /> </svg> </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={goToToday} className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all font-medium"> วันนี้ </button>
              <div className="flex rounded-xl bg-white/20 p-1">
                <button onClick={() => setViewMode("month")} className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${ viewMode === "month" ? "bg-white text-red-600" : "text-white/80 hover:text-white" }`}> เดือน </button>
                <button onClick={() => setViewMode("week")} className={`px-3 py-1 rounded-lg transition-all text-sm font-medium ${ viewMode === "week" ? "bg-white text-red-600" : "text-white/80 hover:text-white" }`}> สัปดาห์ </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center gap-2"> <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded-lg"></div> <span className="text-slate-700">การยืม</span> </div>
            <div className="flex items-center gap-2"> <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded-lg"></div> <span className="text-slate-700">คำขอ</span> </div>
            <div className="flex items-center gap-2"> <div className="w-4 h-4 bg-orange-200 border-2 border-orange-400 rounded-lg"></div> <span className="text-slate-700"> บำรุงรักษา </span> </div>
            <div className="flex items-center gap-2"> <div className="w-4 h-4 bg-rose-200 border-2 border-rose-400 rounded-lg"></div> <span className="text-slate-700">จอง</span> </div>
            <div className="flex items-center gap-2"> <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-lg"></div> <span className="text-slate-700"> วันหยุด </span> </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((dayName, index) => ( <div key={index} className="p-4 text-center font-bold bg-slate-100 text-slate-700 rounded-xl"> <div className="hidden md:block">{dayNamesLong[index]}</div> <div className="md:hidden">{dayName}</div> </div> ))}
            <AnimatePresence>
              {calendarDays.map((day, index) => (
                <motion.div key={`${currentDate.getMonth()}-${day || index}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: index * 0.01 }} className={getDayStyle(day)} onMouseEnter={() => day && setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)} onMouseMove={handleMouseMove} onClick={() => day && handleDateClick(day)} >
                  {day && (
                    <>
                      <div className="text-lg font-semibold mb-1">{day}</div>
                      {isToday(day) && highlightToday && <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                      {getEventsForDay(day).length > 0 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-1 flex-wrap justify-center max-w-full">
                            {getEventsForDay(day).slice(0, 3).map((event, eventIndex) => ( <div key={eventIndex} className={`w-2 h-2 rounded-full ${ event.type === "borrowed" ? "bg-green-500" : event.type === "requested" ? "bg-red-500" : event.type === "maintenance" ? "bg-orange-500" : "bg-rose-500" }`} /> ))}
                            {getEventsForDay(day).length > 3 && <div className="w-2 h-2 rounded-full bg-slate-400 text-xs flex items-center justify-center"> + </div>}
                          </div>
                        </div>
                      )}
                      {showWeekNumbers && index % 7 === 0 && <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-slate-500"> W{getWeekNumber(day)} </div>}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence> {hoveredDay && renderTooltip(hoveredDay)} </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4" >
        {[ { title: "รายการยืม", value: events.filter((e) => e.type === "borrowed").length }, { title: "คำขอรออนุมัติ", value: events.filter((e) => e.type === "requested").length }, { title: "บำรุงรักษา", value: events.filter((e) => e.type === "maintenance").length }, { title: "จองล่วงหน้า", value: events.filter((e) => e.type === "reserved").length }, ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow" >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-slate-900"> {stat.value} </div>
                <div className="text-sm text-slate-600"> {stat.title} </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
    const sampleEvents: BookingEvent[] = [
        { id: "1", date: "2024-12-15", type: "borrowed", equipmentName: "โปรเจคเตอร์ EPSON", borrowerName: "นายสมชาย ใจดี", details: "ใช้สำหรับประชุมใหญ่", startTime: "09:00", endTime: "17:00", priority: "high" },
        { id: "2", date: "2024-12-20", type: "requested", equipmentName: "ไมโครโฟน Wireless", borrowerName: "นางสาวมาลี สวยงาม", details: "งานสัมมนา", startTime: "13:00", endTime: "16:00", priority: "medium" },
        { id: "3", date: "2024-12-25", type: "maintenance", equipmentName: "กล้องถ่ายรูป Canon", borrowerName: "ช่างเทคนิค", details: "ตรวจสอบและทำความสะอาดเลนส์" },
        { id: "4", date: "2024-12-25", type: "reserved", equipmentName: "ลำโพง JBL", borrowerName: "นางสุดา เพียงพอ", details: "งานเลี้ยงสังสรรค์", priority: "low" },
        { id: "5", date: "2024-12-31", type: "maintenance", equipmentName: "โปรเจคเตอร์ Panasonic", borrowerName: "ทีมบำรุงรักษา", details: "เปลี่ยนหลอดไฟและทำความสะอาด", startTime: "08:00", endTime: "12:00" },
    ];
    
    const handleDateClick = (date: string) => { console.log("Date clicked:", date); };
    const handleEventClick = (event: BookingEvent) => { console.log("Event clicked:", event); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
        <LibraryNavbar />
        <div className="max-w-full px-4 pt-32"> {/* Added padding-top for navbar */}
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