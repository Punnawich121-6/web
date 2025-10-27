import { useState, useEffect, useCallback } from "react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  status: "AVAILABLE" | "BORROWED" | "MAINTENANCE" | "RETIRED";
  totalQuantity: number;
  availableQuantity: number;
  specifications?: any;
  location: string;
  serialNumber: string;
  condition?: string;
  creator?: {
    displayName?: string;
    email: string;
  };
  borrowings?: any[];
}

/**
 * Custom hook for fetching equipment data
 * Replaces duplicate fetch logic in 6+ files
 */
export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/equipment");
      const result = await response.json();

      if (result.success) {
        setEquipment(result.data || []);
      } else {
        setError(result.error || "Failed to fetch equipment");
      }
    } catch (err) {
      setError("Failed to fetch equipment");
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching equipment:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment,
  };
}

export default useEquipment;
