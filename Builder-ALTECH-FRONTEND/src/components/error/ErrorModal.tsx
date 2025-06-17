import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { ErrorConfig } from "@/types/error";

interface ErrorModalProps {
  isOpen: boolean;
  config: ErrorConfig;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  config,
  onClose,
}) => {
  const handleAction = () => {
    config.onAction?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {config.title || "Oops! Something went wrong."}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {config.message ||
              "An unexpected error occurred. Please try again."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3 mt-6">
          {config.onAction && (
            <Button
              onClick={handleAction}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw className="h-4 w-4" />
              {config.actionLabel || "Try Again"}
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
