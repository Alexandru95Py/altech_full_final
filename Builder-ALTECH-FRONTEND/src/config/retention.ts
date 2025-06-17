// Centralized file retention policy configuration
export const RETENTION_CONFIG = {
  // File retention periods (in hours)
  FILE_RETENTION_HOURS: 72, // Files deleted after 72 hours
  EXPIRATION_WARNING_HOURS: 24, // Warning shown when 24 hours remain

  // Display constants
  RETENTION_DISPLAY: "72 hours",
  WARNING_DISPLAY: "24 hours",

  // Millisecond calculations
  FILE_RETENTION_MS: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
  WARNING_THRESHOLD_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  // Check intervals
  CLEANUP_CHECK_INTERVAL_MS: 60 * 60 * 1000, // Check every hour
  WARNING_CHECK_INTERVAL_MS: 60 * 60 * 1000, // Check warnings every hour
} as const;

// Utility functions for file retention
export const RetentionUtils = {
  // Calculate when a file will expire
  getExpirationTime: (createdAt: Date): Date => {
    return new Date(createdAt.getTime() + RETENTION_CONFIG.FILE_RETENTION_MS);
  },

  // Calculate time remaining until expiration
  getTimeRemaining: (createdAt: Date): number => {
    const expirationTime = RetentionUtils.getExpirationTime(createdAt);
    return Math.max(0, expirationTime.getTime() - Date.now());
  },

  // Check if file should show expiration warning
  shouldShowWarning: (createdAt: Date): boolean => {
    const timeRemaining = RetentionUtils.getTimeRemaining(createdAt);
    return (
      timeRemaining <= RETENTION_CONFIG.WARNING_THRESHOLD_MS &&
      timeRemaining > 0
    );
  },

  // Check if file is expired
  isExpired: (createdAt: Date): boolean => {
    return RetentionUtils.getTimeRemaining(createdAt) <= 0;
  },

  // Format time remaining for display
  formatTimeRemaining: (createdAt: Date): string => {
    const timeRemaining = RetentionUtils.getTimeRemaining(createdAt);
    const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));

    if (hoursRemaining <= 0) return "Expired";
    if (hoursRemaining === 1) return "1 hour";
    if (hoursRemaining < 24) return `${hoursRemaining} hours`;

    const daysRemaining = Math.ceil(hoursRemaining / 24);
    if (daysRemaining === 1) return "1 day";
    return `${daysRemaining} days`;
  },

  // Get retention policy description for UI
  getRetentionDescription: (): string => {
    return `Files are automatically deleted after ${RETENTION_CONFIG.RETENTION_DISPLAY} for your security and privacy.`;
  },

  // Get warning message
  getWarningMessage: (fileName?: string): string => {
    const fileRef = fileName ? `"${fileName}"` : "This file";
    return `⚠️ ${fileRef} will be deleted in ${RETENTION_CONFIG.WARNING_DISPLAY}. Please download or manage it before it expires.`;
  },
};

export type RetentionStatus = "normal" | "warning" | "expired";
