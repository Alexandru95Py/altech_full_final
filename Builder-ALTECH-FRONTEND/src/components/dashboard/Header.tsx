import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, User, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsPanel } from "./NotificationsPanel";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleNotificationCountChange = (count: number) => {
    setNotificationCount(count);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    // Add logout logic here - could be API call, localStorage clear, etc.
    // Handle logout
    // Clear any stored auth data
    localStorage.removeItem("authToken");
    // Navigate to auth page
    navigate("/auth");
  };

  const handleProfileMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsProfileDropdownOpen(true);
  };

  const handleProfileMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsProfileDropdownOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 z-20",
        "flex items-center justify-between",
        className,
      )}
    >
      <div className="pl-6">
        <h1 className="text-xl font-semibold text-slate-900">Altech PDF</h1>
      </div>

      <div className="flex items-center gap-4 pr-6">
        {/* Notification Icon */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-2 transition-colors",
            isNotificationsOpen && "bg-slate-100",
          )}
          onClick={handleNotificationsToggle}
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {/* Notification badge */}
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs text-white font-medium">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            </div>
          )}
        </Button>

        {/* Profile Dropdown */}
        <div
          className="relative"
          ref={profileDropdownRef}
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 h-auto p-2 transition-all duration-200",
              "hover:bg-slate-100 hover:shadow-sm",
              isProfileDropdownOpen && "bg-slate-100 shadow-sm",
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                A
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium">
              My Profile
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isProfileDropdownOpen && "rotate-180",
              )}
            />
          </Button>

          {/* Custom Dropdown Content */}
          <div
            className={cn(
              "absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50",
              "transform transition-all duration-200 ease-out origin-top-right",
              isProfileDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
            )}
          >
            {/* Profile Info Section */}
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                    A
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    Alexandru
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1">
              <button
                onClick={handleProfileClick}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700",
                  "rounded-md transition-colors duration-150",
                  "hover:bg-slate-50 hover:text-slate-900",
                  "focus:outline-none focus:bg-slate-50",
                )}
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>

              <div className="my-1 h-px bg-slate-100"></div>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm",
                  "rounded-md transition-colors duration-150",
                  "text-red-600 hover:bg-red-50 hover:text-red-700",
                  "focus:outline-none focus:bg-red-50",
                )}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNotificationCountChange={handleNotificationCountChange}
      />
    </header>
  );
}
