import React, { useState, useEffect } from 'react';

interface BookingEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'borrowed' | 'requested';
  equipmentName: string;
  borrowerName: string;
  details?: string;
  startTime?: string;
  endTime?: string;
}

interface CalendarTableProps {
  events?: BookingEvent[];
  currentMonth?: number;
  currentYear?: number;
}

const CalendarTable: React.FC<CalendarTableProps> = ({ 
  events = [], 
  currentMonth = new Date().getMonth(),
  currentYear = new Date().getFullYear()
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
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
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateString);
  };

  // Get day style based on events
  const getDayStyle = (day: number | null): string => {
    if (!day) return 'text-gray-300';
    
    const dayEvents = getEventsForDay(day);
    const hasRequests = dayEvents.some(event => event.type === 'requested');
    const hasBorrowed = dayEvents.some(event => event.type === 'borrowed');
    
    if (hasRequests && hasBorrowed) {
      return 'bg-yellow-100 border-2 border-yellow-400 text-yellow-800 font-semibold';
    } else if (hasRequests) {
      return 'bg-red-100 border-2 border-red-400 text-red-800 font-semibold';
    } else if (hasBorrowed) {
      return 'bg-green-100 border-2 border-green-400 text-green-800 font-semibold';
    }
    
    return 'hover:bg-gray-50 border border-gray-200';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const renderTooltip = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length === 0) return null;

    return (
      <div 
        className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs"
        style={{ 
          left: mousePosition.x + 10, 
          top: mousePosition.y - 10,
          pointerEvents: 'none'
        }}
      >
        <div className="font-semibold mb-2">วันที่ {day} {monthNames[currentMonth]} {currentYear}</div>
        <div className="space-y-2">
          {dayEvents.map((event, index) => (
            <div 
              key={event.id} 
              className={`p-2 rounded text-sm ${
                event.type === 'borrowed' 
                  ? 'bg-green-50 border-l-4 border-green-400' 
                  : 'bg-red-50 border-l-4 border-red-400'
              }`}
            >
              <div className="font-medium">
                {event.type === 'borrowed' ? '🟢 การยืม' : '🔴 คำขอ'}
              </div>
              <div className="text-gray-700">
                <div><strong>อุปกรณ์:</strong> {event.equipmentName}</div>
                <div><strong>ผู้ยืม:</strong> {event.borrowerName}</div>
                {event.startTime && event.endTime && (
                  <div><strong>เวลา:</strong> {event.startTime} - {event.endTime}</div>
                )}
                {event.details && (
                  <div><strong>รายละเอียด:</strong> {event.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-center">
            ตารางการยืมอุปกรณ์ - {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-400 rounded"></div>
              <span>มีการยืมอุปกรณ์</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border-2 border-red-400 rounded"></div>
              <span>มีคำขอใช้อุปกรณ์</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
              <span>มีทั้งการยืมและคำขอ</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((dayName, index) => (
              <div key={index} className="p-3 text-center font-semibold bg-gray-100 text-gray-700">
                {dayName}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  relative h-16 p-2 text-center cursor-pointer transition-all duration-200
                  ${getDayStyle(day)}
                `}
                onMouseEnter={() => day && setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onMouseMove={handleMouseMove}
              >
                {day && (
                  <>
                    <div className="text-lg">{day}</div>
                    {getEventsForDay(day).length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="flex gap-1">
                          {getEventsForDay(day).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`w-2 h-2 rounded-full ${
                                event.type === 'borrowed' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && renderTooltip(hoveredDay)}
      </div>
    </div>
  );
};

// Example usage with sample data
const App: React.FC = () => {
  const sampleEvents: BookingEvent[] = [
    {
      id: '1',
      date: '2024-12-15',
      type: 'borrowed',
      equipmentName: 'โปรเจคเตอร์ EPSON',
      borrowerName: 'นายสมชาย ใจดี',
      details: 'ใช้สำหรับประชุมใหญ่',
      startTime: '09:00',
      endTime: '17:00'
    },
    {
      id: '2',
      date: '2024-12-20',
      type: 'requested',
      equipmentName: 'ไมโครโฟน Wireless',
      borrowerName: 'นางสาวมาลี สวยงาม',
      details: 'งานสัมมนา',
      startTime: '13:00',
      endTime: '16:00'
    },
    {
      id: '3',
      date: '2024-12-25',
      type: 'borrowed',
      equipmentName: 'กล้องถ่ายรูป Canon',
      borrowerName: 'นายอำนาจ มั่นใจ',
      details: 'ถ่ายภาพกิจกรรม'
    },
    {
      id: '4',
      date: '2024-12-25',
      type: 'requested',
      equipmentName: 'ลำโพง JBL',
      borrowerName: 'นางสุดา เพียงพอ',
      details: 'งานเลี้ยงสังสรรค์'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <CalendarTable 
        events={sampleEvents} 
        currentMonth={11} // December (0-based)
        currentYear={2024}
      />
    </div>
  );
};

export default App;