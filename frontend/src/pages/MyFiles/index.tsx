import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStorage } from "@/contexts/StorageContext";
import { useFileExpirationNotifications } from "@/hooks/useFileExpirationNotifications";
import { StorageIndicator } from "@/components/storage/StorageIndicator";
import { PageLayout } from "@/components/shared/PageLayout";
import { FileUploader } from "@/components/shared/FileUploader";
import {
  FileTable,
  FileItem,
  FileSortConfig,
} from "@/components/file-management/FileTable";
import {
  FileFilters,
  FilterConfig,
} from "@/components/file-management/FileFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { StorageOverview } from "./StorageOverview";
import {
  Upload,
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { djangoAPI, handleAPIError } from "@/lib/api";
import { MyFilesTestButton } from "@/components/shared/MyFilesTestButton";

/**
 * MyFiles page - main file management interface
 * Displays user's uploaded and processed PDF files with storage tracking
 * Integrates with real backend API for file operations
 */
export default function MyFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<FileSortConfig>({
    field: "dateCreated",
    order: "desc",
  });
  const [filters, setFilters] = useState<FilterConfig>({
    searchTerm: "",
    statusFilter: "all",
  });

  const { removeFileUsage, addFileUsage } = useStorage();

  // Load files from API on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Helper function to format file size from bytes to human readable
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Convert API response to FileItem format
  const convertApiFileToFileItem = (apiFile: any): FileItem => {
    console.log("🔄 Converting API file:", apiFile);

    return {
      id: apiFile.id || `file-${Date.now()}-${Math.random()}`,
      name: apiFile.name || apiFile.filename || "Unknown file",
      size:
        typeof apiFile.size === "number"
          ? formatFileSize(apiFile.size)
          : apiFile.size || "Unknown",
      dateCreated:
        apiFile.created_at || apiFile.dateCreated || new Date().toISOString(),
      type: "PDF Document",
      status: apiFile.status || "Original",
    };
  };

  // Refine ApiResponse type
  interface FileListResponse {
    files: FileItem[];
  }

  interface DownloadResponse {
    blob?: Blob;
    filename?: string;
    type?: string;
    downloadUrl?: string;
  }

  interface ApiResponse {
    success: boolean;
    data?: FileListResponse | DownloadResponse;
    message?: string;
    error?: string;
  }

  // Use type guards for response handling
  const isFileListResponse = (
    data: FileListResponse | DownloadResponse,
  ): data is FileListResponse => {
    return (data as FileListResponse).files !== undefined;
  };

  const isDownloadResponse = (
    data: FileListResponse | DownloadResponse,
  ): data is DownloadResponse => {
    return (
      (data as DownloadResponse).blob !== undefined ||
      (data as DownloadResponse).downloadUrl !== undefined
    );
  };

  // Load files from backend API with comprehensive error handling
  const loadFiles = async (showLoader = true) => {
    console.log("📁 Starting loadFiles, showLoader:", showLoader);

    if (showLoader) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      console.log("📁 Making API call to getFiles...");

      // Call the API
      const response = (await djangoAPI.getFiles()) as ApiResponse;
      console.log("📁 Raw API Response:", response);

      // Check if response is valid
      if (!response) {
        throw new Error("No response received from API");
      }

      // Handle successful response
      if (response.success) {
        console.log("📁 API call successful, processing data...");

        // Extract files array from response
        let filesData: FileItem[] = [];
        if (isFileListResponse(response.data)) {
          filesData = response.data.files;
        } else if (Array.isArray(response.data)) {
          filesData = response.data.map(convertApiFileToFileItem);
        }

        console.log("📁 Extracted files data:", filesData);
        console.log("📁 Number of files found:", filesData.length);

        setFiles(filesData);
        setError(null);

        // Show success message only on manual refresh
        if (!showLoader) {
          toast.success(`Loaded ${filesData.length} files successfully`);
        }
      } else {
        // Handle API response with success: false
        const errorMsg =
          response.message ||
          response.error ||
          "Failed to load files from server";
        console.warn("📁 API response not successful:", response);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("📁 Error loading files:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const displayError = handleAPIError(error);

      setError(displayError);

      // Show error toast
      toast.error("Failed to load files", {
        description: displayError,
      });

      // On first load, clear files. On refresh, keep existing files
      if (showLoader) {
        setFiles([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      console.log("📁 loadFiles completed");
    }
  };

  // Handle successful file upload
  const handleUploadComplete = (uploadResponse: any) => {
    console.log("📤 Upload completed:", uploadResponse);

    // Add the uploaded file to the list
    const newFile: FileItem = {
      id:
        uploadResponse.id || uploadResponse.fileId || `uploaded-${Date.now()}`,
      name:
        uploadResponse.filename || uploadResponse.fileName || "Uploaded file",
      size: uploadResponse.size
        ? formatFileSize(uploadResponse.size)
        : "Unknown",
      dateCreated:
        uploadResponse.created_at ||
        uploadResponse.uploadedAt ||
        new Date().toISOString(),
      type: "PDF Document",
      status: uploadResponse.status || "Original",
    };

    setFiles((prev) => [newFile, ...prev]);
    setShowUploader(false);

    // Refresh the file list to ensure consistency with backend
    setTimeout(() => loadFiles(false), 1000);
  };

  // Transform FileItem[] to FileWithExpiration[]
  const transformedFiles = files.map((file) => ({
    ...file,
    id: String(file.id), // Ensure id is a string
  }));

  // Monitor file expiration and show notifications when files are expiring
  const { notifications, getNotificationSummary } =
    useFileExpirationNotifications(transformedFiles);

  // Memoized file filtering and sorting to optimize performance
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesSearch = file.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());
        const matchesFilter =
          filters.statusFilter === "all" ||
          file.status.toLowerCase() === filters.statusFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.field === "dateCreated") {
          aValue = new Date(a.dateCreated).getTime();
          bValue = new Date(b.dateCreated).getTime();
        } else if (sortConfig.field === "size") {
          aValue = parseFloat(a.size);
          bValue = parseFloat(b.size);
        } else {
          aValue = a[sortConfig.field];
          bValue = b[sortConfig.field];
        }

        const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.order === "asc" ? result : -result;
      });
  }, [files, filters, sortConfig]);

  // Handle table column sorting - toggles direction if same field clicked
  const handleSort = (field: FileSortConfig["field"]) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Handle file deletion with storage usage tracking
  const handleFileDelete = (file: FileItem) => {
    console.log("🗑️ File deleted:", file);

    // Remove from local state immediately for responsive UI
    setFiles((prev) => prev.filter((f) => f.id !== file.id));

    // Convert file size to bytes and remove from storage usage
    const sizeMatch = file.size.match(/^([\d.]+)\s*(KB|MB|GB)$/i);
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      let fileSizeInBytes = size;

      switch (unit) {
        case "KB":
          fileSizeInBytes = size * 1024;
          break;
        case "MB":
          fileSizeInBytes = size * 1024 * 1024;
          break;
        case "GB":
          fileSizeInBytes = size * 1024 * 1024 * 1024;
          break;
      }

      removeFileUsage(fileSizeInBytes);
    }
  };

  // File preview functionality - will integrate with PDF viewer
  const handleFileView = (file: FileItem) => {
    toast.info(`Opening ${file.name} for preview`);
    // TODO: Implement file preview modal or new tab
  };

  // File download functionality using backend API
  const handleFileDownload = async (file: FileItem) => {
    console.log("📥 Download requested for file:", file);

    try {
      // Try to download from backend API first
      const downloadResponse: ApiResponse = await djangoAPI.downloadFile(String(file.id));
      console.log("📥 Download response:", downloadResponse);

      if (downloadResponse.success && isDownloadResponse(downloadResponse.data)) {
        if (downloadResponse.data.downloadUrl) {
          // Use the API download URL
          const link = document.createElement("a");
          link.href = downloadResponse.data.downloadUrl;
          link.download = downloadResponse.data.filename || file.name;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success(`Downloaded "${file.name}" successfully!`);
        } else if (downloadResponse.data.blob) {
          // Handle blob response
          const blob = downloadResponse.data.blob;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = downloadResponse.data.filename || file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success(`Downloaded "${file.name}" successfully!`);
        }
      }
    } catch (error) {
      console.error("📥 Download failed:", error);
      toast.error(`Download failed: ${handleAPIError(error)}`);
    }
  };

  // Calculate the most recent upload date for storage overview
  const lastUploadDate =
    files.length > 0
      ? files.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        )[0].dateCreated
      : undefined;

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <PageLayout
        title="My Files"
        description="All your uploaded and generated files are stored here. You can view, download, or delete them."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <span className="ml-2 text-slate-600">Loading files...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="My Files"
      description="All your uploaded and generated files are stored here. You can view, download, or delete them."
    >
      {/* Debug section - FOR DEVELOPMENT ONLY */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              🧪 Debug Tools (Development Only)
            </h3>
            <p className="text-xs text-yellow-700">
              Use these tools to test the My Files API directly
            </p>
          </div>
          <MyFilesTestButton />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Failed to load files
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadFiles(true)}
              className="ml-auto"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Upload section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload New File</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadFiles(false)}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button onClick={() => setShowUploader(!showUploader)} size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {showUploader ? "Hide Uploader" : "Upload File"}
            </Button>
          </div>
        </div>

        {showUploader && (
          <FileUploader
            onUploadComplete={handleUploadComplete}
            autoUpload={true}
            title="Upload PDF File"
            description="Select a PDF file to upload to your account"
            className="mb-6"
          />
        )}
      </div>

      {/* Storage overview cards showing file count, usage, and last upload */}
      <StorageOverview
        totalFiles={files.length}
        lastUploadDate={lastUploadDate}
      />

      {/* Detailed storage progress indicator */}
      <StorageIndicator variant="detailed" className="mb-6" />

      {/* Search and filter controls */}
      <FileFilters
        filters={filters}
        onFiltersChange={setFilters}
        className="mb-6"
      />

      {/* Main files table or empty state */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedFiles.length > 0 ? (
            <FileTable
              files={filteredAndSortedFiles}
              sortConfig={sortConfig}
              onSort={handleSort}
              onView={handleFileView}
              onDownload={handleFileDownload}
              onDelete={handleFileDelete}
              showExpirationInfo={true}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title={
                files.length === 0 ? "No files uploaded" : "No files found"
              }
              description={
                error
                  ? "Unable to load files. Please check your connection and try again."
                  : filters.searchTerm || filters.statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Upload your first PDF to get started."
              }
              actionLabel="Upload File"
              onAction={() => setShowUploader(true)}
            >
              {!error && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowUploader(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              )}
            </EmptyState>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
