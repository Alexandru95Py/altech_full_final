import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useStorage } from "@/contexts/StorageContext";
import { STORAGE_CONFIG, StorageUtils } from "@/config/storage";
import { HardDrive, AlertTriangle, AlertCircle } from "lucide-react";

interface StorageIndicatorProps {
  variant?: "card" | "compact" | "detailed";
  showAlert?: boolean;
  className?: string;
}

export const StorageIndicator = ({
  variant = "card",
  showAlert = true,
  className,
}: StorageIndicatorProps) => {
  const {
    usedStorage,
    storagePercentage,
    storageStatus,
    getFormattedUsage,
    getFormattedRemaining,
  } = useStorage();

  const usedGB = StorageUtils.bytesToGB(usedStorage);
  const maxGB = STORAGE_CONFIG.MAX_STORAGE_GB;

  // Progress bar color based on usage
  const getProgressColor = () => {
    switch (storageStatus) {
      case "critical":
      case "full":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  // Alert message based on status
  const getAlertContent = () => {
    switch (storageStatus) {
      case "full":
        return {
          icon: AlertCircle,
          variant: "destructive" as const,
          title: "Storage Full",
          message:
            "You have reached your storage limit. Please delete some files to upload new ones.",
        };
      case "critical":
        return {
          icon: AlertTriangle,
          variant: "destructive" as const,
          title: "Storage Almost Full",
          message: `You're using ${storagePercentage}% of your storage. Consider deleting unnecessary files.`,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          variant: "default" as const,
          title: "High Storage Usage",
          message: `You're using ${storagePercentage}% of your storage space.`,
        };
      default:
        return null;
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <HardDrive className="h-4 w-4 text-slate-500" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-600">
            {usedGB} GB / {maxGB} GB
          </div>
          <Progress
            value={storagePercentage}
            className="h-2 mt-1"
            indicatorClassName={getProgressColor()}
          />
        </div>
        <div className="text-xs text-slate-500">{storagePercentage}%</div>
      </div>
    );
  }

  if (variant === "detailed") {
    const alertContent = getAlertContent();

    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="h-5 w-5 text-slate-500" />
              <div>
                <h3 className="font-semibold text-slate-900">Storage Usage</h3>
                <p className="text-sm text-slate-500">{getFormattedUsage()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Used</span>
                <span className="font-medium">{usedGB} GB</span>
              </div>
              <Progress
                value={storagePercentage}
                className="h-3"
                indicatorClassName={getProgressColor()}
              />
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {getFormattedRemaining()}
                </span>
                <span className="text-slate-500">{storagePercentage}%</span>
              </div>
            </div>

            {showAlert && alertContent && (
              <Alert variant={alertContent.variant} className="mt-4">
                <alertContent.icon className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{alertContent.title}</div>
                  <div className="text-sm mt-1">{alertContent.message}</div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Storage</span>
          </div>
          <span className="text-sm text-slate-500">{storagePercentage}%</span>
        </div>

        <Progress
          value={storagePercentage}
          className="h-2 mb-2"
          indicatorClassName={getProgressColor()}
        />

        <div className="text-xs text-slate-500">
          {usedGB} GB of {maxGB} GB used
        </div>
      </CardContent>
    </Card>
  );
};
