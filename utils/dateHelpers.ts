/**
 * Date formatting utilities for Thai locale
 */

export const dateHelpers = {
  /**
   * Format date to Thai long format
   * @example "28 ตุลาคม 2567"
   */
  formatDateLong: (dateString: string | Date): string => {
    if (!dateString) return "-";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  /**
   * Format date to Thai short format
   * @example "28 ต.ค. 67"
   */
  formatDateShort: (dateString: string | Date): string => {
    if (!dateString) return "-";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  },

  /**
   * Format time to Thai format
   * @example "14:30"
   */
  formatTime: (dateString: string | Date): string => {
    if (!dateString) return "-";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Format date and time together
   * @returns { date: string, time: string }
   */
  formatTimestamp: (timestamp?: string) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  },

  /**
   * Format date and time in one string
   * @example "28 ตุลาคม 2567 เวลา 14:30 น."
   */
  formatDateTime: (dateString: string | Date): string => {
    if (!dateString) return "-";
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    const dateStr = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} เวลา ${timeStr} น.`;
  },

  /**
   * Check if date is overdue
   */
  isOverdue: (endDate: string | Date): boolean => {
    const date = typeof endDate === "string" ? new Date(endDate) : endDate;
    return date < new Date();
  },

  /**
   * Calculate days remaining
   */
  daysRemaining: (endDate: string | Date): number => {
    const date = typeof endDate === "string" ? new Date(endDate) : endDate;
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  },
};

export default dateHelpers;
