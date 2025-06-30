// Centralized storage configuration
export const STORAGE_CONFIG = {
  // User storage limits
  MAX_STORAGE_GB: 50, // Total storage per user in GB
  MAX_STORAGE_BYTES: 50 * 1024 * 1024 * 1024, // 50 GB in bytes

  // File size limits
  MAX_FILE_SIZE_MB: 100, // Maximum single file size in MB
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB in bytes

  // Batch upload limits
  MAX_BATCH_FILES: 10,
  MAX_BATCH_SIZE_MB: 100,
  MAX_BATCH_SIZE_BYTES: 100 * 1024 * 1024,

  // Display constants
  STORAGE_WARNING_THRESHOLD: 0.9, // Show warning at 90%
  STORAGE_CRITICAL_THRESHOLD: 0.95, // Show critical warning at 95%
} as const;

// Utility functions for storage management
export const StorageUtils = {
  // Convert bytes to human-readable format
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  },

  // Convert bytes to GB with decimal places
  bytesToGB: (bytes: number): number => {
    return parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
  },

  // Convert GB to bytes
  gbToBytes: (gb: number): number => {
    return gb * 1024 * 1024 * 1024;
  },

  // Calculate storage percentage used
  getStoragePercentage: (usedBytes: number): number => {
    return Math.round((usedBytes / STORAGE_CONFIG.MAX_STORAGE_BYTES) * 100);
  },

  // Check if upload would exceed storage limit
  canUpload: (currentUsageBytes: number, newFileBytes: number): boolean => {
    return currentUsageBytes + newFileBytes <= STORAGE_CONFIG.MAX_STORAGE_BYTES;
  },

  // Get remaining storage in bytes
  getRemainingStorage: (usedBytes: number): number => {
    return Math.max(0, STORAGE_CONFIG.MAX_STORAGE_BYTES - usedBytes);
  },

  // Get storage status (normal, warning, critical, full)
  getStorageStatus: (
    usedBytes: number,
  ): "normal" | "warning" | "critical" | "full" => {
    const percentage = usedBytes / STORAGE_CONFIG.MAX_STORAGE_BYTES;

    if (percentage >= 1) return "full";
    if (percentage >= STORAGE_CONFIG.STORAGE_CRITICAL_THRESHOLD)
      return "critical";
    if (percentage >= STORAGE_CONFIG.STORAGE_WARNING_THRESHOLD)
      return "warning";
    return "normal";
  },

  // Format storage display text
  formatStorageDisplay: (usedBytes: number): string => {
    const usedGB = StorageUtils.bytesToGB(usedBytes);
    const maxGB = STORAGE_CONFIG.MAX_STORAGE_GB;
    return `${usedGB} GB of ${maxGB} GB used`;
  },

  // Get plan description
  getPlanDescription: (): string => {
    return `Up to ${STORAGE_CONFIG.MAX_STORAGE_GB} GB secure document storage per user`;
  },
};

export type StorageStatus = "normal" | "warning" | "critical" | "full";
