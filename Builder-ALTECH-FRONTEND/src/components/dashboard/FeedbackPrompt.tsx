import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, MessageCircle } from "lucide-react";

interface FeedbackPromptProps {
  className?: string;
}

export function FeedbackPrompt({ className }: FeedbackPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [hasShownFeedback, setHasShownFeedback] = useState(false);

  // Track user actions (simulate with setTimeout for demo)
  useEffect(() => {
    // Check if feedback was already shown this session
    const feedbackShown = sessionStorage.getItem("feedbackPromptShown");
    if (feedbackShown) {
      setHasShownFeedback(true);
      return;
    }

    // Simulate user actions over time (in real app, this would be triggered by actual user actions)
    const actionTimers = [
      setTimeout(() => setActionCount(1), 5000), // First action after 5s
      setTimeout(() => setActionCount(2), 10000), // Second action after 10s
      setTimeout(() => setActionCount(3), 15000), // Third action after 15s (triggers feedback)
    ];

    return () => {
      actionTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Show feedback prompt after 3 actions
  useEffect(() => {
    if (actionCount >= 3 && !hasShownFeedback) {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 100);

      // Auto-hide after 10 seconds
      setTimeout(() => {
        handleDismiss();
      }, 10000);
    }
  }, [actionCount, hasShownFeedback]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
      setHasShownFeedback(true);
      sessionStorage.setItem("feedbackPromptShown", "true");
    }, 300);
  };

  const handleGiveFeedback = () => {
    // In a real app, this would open a feedback form or redirect
    // Open feedback form
    handleDismiss();
  };

  if (!isAnimating || hasShownFeedback) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 max-w-sm",
        "transition-all duration-300 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
        className,
      )}
    >
      <Card className="border border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-relaxed">
                💬 Enjoying the tools? We'd love to hear your thoughts.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleGiveFeedback}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-auto"
                >
                  Give Feedback
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1.5 h-auto"
                >
                  Not now
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 h-auto w-auto text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
