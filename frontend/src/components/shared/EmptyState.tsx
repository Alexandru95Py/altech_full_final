import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

/**
 * Consistent empty state component for when lists or tables have no data
 * Provides icon, title, description, and optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  iconClassName,
  children,
}) => {
  return (
    <div className={cn("text-center py-12", className)}>
      {/* Empty state icon */}
      <Icon
        className={cn("mx-auto h-12 w-12 text-slate-400 mb-4", iconClassName)}
      />

      {/* Title and description */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>

      {/* Optional primary action button */}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}

      {/* Additional custom content */}
      {children}
    </div>
  );
};

export default EmptyState;
