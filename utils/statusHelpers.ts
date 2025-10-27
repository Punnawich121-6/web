import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";

export type BorrowStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "RETURNED"
  | "REJECTED"
  | "OVERDUE"
  | "PENDING_RETURN";

export const statusHelpers = {
  /**
   * Get Thai text for status
   */
  getText: (status: string): string => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "รออนุมัติ";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "ACTIVE":
        return "กำลังยืม";
      case "RETURNED":
        return "คืนแล้ว";
      case "REJECTED":
        return "ปฏิเสธ";
      case "OVERDUE":
        return "เกินกำหนด";
      case "PENDING_RETURN":
        return "รอตรวจสอบการคืน";
      default:
        return status;
    }
  },

  /**
   * Get Tailwind CSS classes for status badge
   */
  getColor: (status: string): string => {
    switch (status.toUpperCase()) {
      case "APPROVED":
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "RETURNED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "OVERDUE":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "PENDING_RETURN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  },

  /**
   * Get icon component for status
   */
  getIcon: (status: string, size: number = 18) => {
    const iconProps = { size };

    switch (status.toUpperCase()) {
      case "APPROVED":
      case "ACTIVE":
      case "RETURNED":
        return CheckCircle;
      case "PENDING":
      case "PENDING_RETURN":
        return Clock;
      case "REJECTED":
        return XCircle;
      case "OVERDUE":
        return AlertCircle;
      default:
        return Package;
    }
  },
};

export default statusHelpers;
