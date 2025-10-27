/**
 * Application-wide constants
 * Use these instead of hardcoded values throughout the app
 */

export const APP_CONSTANTS = {
  // Pagination
  PAGINATION: {
    ITEMS_PER_PAGE: 9,
    EQUIPMENT_PER_PAGE: 12,
    HISTORY_PER_PAGE: 10,
  },

  // Touch gestures
  GESTURES: {
    MIN_SWIPE_DISTANCE: 50,
  },

  // Timeouts and delays
  TIMEOUTS: {
    ALERT_DELAY: 500,
    DEBOUNCE_SEARCH: 300,
    AUTO_SAVE: 1000,
  },

  // Placeholder images
  PLACEHOLDERS: {
    IMAGE_URL: "/images/placeholder-equipment.png",
    FALLBACK_URL: "https://via.placeholder.com/400x300?text=No+Image",
  },

  // Touch targets (accessibility)
  TOUCH_TARGET: {
    MIN_HEIGHT: 44, // pixels
    MIN_WIDTH: 44, // pixels
  },

  // API endpoints
  API: {
    EQUIPMENT: "/api/equipment",
    BORROW: "/api/borrow",
    USER: "/api/user",
    STATISTICS: "/api/statistics",
    ACTIVITY: "/api/activity",
  },

  // Equipment categories
  CATEGORIES: [
    "all",
    "อิเล็กทรอนิกส์",
    "เครื่องเสียง",
    "เครื่องจักร",
    "เครื่องมือช่าง",
    "อุปกรณ์กีฬา",
    "อื่นๆ",
  ] as const,

  // Borrow status
  STATUS: {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    ACTIVE: "ACTIVE",
    RETURNED: "RETURNED",
    REJECTED: "REJECTED",
    OVERDUE: "OVERDUE",
    PENDING_RETURN: "PENDING_RETURN",
  } as const,

  // User roles
  ROLES: {
    ADMIN: "admin",
    USER: "user",
  } as const,

  // Local storage keys
  STORAGE_KEYS: {
    CART: "equipmentCart",
    THEME: "app-theme",
    LANGUAGE: "app-language",
  } as const,

  // Animation delays
  ANIMATION: {
    STAGGER_DELAY: 0.05,
    TRANSITION_DURATION: 0.2,
  },

  // Date formats
  DATE_FORMATS: {
    LONG: { year: "numeric", month: "long", day: "numeric" } as const,
    SHORT: { day: "numeric", month: "short", year: "numeric" } as const,
    TIME: { hour: "2-digit", minute: "2-digit" } as const,
  },

  // Validation
  VALIDATION: {
    MIN_BORROW_DAYS: 1,
    MAX_BORROW_DAYS: 30,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 10,
    MIN_PURPOSE_LENGTH: 10,
    MAX_PURPOSE_LENGTH: 500,
  },
} as const;

// Export types
export type AppStatus = (typeof APP_CONSTANTS.STATUS)[keyof typeof APP_CONSTANTS.STATUS];
export type AppRole = (typeof APP_CONSTANTS.ROLES)[keyof typeof APP_CONSTANTS.ROLES];
export type AppCategory = (typeof APP_CONSTANTS.CATEGORIES)[number];

export default APP_CONSTANTS;
