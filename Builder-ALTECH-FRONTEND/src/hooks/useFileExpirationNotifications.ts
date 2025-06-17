import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { RETENTION_CONFIG, RetentionUtils } from "@/config/retention";

interface FileWithExpiration {
  id: string;
  name: string;
  dateCreated: string;
  size?: string;
}

interface ExpirationNotification {
  fileId: string;
  fileName: string;
  timeRemaining: string;
  status: "warning" | "critical" | "expired";
}

// Session storage keys for tracking notifications
const SESSION_KEYS = {
  SHOWN_EXPIRY_ALERT: "altech-shown-expiry-alert",
  LAST_EXPIRY_CHECK: "altech-last-expiry-check",
  NOTIFIED_FILE_IDS: "altech-notified-file-ids",
};

export const useFileExpirationNotifications = (files: FileWithExpiration[]) => {
  const [notifications, setNotifications] = useState<ExpirationNotification[]>(
    [],
  );
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const hasShownSessionAlert = useRef(false);

  // Check if we should show the one-time session alert
  const shouldShowSessionAlert = (
    criticalFiles: ExpirationNotification[],
  ): boolean => {
    if (criticalFiles.length === 0) return false;
    if (hasShownSessionAlert.current) return false;

    // Check if we already showed alert in this session
    const sessionAlertShown = sessionStorage.getItem(
      SESSION_KEYS.SHOWN_EXPIRY_ALERT,
    );
    if (sessionAlertShown === "true") {
      hasShownSessionAlert.current = true;
      return false;
    }

    // Check if any new files entered the critical window
    const notifiedFileIds = JSON.parse(
      sessionStorage.getItem(SESSION_KEYS.NOTIFIED_FILE_IDS) || "[]",
    );
    const newCriticalFiles = criticalFiles.filter(
      (file) => !notifiedFileIds.includes(file.fileId),
    );

    return newCriticalFiles.length > 0;
  };

  // Show one-time session alert for expiring files
  const showSessionExpiryAlert = (criticalFiles: ExpirationNotification[]) => {
    const fileCount = criticalFiles.length;
    const message =
      fileCount === 1
        ? "⚠️ Heads up: One of your files will be automatically deleted in less than 24 hours"
        : `⚠️ Heads up: ${fileCount} of your files will be automatically deleted in less than 24 hours`;

    toast.warning(message, {
      duration: 4500, // 4.5 seconds - auto-disappears quickly
      position: "bottom-right", // Bottom corner as requested
      description: `Files are automatically deleted after ${RETENTION_CONFIG.RETENTION_DISPLAY} for your security.`,
      action: {
        label: "View Files",
        onClick: () => {
          // Scroll to files table
          const tableElement = document.querySelector(
            "table, [data-files-table]",
          );
          if (tableElement) {
            tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        },
      },
      // Enhanced styling for subtle, non-intrusive appearance
      className: "border-amber-200 bg-amber-50 text-amber-900 shadow-md",
      style: {
        maxWidth: "380px", // Limit width for better UX
      },
    });

    // Mark session alert as shown
    sessionStorage.setItem(SESSION_KEYS.SHOWN_EXPIRY_ALERT, "true");

    // Track which files we've notified about
    const currentNotifiedIds = JSON.parse(
      sessionStorage.getItem(SESSION_KEYS.NOTIFIED_FILE_IDS) || "[]",
    );
    const allCriticalIds = criticalFiles.map((f) => f.fileId);
    const updatedNotifiedIds = [
      ...new Set([...currentNotifiedIds, ...allCriticalIds]),
    ];
    sessionStorage.setItem(
      SESSION_KEYS.NOTIFIED_FILE_IDS,
      JSON.stringify(updatedNotifiedIds),
    );

    hasShownSessionAlert.current = true;
  };

  // Check files for expiration warnings
  const checkExpirations = () => {
    const now = new Date();
    const newNotifications: ExpirationNotification[] = [];
    const criticalFiles: ExpirationNotification[] = [];

    files.forEach((file) => {
      const createdAt = new Date(file.dateCreated);
      const timeRemaining = RetentionUtils.getTimeRemaining(createdAt);
      const hoursRemaining = timeRemaining / (60 * 60 * 1000);

      // Critical: less than 24 hours remaining
      if (hoursRemaining <= 24 && hoursRemaining > 0) {
        const notification: ExpirationNotification = {
          fileId: file.id,
          fileName: file.name,
          timeRemaining: RetentionUtils.formatTimeRemaining(createdAt),
          status: hoursRemaining <= 6 ? "critical" : "warning",
        };

        newNotifications.push(notification);
        criticalFiles.push(notification);
      }
      // Expired files
      else if (hoursRemaining <= 0) {
        newNotifications.push({
          fileId: file.id,
          fileName: file.name,
          timeRemaining: "Expired",
          status: "expired",
        });
      }
    });

    setNotifications(newNotifications);
    setLastCheck(now);

    // Show session alert if conditions are met
    if (shouldShowSessionAlert(criticalFiles)) {
      showSessionExpiryAlert(criticalFiles);
    }
  };

  // Set up periodic checking and initial check
  useEffect(() => {
    // Small delay for initial check to ensure UI is ready
    const timeoutId = setTimeout(() => {
      checkExpirations();
    }, 500); // 500ms delay for smooth UI experience

    // Set up interval for periodic checking (every hour)
    const interval = setInterval(
      checkExpirations,
      RETENTION_CONFIG.WARNING_CHECK_INTERVAL_MS,
    );

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [files]);

  // Reset session tracking when files list changes significantly
  useEffect(() => {
    const currentFileIds = files
      .map((f) => f.id)
      .sort()
      .join(",");
    const lastKnownIds = sessionStorage.getItem("altech-last-file-ids");

    if (lastKnownIds && lastKnownIds !== currentFileIds) {
      // Files list changed significantly, reset some session tracking
      const notifiedIds = JSON.parse(
        sessionStorage.getItem(SESSION_KEYS.NOTIFIED_FILE_IDS) || "[]",
      );
      const currentIds = files.map((f) => f.id);
      const stillExistingIds = notifiedIds.filter((id: string) =>
        currentIds.includes(id),
      );

      sessionStorage.setItem(
        SESSION_KEYS.NOTIFIED_FILE_IDS,
        JSON.stringify(stillExistingIds),
      );
    }

    sessionStorage.setItem("altech-last-file-ids", currentFileIds);
  }, [files]);

  // Manual refresh function
  const refreshNotifications = () => {
    checkExpirations();
  };

  // Reset session alert (useful for testing or manual reset)
  const resetSessionAlert = () => {
    sessionStorage.removeItem(SESSION_KEYS.SHOWN_EXPIRY_ALERT);
    sessionStorage.removeItem(SESSION_KEYS.NOTIFIED_FILE_IDS);
    hasShownSessionAlert.current = false;
  };

  // Get summary of notifications
  const getNotificationSummary = () => {
    const warningCount = notifications.filter(
      (n) => n.status === "warning",
    ).length;
    const criticalCount = notifications.filter(
      (n) => n.status === "critical",
    ).length;
    const expiredCount = notifications.filter(
      (n) => n.status === "expired",
    ).length;

    return {
      total: notifications.length,
      warning: warningCount,
      critical: criticalCount,
      expired: expiredCount,
      hasAnyNotifications: notifications.length > 0,
      hasCriticalFiles: criticalCount > 0 || warningCount > 0,
    };
  };

  return {
    notifications,
    refreshNotifications,
    resetSessionAlert, // For testing/debugging
    getNotificationSummary,
    lastCheck,
  };
};
