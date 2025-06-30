import React, { useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, RotateCcw } from "lucide-react";
import { ErrorConfig } from "@/types/error";

interface ErrorToastProps {
  config: ErrorConfig;
  onDismiss: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  config,
  onDismiss,
}) => {
  useEffect(() => {
    const message = (
      <div className="flex items-start gap-3 w-full">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-red-900 text-sm leading-5">
            {config.title || "Oops! Something went wrong."}
          </div>
          <div className="text-red-700 text-sm mt-1 leading-5">
            {config.message ||
              "An unexpected error occurred. Please try again."}
          </div>
        </div>
      </div>
    );

    const toastId = toast.error(message, {
      duration: config.duration || 4000,
      position: "bottom-right",
      className:
        "border-red-200 bg-red-50 text-red-900 shadow-lg rounded-lg max-w-md sm:max-w-sm",
      action: config.onAction
        ? {
            label: (
              <div className="flex items-center gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{config.actionLabel || "Try Again"}</span>
              </div>
            ),
            onClick: () => {
              config.onAction?.();
              onDismiss();
            },
          }
        : undefined,
      onDismiss: () => {
        onDismiss();
      },
      onAutoClose: () => {
        onDismiss();
      },
    });

    return () => {
      toast.dismiss(toastId);
    };
  }, [config, onDismiss]);

  return null;
};
