import React from "react";
import { cn } from "@/lib/utils";

interface DocumentPageProps {
  children: React.ReactNode;
  pageNumber: number;
  className?: string;
  showPageNumber?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * DocumentPage - Reusable A4-like page component
 * Maintains proper print dimensions and spacing
 */
export const DocumentPage: React.FC<DocumentPageProps> = ({
  children,
  pageNumber,
  className,
  showPageNumber = true,
  header,
  footer,
}) => {
  return (
    <div
      className={cn(
        "document-page",
        // A4 dimensions at 96 DPI: 794px x 1123px (8.27" x 11.69")
        "w-[794px] min-h-[1123px] mx-auto mb-8",
        "bg-white shadow-lg border border-slate-200",
        "relative",
        className,
      )}
      style={{
        // Print-friendly styling
        maxWidth: "794px",
        minHeight: "1123px",
      }}
    >
      {/* Header area */}
      {header && (
        <div className="document-header h-16 px-12 py-4 border-b border-slate-100">
          {header}
        </div>
      )}

      {/* Main content area with proper margins */}
      <div className="document-content px-12 py-16 min-h-[calc(1123px-128px)]">
        {children}
      </div>

      {/* Footer area */}
      <div className="document-footer absolute bottom-0 left-0 right-0 h-16 px-12 py-4 border-t border-slate-100 flex items-center justify-between">
        {footer}
        {showPageNumber && (
          <div className="text-sm text-slate-500 ml-auto">
            Page {pageNumber}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
