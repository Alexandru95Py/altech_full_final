import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

/**
 * Reusable loading spinner component with multiple sizes and optional overlay
 * Used throughout the app for upload progress, processing states, etc.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={cn(
          "animate-spin text-blue-600",
          sizeClasses[size],
          className,
        )}
      />
      {text && <p className="text-sm text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  // Full-screen overlay for blocking operations like file uploads
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
