import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, ChevronRight, RotateCcw } from "lucide-react";
import "@/styles/tutorial.css";

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  highlightElement?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to ALTech PDF",
    content:
      "ALTech PDF helps you edit, convert, and protect your PDF files in one modern, easy-to-use platform.",
    position: "center",
  },
  {
    id: 2,
    title: "My Tools",
    content:
      "This section contains all the main PDF tools: Merge, Split, Reorder, Compress, and more.",
    targetSelector: "[data-tutorial='my-tools']",
    position: "right",
    highlightElement: true,
  },
  {
    id: 3,
    title: "Protect Documents",
    content:
      "Use this tool to add password protection to your PDFs and control who can access or edit them.",
    targetSelector: "[data-tutorial='protect-documents']",
    position: "right",
    highlightElement: true,
  },
  {
    id: 4,
    title: "My Files",
    content:
      "All your PDFs are saved here. You can access, re-edit or delete them anytime.",
    targetSelector: "[data-tutorial='my-files']",
    position: "right",
    highlightElement: true,
  },
  {
    id: 5,
    title: "Support",
    content:
      "Need help? Use the support section to contact us or find answers to common questions.",
    targetSelector: "[data-tutorial='support']",
    position: "right",
    highlightElement: true,
  },
];

interface TutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const Tutorial = ({ isVisible, onComplete, onSkip }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (!isVisible || !currentStepData.targetSelector) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(
        currentStepData.targetSelector!,
      );
      if (!targetElement || !modalRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const modalRect = modalRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (currentStepData.position) {
        case "right":
          top = targetRect.top + targetRect.height / 2 - modalRect.height / 2;
          left = targetRect.right + 12;
          break;
        case "left":
          top = targetRect.top + targetRect.height / 2 - modalRect.height / 2;
          left = targetRect.left - modalRect.width - 12;
          break;
        case "top":
          top = targetRect.top - modalRect.height - 12;
          left = targetRect.left + targetRect.width / 2 - modalRect.width / 2;
          break;
        case "bottom":
          top = targetRect.bottom + 12;
          left = targetRect.left + targetRect.width / 2 - modalRect.width / 2;
          break;
        default:
          top = window.innerHeight / 2 - modalRect.height / 2;
          left = window.innerWidth / 2 - modalRect.width / 2;
      }

      // Ensure modal stays within viewport
      top = Math.max(
        12,
        Math.min(top, window.innerHeight - modalRect.height - 12),
      );
      left = Math.max(
        12,
        Math.min(left, window.innerWidth - modalRect.width - 12),
      );

      setModalPosition({ top, left });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [
    currentStep,
    isVisible,
    currentStepData.targetSelector,
    currentStepData.position,
  ]);

  useEffect(() => {
    if (!isVisible) return;

    // Add highlight to target element
    if (currentStepData.highlightElement && currentStepData.targetSelector) {
      const targetElement = document.querySelector(
        currentStepData.targetSelector,
      );
      if (targetElement) {
        targetElement.classList.add("tutorial-highlight-minimal");
      }
    }

    // Cleanup previous highlights
    return () => {
      document.querySelectorAll(".tutorial-highlight-minimal").forEach((el) => {
        el.classList.remove("tutorial-highlight-minimal");
      });
    };
  }, [
    currentStep,
    isVisible,
    currentStepData.highlightElement,
    currentStepData.targetSelector,
  ]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Subtle overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40" />

      {/* Tutorial Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 animate-in fade-in-0 zoom-in-98 duration-200"
        style={{
          top:
            currentStepData.position === "center" ? "50%" : modalPosition.top,
          left:
            currentStepData.position === "center" ? "50%" : modalPosition.left,
          transform:
            currentStepData.position === "center"
              ? "translate(-50%, -50%)"
              : undefined,
        }}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-lg shadow-lg w-72 max-w-sm">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      index <= currentStep ? "bg-blue-500" : "bg-slate-200",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentStepData.content}
            </p>
          </div>

          {/* Actions - positioned at bottom right */}
          <div className="flex items-center justify-between p-3 pt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs text-slate-500 hover:text-slate-700 h-7 px-2"
            >
              Skip tour
            </Button>

            <div className="flex gap-1">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-7 px-2 text-xs"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {isLastStep ? (
                  "Done"
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Connection line for positioned modals */}
        {currentStepData.position !== "center" && (
          <div
            className={cn(
              "absolute w-0 h-0",
              currentStepData.position === "right" &&
                "left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-4 border-r-white/95 border-t-4 border-t-transparent border-b-4 border-b-transparent",
              currentStepData.position === "left" &&
                "right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-4 border-l-white/95 border-t-4 border-t-transparent border-b-4 border-b-transparent",
              currentStepData.position === "top" &&
                "bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-4 border-t-white/95 border-l-4 border-l-transparent border-r-4 border-r-transparent",
              currentStepData.position === "bottom" &&
                "top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-4 border-b-white/95 border-l-4 border-l-transparent border-r-4 border-r-transparent",
            )}
          />
        )}
      </div>
    </>
  );
};

// Hook for managing tutorial state (unchanged)
export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(
      "altech-tutorial-completed",
    );
    const isFirstVisit = !localStorage.getItem("altech-first-visit");

    if (
      !hasCompletedTutorial &&
      (isFirstVisit || localStorage.getItem("altech-restart-tutorial"))
    ) {
      setShowTutorial(true);
      localStorage.setItem("altech-first-visit", "true");
      localStorage.removeItem("altech-restart-tutorial");
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("altech-tutorial-completed", "true");
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("altech-tutorial-completed", "true");
  };

  const restartTutorial = () => {
    localStorage.setItem("altech-restart-tutorial", "true");
    window.location.reload();
  };

  return {
    showTutorial,
    completeTutorial,
    skipTutorial,
    restartTutorial,
  };
};
