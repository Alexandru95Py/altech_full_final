import { Alert, AlertDescription } from "@/components/ui/alert";
import { RETENTION_CONFIG, RetentionUtils } from "@/config/retention";
import { Clock, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetentionPolicyInfoProps {
  variant?: "inline" | "alert" | "tooltip";
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RetentionPolicyInfo = ({
  variant = "inline",
  showIcon = true,
  className,
  size = "md",
}: RetentionPolicyInfoProps) => {
  const description = RetentionUtils.getRetentionDescription();

  const iconSize =
    size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-sm";

  if (variant === "alert") {
    return (
      <Alert className={cn("border-blue-200 bg-blue-50", className)}>
        {showIcon && <Clock className={iconSize} />}
        <AlertDescription className={textSize}>{description}</AlertDescription>
      </Alert>
    );
  }

  if (variant === "tooltip") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-slate-500",
          textSize,
          className,
        )}
      >
        {showIcon && <Info className={iconSize} />}
        <span>{description}</span>
      </div>
    );
  }

  // Default inline variant
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-slate-600",
        textSize,
        className,
      )}
    >
      {showIcon && <Clock className={iconSize} />}
      <span>
        Files are automatically deleted after{" "}
        <span className="font-medium text-slate-900">
          {RETENTION_CONFIG.RETENTION_DISPLAY}
        </span>{" "}
        for your security and privacy.
      </span>
    </div>
  );
};

export const SecurityFeaturesList = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Shield className="h-4 w-4 text-green-600" />
        <span>AES-256 encryption for all files</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Clock className="h-4 w-4 text-blue-600" />
        <span>
          Automatic deletion after {RETENTION_CONFIG.RETENTION_DISPLAY}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Shield className="h-4 w-4 text-purple-600" />
        <span>Zero-knowledge processing</span>
      </div>
    </div>
  );
};
