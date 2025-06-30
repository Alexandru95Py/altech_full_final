import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpStep {
  title?: string;
  content: string;
  example?: string;
}

interface HelpTooltipProps {
  title: string;
  steps: HelpStep[];
  className?: string;
  buttonClassName?: string;
  tooltipClassName?: string;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center";
  mobilePosition?: "bottom-sheet" | "full-width";
  showAnimation?: boolean;
}

export function HelpTooltip({
  title,
  steps,
  className,
  buttonClassName,
  tooltipClassName,
  position = "bottom-center",
  mobilePosition = "full-width",
  showAnimation = true,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Calculate optimal positioning when tooltip opens
  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const calculatePosition = () => {
        const button = buttonRef.current;
        if (!button) return;

        const buttonRect = button.getBoundingClientRect();
        const tooltipWidth = 360; // Our target width
        const margin = 16; // Minimum margin from viewport edge

        let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
        let top = buttonRect.bottom + 12;

        // Ensure tooltip doesn't go off-screen to the right
        if (left + tooltipWidth > window.innerWidth - margin) {
          left = window.innerWidth - tooltipWidth - margin;
        }

        // Ensure tooltip doesn't go off-screen to the left
        if (left < margin) {
          left = margin;
        }

        // If tooltip would go off bottom of screen, position above button
        if (top + 400 > window.innerHeight - margin) {
          // Approximate tooltip height
          top = buttonRect.top - 12;
        }

        setTooltipStyle({
          position: "fixed",
          top: top,
          left: left,
          width: tooltipWidth,
          maxWidth: `calc(100vw - ${margin * 2}px)`,
          zIndex: 9999,
        });
      };

      // Calculate position immediately and after a brief delay for smoother experience
      calculatePosition();
      const timeoutId = setTimeout(calculatePosition, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, isMobile]);

  const getAnimationClasses = () => {
    if (!showAnimation) return "";

    if (isMobile && mobilePosition === "bottom-sheet") {
      return isOpen
        ? "animate-in slide-in-from-bottom-full duration-300 ease-out"
        : "animate-out slide-out-to-bottom-full duration-200 ease-in";
    }

    return isOpen
      ? "animate-in fade-in-0 zoom-in-95 duration-200 ease-out"
      : "animate-out fade-out-0 zoom-out-95 duration-150 ease-in";
  };

  const getMobilePositionClasses = () => {
    if (mobilePosition === "bottom-sheet") {
      return "fixed bottom-0 left-0 right-0 rounded-t-xl rounded-b-none border-b-0 mx-4 mb-4";
    }
    return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 max-w-[calc(100vw-2rem)]";
  };

  return (
    <div className={cn("relative", className)}>
      {/* Help Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 w-8 p-0 rounded-full border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200",
          isOpen && "bg-blue-50 border-blue-400 text-blue-600",
          buttonClassName,
        )}
        aria-label="Show help"
        aria-expanded={isOpen}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Tooltip/Modal */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Tooltip Content */}
          <Card
            ref={tooltipRef}
            className={cn(
              "border-slate-200 shadow-xl z-[9999]",
              isMobile ? getMobilePositionClasses() : "absolute",
              getAnimationClasses(),
              tooltipClassName,
            )}
            style={isMobile ? { zIndex: 9999 } : tooltipStyle}
          >
            {/* Arrow pointer for desktop */}
            {!isMobile && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
            )}

            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-900">
                <span>{title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-slate-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {step.title && (
                        <h4 className="font-medium text-slate-900 text-sm mb-1">
                          {step.title}
                        </h4>
                      )}
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {step.content}
                      </p>
                      {step.example && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border-l-4 border-blue-500">
                          <p className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
                            {step.example}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  or click outside to close
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Preset help content for common tools
export const toolHelpContent = {
  split: {
    title: "How to Split PDF",
    steps: [
      {
        content: "Upload your PDF file using the upload button or drag & drop",
      },
      {
        content: "Choose how you want to split:",
        example:
          "• By selection (choose specific pages)\n• By range (e.g., 1-3, 5-7)\n• Evenly (every X pages)",
      },
      {
        content: "Preview your selection and click 'Split PDF'",
      },
      {
        content: "Download the split files or save to My Files",
      },
    ],
  },

  merge: {
    title: "How to Merge PDFs",
    steps: [
      {
        content: "Upload multiple PDF files from device or My Files",
      },
      {
        content: "Drag and drop files to reorder them as needed",
      },
      {
        content: "Configure merge settings (bookmarks, page breaks)",
      },
      {
        content: "Click 'Merge PDFs' and download the combined file",
      },
    ],
  },

  delete: {
    title: "How to Delete Pages",
    steps: [
      {
        content: "Upload your PDF file first",
      },
      {
        content: "Enter pages to delete in the input field",
        example: "Examples: 2, 4-6, 9 (deletes pages 2, 4, 5, 6, and 9)",
      },
      {
        content: "Preview deletion to see which pages will be removed",
      },
      {
        content: "Confirm deletion - this cannot be undone!",
      },
    ],
  },

  rotate: {
    title: "How to Rotate Pages",
    steps: [
      {
        content: "Upload your PDF and specify which pages to rotate",
      },
      {
        content: "Choose rotation angle:",
        example:
          "• 90° clockwise (portrait → landscape)\n• 90° counter-clockwise\n• 180° (upside down)",
      },
      {
        content: "Preview the rotation before applying",
      },
      {
        content: "Apply rotation and download the result",
      },
    ],
  },

  extract: {
    title: "How to Extract Pages",
    steps: [
      {
        content: "Upload your PDF file",
      },
      {
        content: "Specify pages to extract",
        example: "Format: 1, 3-5, 8 (extracts pages 1, 3, 4, 5, and 8)",
      },
      {
        content: "Use preview to visually select pages if needed",
      },
      {
        content: "Extract and save as a new PDF document",
      },
    ],
  },

  compress: {
    title: "How to Compress PDF",
    steps: [
      {
        content: "Upload your PDF file (max 25MB)",
      },
      {
        content: "Choose compression level:",
        example:
          "• Low (15% reduction, faster)\n• Medium (35% reduction, balanced)\n• High (55% reduction, slower)",
      },
      {
        content: "Adjust quality settings if needed",
      },
      {
        content: "Compress and download the smaller file",
      },
    ],
  },

  convert: {
    title: "How to Convert PDF",
    steps: [
      {
        content: "Upload your PDF file",
      },
      {
        content: "Choose output format:",
        example:
          "• Word (.docx) - for editing\n• PowerPoint (.pptx) - for presentations\n• Images (.jpg/.png) - for sharing\n• Text (.txt) - for content only",
      },
      {
        content: "Click convert and wait for processing",
      },
      {
        content: "Download your converted file",
      },
    ],
  },

  reorder: {
    title: "How to Reorder Pages",
    steps: [
      {
        content: "Upload your PDF file to see page thumbnails",
      },
      {
        content: "Drag and drop pages to reorder them",
        example:
          "Click and hold on any page, then drag it to the desired position",
      },
      {
        content: "Use zoom controls to better see page content",
      },
      {
        content: "Click 'Apply Changes' to save the new page order",
      },
    ],
  },

  generateCV: {
    title: "How to Generate CV",
    steps: [
      {
        content: "Fill in your personal information (name, email, phone, etc.)",
      },
      {
        content: "Add your professional summary and skills",
      },
      {
        content: "Add work experience and education sections",
        example: "Use the '+' buttons to add multiple entries",
      },
      {
        content: "Choose output option and generate your professional CV",
      },
    ],
  },
};
