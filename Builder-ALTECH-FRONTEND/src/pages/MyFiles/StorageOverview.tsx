import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageIndicator } from "@/components/storage/StorageIndicator";
import { useStorage } from "@/contexts/StorageContext";
import { STORAGE_CONFIG, StorageUtils } from "@/config/storage";
import { FileText, HardDrive, Calendar } from "lucide-react";

interface StorageOverviewProps {
  totalFiles: number;
  lastUploadDate?: string;
}

/**
 * Storage overview cards component for MyFiles page
 * Displays key metrics: file count, storage usage, and last upload date
 */
export const StorageOverview: React.FC<StorageOverviewProps> = ({
  totalFiles,
  lastUploadDate,
}) => {
  const { usedStorage } = useStorage();

  // Format date string for human-readable display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total files counter */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFiles}</div>
          <p className="text-xs text-muted-foreground">PDF documents stored</p>
        </CardContent>
      </Card>

      {/* Storage usage indicator */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {StorageUtils.bytesToGB(usedStorage)} GB
          </div>
          <p className="text-xs text-muted-foreground">
            of {STORAGE_CONFIG.MAX_STORAGE_GB} GB available
          </p>
        </CardContent>
      </Card>

      {/* Last upload date tracker */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Upload</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {lastUploadDate ? formatDate(lastUploadDate) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Most recent file</p>
        </CardContent>
      </Card>

      {/* Storage progress card with visual indicator */}
      <StorageIndicator variant="card" showAlert={false} />
    </div>
  );
};

export default StorageOverview;
