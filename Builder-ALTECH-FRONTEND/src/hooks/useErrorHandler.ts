import { useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ErrorConfig, ERROR_MESSAGES } from "@/types/error";

export const useErrorHandler = () => {
  const { showError, showModalError, showToastError } = useError();

  // Generic error handler with smart defaults
  const handleError = useCallback(
    (error: Error | string, options?: Partial<ErrorConfig>) => {
      const errorMessage = typeof error === "string" ? error : error.message;

      // Determine display type based on error severity or user preference
      const displayType = options?.type || "toast";

      const config: Partial<ErrorConfig> = {
        title: "Oops! Something went wrong.",
        message:
          errorMessage || "An unexpected error occurred. Please try again.",
        ...options,
      };

      if (displayType === "modal") {
        showModalError(config);
      } else {
        showToastError(config);
      }
    },
    [showError, showModalError, showToastError],
  );

  // Specific error handlers for common operations
  const handleUploadError = useCallback(
    (error?: Error | string, onRetry?: () => void) => {
      handleError(error || ERROR_MESSAGES.UPLOAD_FAILED, {
        onAction: onRetry,
        type: "toast",
      });
    },
    [handleError],
  );

  const handleDownloadError = useCallback(
    (error?: Error | string, onRetry?: () => void) => {
      handleError(error || ERROR_MESSAGES.DOWNLOAD_FAILED, {
        onAction: onRetry,
        type: "toast",
      });
    },
    [handleError],
  );

  const handleProcessingError = useCallback(
    (operation: string, error?: Error | string, onRetry?: () => void) => {
      const message = error
        ? typeof error === "string"
          ? error
          : error.message
        : `Failed to ${operation.toLowerCase()}. Please try again.`;

      handleError(message, {
        onAction: onRetry,
        type: "toast",
      });
    },
    [handleError],
  );

  const handleNetworkError = useCallback(
    (onRetry?: () => void) => {
      handleError(ERROR_MESSAGES.NETWORK_ERROR, {
        onAction: onRetry,
        type: "modal", // Network errors are usually more critical
      });
    },
    [handleError],
  );

  const handleFileSizeError = useCallback(
    (maxSize?: string) => {
      const message = maxSize
        ? `File size exceeds the maximum allowed limit (${maxSize}).`
        : ERROR_MESSAGES.FILE_TOO_LARGE;

      handleError(message, {
        type: "toast",
        variant: "warning",
      });
    },
    [handleError],
  );

  const handleServerTimeoutError = useCallback(
    (onRetry?: () => void) => {
      handleError(ERROR_MESSAGES.SERVER_TIMEOUT, {
        onAction: onRetry,
        type: "modal",
      });
    },
    [handleError],
  );

  // Critical error handler for blocking operations
  const handleCriticalError = useCallback(
    (error: Error | string, options?: Partial<ErrorConfig>) => {
      handleError(error, {
        ...options,
        type: "modal",
        duration: 0, // Don't auto-dismiss critical errors
      });
    },
    [handleError],
  );

  return {
    handleError,
    handleUploadError,
    handleDownloadError,
    handleProcessingError,
    handleNetworkError,
    handleFileSizeError,
    handleServerTimeoutError,
    handleCriticalError,
  };
};
