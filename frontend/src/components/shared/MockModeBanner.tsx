/**
 * Mock Mode Banner Component
 * Displays a prominent banner when the application is running in mock mode
 */

import React from "react";
import { AlertTriangle, Settings, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isMockMode, MOCK_CONFIG } from "@/config/mockMode";

interface MockModeBannerProps {
  className?: string;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export const MockModeBanner: React.FC<MockModeBannerProps> = ({
  className = "",
  onDismiss,
  showDetails = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [showDetailedInfo, setShowDetailedInfo] = React.useState(showDetails);

  // Don't render if not in mock mode or if dismissed
  if (!isMockMode() || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const toggleDetails = () => {
    setShowDetailedInfo(!showDetailedInfo);
  };

  return (
    <div className={`mock-mode-banner ${className}`}>
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex-1 pr-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 border-amber-300"
              >
                🎭 MOCK MODE ACTIVE
              </Badge>
              <span className="text-sm font-medium">
                Development Mode - All API calls are simulated
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDetails}
                className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
              >
                <Settings className="h-4 w-4" />
                {showDetailedInfo ? "Hide" : "Details"}
              </Button>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {showDetailedInfo && (
            <div className="mt-3 p-3 bg-amber-100 rounded-md border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">
                    Mock Features
                  </h4>
                  <ul className="space-y-1 text-amber-700">
                    <li>• File upload/download simulation</li>
                    <li>• Progress tracking with delays</li>
                    <li>• Realistic error simulation</li>
                    <li>• PDF processing mockups</li>
                    <li>• Fill & Sign data persistence</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">
                    Mock Settings
                  </h4>
                  <ul className="space-y-1 text-amber-700">
                    <li>
                      • Upload Success:{" "}
                      {Math.round(MOCK_CONFIG.data.upload.successRate * 100)}%
                    </li>
                    <li>• Network Delay: {MOCK_CONFIG.delays.medium}ms</li>
                    <li>
                      • Console Logging:{" "}
                      {MOCK_CONFIG.logging.enabled ? "ON" : "OFF"}
                    </li>
                    <li>
                      • Progress Steps: {MOCK_CONFIG.data.upload.progressSteps}
                    </li>
                    <li>• Sample Files: {3} loaded</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-amber-900">
                    Sample Data
                  </h4>
                  <ul className="space-y-1 text-amber-700">
                    <li>
                      • User: {MOCK_CONFIG.data.defaultUser.firstName}{" "}
                      {MOCK_CONFIG.data.defaultUser.lastName}
                    </li>
                    <li>
                      • Storage:{" "}
                      {Math.round(MOCK_CONFIG.data.storage.used / 1024 / 1024)}
                      MB used
                    </li>
                    <li>• Plan: Free (Mock)</li>
                    <li>• Files: Sample PDFs loaded</li>
                    <li>• Auth: JWT simulation active</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-300">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> No real backend connection is made. All
                  data is temporary and will reset on page refresh. Check the
                  browser console for detailed API call logs.
                </p>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <style jsx>{`
        .mock-mode-banner {
          position: sticky;
          top: 0;
          z-index: 50;
          margin-bottom: 0;
        }

        .mock-mode-banner .alert {
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to check if mock mode banner should be shown
 */
export const useMockModeBanner = () => {
  return {
    isMockMode: isMockMode(),
    showBanner: isMockMode(),
  };
};

export default MockModeBanner;
