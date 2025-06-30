import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  FileText,
  Download,
  Upload,
  Clock,
  CheckCheck,
  Trash2,
  Bell,
  BellOff,
} from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedFile?: string;
  action?: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
  onNotificationCountChange,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      message: 'Your file "Contract_2024.pdf" was protected successfully.',
      timestamp: "2 min ago",
      isRead: false,
      relatedFile: "Contract_2024.pdf",
      action: "protect",
    },
    {
      id: "2",
      type: "info",
      message: 'PDF document "Report_Final.pdf" is ready for download.',
      timestamp: "5 min ago",
      isRead: false,
      relatedFile: "Report_Final.pdf",
      action: "download",
    },
    {
      id: "3",
      type: "success",
      message: 'Document "Invoice_December.pdf" uploaded to My Files.',
      timestamp: "15 min ago",
      isRead: true,
      relatedFile: "Invoice_December.pdf",
      action: "upload",
    },
    {
      id: "4",
      type: "warning",
      message:
        'File processing for "Presentation_Q4.pdf" is taking longer than usual.',
      timestamp: "1 hour ago",
      isRead: true,
      relatedFile: "Presentation_Q4.pdf",
      action: "process",
    },
    {
      id: "5",
      type: "info",
      message:
        "Welcome to ALTech PDF! Your account has been created successfully.",
      timestamp: "2 hours ago",
      isRead: true,
      action: "welcome",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Update parent component when unread count changes
  useEffect(() => {
    onNotificationCountChange?.(unreadCount);
  }, [unreadCount, onNotificationCountChange]);

  const dismissNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertCircle;
      case "error":
        return AlertCircle;
      case "info":
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "info":
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "protect":
        return Shield;
      case "download":
        return Download;
      case "upload":
        return Upload;
      case "process":
        return Clock;
      default:
        return FileText;
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // In a real app, this would navigate to the related file or action
    if (notification.relatedFile) {
      // Open file
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Notifications Panel */}
      <div className="fixed top-16 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                🔔 Notifications
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 text-xs"
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs h-7 px-2"
                        >
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Mark all read
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Mark all notifications as read
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {notifications.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllNotifications}
                          className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear all notifications</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="space-y-1 p-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <BellOff className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">
                      All caught up!
                    </h3>
                    <p className="text-slate-500 text-sm">
                      No new notifications at the moment.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(
                      notification.type,
                    );
                    const ActionIcon = getActionIcon(notification.action);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "group relative p-3 rounded-lg transition-all duration-300",
                          "hover:bg-slate-50 border border-transparent hover:border-slate-200",
                          !notification.isRead &&
                            "bg-blue-50/50 border-blue-200",
                        )}
                      >
                        {/* Dismiss Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) =>
                                  dismissNotification(notification.id, e)
                                }
                                className={cn(
                                  "absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100",
                                  "transition-opacity duration-200 text-slate-400 hover:text-red-600 hover:bg-red-50 z-10",
                                )}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Dismiss notification
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Clickable Content */}
                        <div
                          className="cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3 pr-8">
                            {/* Status Icon */}
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                                getNotificationColor(notification.type),
                              )}
                            >
                              <IconComponent className="h-3 w-3" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={cn(
                                    "text-sm leading-relaxed text-slate-700 pr-2",
                                    !notification.isRead && "font-medium",
                                  )}
                                >
                                  {notification.message}
                                </p>

                                {/* Action Icon */}
                                {notification.action && (
                                  <ActionIcon className="h-3 w-3 text-slate-400 flex-shrink-0 mt-1" />
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">
                                  {notification.timestamp}
                                </span>

                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Showing {Math.min(5, notifications.length)} most recent
                notifications
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
