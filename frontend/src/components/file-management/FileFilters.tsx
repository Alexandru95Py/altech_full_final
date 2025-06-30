import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Filter, X } from "lucide-react";

export interface FilterConfig {
  searchTerm: string;
  statusFilter: string;
  dateFilter?: string;
  sizeFilter?: string;
}

interface FileFiltersProps {
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  statusOptions?: Array<{ value: string; label: string }>;
  className?: string;
  showAdvanced?: boolean;
}

const defaultStatusOptions = [
  { value: "all", label: "All Files" },
  { value: "original", label: "Original" },
  { value: "processed", label: "Processed" },
  { value: "generated", label: "Generated" },
  { value: "merged", label: "Merged" },
  { value: "split", label: "Split" },
];

export const FileFilters: React.FC<FileFiltersProps> = ({
  filters,
  onFiltersChange,
  statusOptions = defaultStatusOptions,
  className,
  showAdvanced = false,
}) => {
  const updateFilter = (key: keyof FilterConfig, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      statusFilter: "all",
      dateFilter: "",
      sizeFilter: "",
    });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.statusFilter !== "all" ||
    filters.dateFilter ||
    filters.sizeFilter;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search files..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={filters.statusFilter}
              onChange={(e) => updateFilter("statusFilter", e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Button */}
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date Range
                </label>
                <select
                  value={filters.dateFilter || ""}
                  onChange={(e) => updateFilter("dateFilter", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All dates</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  File Size
                </label>
                <select
                  value={filters.sizeFilter || ""}
                  onChange={(e) => updateFilter("sizeFilter", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All sizes</option>
                  <option value="small">Small (&lt; 1MB)</option>
                  <option value="medium">Medium (1-10MB)</option>
                  <option value="large">Large (&gt; 10MB)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-600">Active filters:</span>
              {filters.searchTerm && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  Search: "{filters.searchTerm}"
                  <button
                    onClick={() => updateFilter("searchTerm", "")}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.statusFilter !== "all" && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Status: {filters.statusFilter}
                  <button
                    onClick={() => updateFilter("statusFilter", "all")}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileFilters;
