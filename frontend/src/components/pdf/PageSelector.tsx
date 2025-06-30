import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

export interface PDFPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string;
}

interface PageSelectorProps {
  pages: PDFPage[];
  onPageToggle: (pageId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPreview?: (page: PDFPage) => void;
  className?: string;
  maxHeight?: string;
}

/**
 * PDF page selection interface with thumbnail grid and batch selection controls
 * Allows users to select specific pages for PDF operations like split, extract, etc.
 */
export const PageSelector: React.FC<PageSelectorProps> = ({
  pages,
  onPageToggle,
  onSelectAll,
  onDeselectAll,
  onPreview,
  className,
  maxHeight = "400px",
}) => {
  const selectedCount = pages.filter((p) => p.selected).length;
  const allSelected = selectedCount === pages.length && pages.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selection controls and counter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          {selectedCount} of {pages.length} pages selected
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>

      {/* Responsive grid of PDF page thumbnails */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto"
        style={{ maxHeight }}
      >
        {pages.map((page) => (
          <Card
            key={page.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-md",
              page.selected
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:ring-1 hover:ring-slate-300",
            )}
            onClick={() => onPageToggle(page.id)}
          >
            <CardContent className="p-2">
              {/* Page selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={page.selected}
                  onChange={() => onPageToggle(page.id)}
                  className="bg-white shadow-sm"
                />
              </div>

              {/* Optional preview button for individual page viewing */}
              {onPreview && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(page);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* PDF page thumbnail image */}
              <div className="aspect-[3/4] bg-white border rounded overflow-hidden mb-2">
                <img
                  src={page.thumbnail}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Page number label */}
              <div className="text-center text-xs font-medium text-slate-700">
                Page {page.pageNumber}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selection summary feedback */}
      {selectedCount > 0 && (
        <div className="text-center text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
          {selectedCount} page{selectedCount !== 1 ? "s" : ""} will be processed
        </div>
      )}
    </div>
  );
};

export default PageSelector;
