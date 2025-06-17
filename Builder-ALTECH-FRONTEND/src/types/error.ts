export interface ErrorConfig {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // Duration in milliseconds for auto-dismiss
  type?: "modal" | "toast";
  variant?: "error" | "warning" | "info";
}

export interface ErrorState {
  isVisible: boolean;
  config: ErrorConfig | null;
}

export type ErrorDisplayType = "modal" | "toast";

export const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  title: "Oops! Something went wrong.",
  message: "An unexpected error occurred. Please try again.",
  actionLabel: "🔁 Try Again",
  duration: 4000, // 4 seconds
  type: "toast",
  variant: "error",
};

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "File size exceeds the maximum allowed limit.",
  UPLOAD_FAILED:
    "Failed to upload file. Please check your connection and try again.",
  DOWNLOAD_FAILED: "Failed to download file. Please try again.",
  PROCESSING_FAILED: "Failed to process document. Please try again.",
  SERVER_TIMEOUT: "Server is taking too long to respond. Please try again.",
  NETWORK_ERROR:
    "Network connection error. Please check your internet connection.",
  SPLIT_FAILED: "Failed to split PDF. Please try again.",
  MERGE_FAILED: "Failed to merge PDFs. Please try again.",
  SIGN_FAILED: "Failed to sign document. Please try again.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
} as const;
