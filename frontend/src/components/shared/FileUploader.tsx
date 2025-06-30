import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useStorage } from "@/contexts/StorageContext";
import { djangoAPI, handleAPIError } from "@/lib/api";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  onUploadComplete?: (uploadResponse: any) => void;
  acceptedTypes?: string;
  maxFileSize?: number; // in bytes
  currentFile?: File | null;
  className?: string;
  showMyFiles?: boolean;
  onMyFilesClick?: () => void;
  title?: string;
  description?: string;
  autoUpload?: boolean; // If true, uploads immediately on file selection
}

/**
 * Universal file uploader component with drag-drop support and validation
 * Handles PDF file uploads with storage limit checking and progress tracking
 * Integrates with real backend API for file uploads
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  onUploadComplete,
  acceptedTypes = ".pdf",
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  currentFile: externalFile,
  className,
  showMyFiles = true,
  onMyFilesClick,
  title = "Upload PDF File",
  description = "Select a PDF file or drag and drop it here",
  autoUpload = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(
    externalFile || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<any>(null);

  const { handleFileSizeError, handleUploadError } = useErrorHandler();
  const { canUpload, addFileUsage } = useStorage();

  // Validates uploaded file against type, size, and storage constraints
  const validateFile = (file: File): boolean => {
    if (!file.type.includes("pdf")) {
      handleFileSizeError();
      return false;
    }

    if (file.size > maxFileSize) {
      handleFileSizeError(`${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return false;
    }

    if (!canUpload(file.size)) {
      handleFileSizeError();
      return false;
    }

    return true;
  };

  // Real file upload function using backend API
  const uploadFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      const response = await djangoAPI.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.data) {
        setUploadComplete(true);
        setUploadResponse(response.data);
        addFileUsage(file.size); // Track storage usage

        toast.success(`File "${file.name}" uploaded successfully!`);

        if (onUploadComplete) {
          onUploadComplete(response.data);
        }
      }
    } catch (error) {
      handleUploadError();
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${handleAPIError(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Processes file selection from input or drag-drop
  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (validateFile(file)) {
      setCurrentFile(file);
      setUploadComplete(false);
      setUploadResponse(null);

      if (onFileSelect) {
        onFileSelect(file);
      }

      // Auto-upload if enabled
      if (autoUpload) {
        uploadFile(file);
      }
    }
  };

  // Drag and drop event handlers for visual feedback
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setCurrentFile(null);
    setUploadComplete(false);
    setUploadResponse(null);
    setUploadProgress(0);

    if (onFileRemove) {
      onFileRemove();
    }
  };

  const handleManualUpload = () => {
    if (currentFile && !isUploading) {
      uploadFile(currentFile);
    }
  };

  // Utility function to format file size in human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main upload area with drag-drop support and visual states */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : currentFile
              ? "border-green-500 bg-green-50"
              : "border-slate-300 hover:border-slate-400",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <CardContent className="p-8 text-center">
          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
          />

          {!currentFile ? (
            <>
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-slate-600 mb-4">{description}</p>
              <Button
                type="button"
                onClick={handleButtonClick}
                className="mb-4"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <p className="text-xs text-slate-500">
                Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB
              </p>
            </>
          ) : (
            <>
              {uploadComplete ? (
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              ) : (
                <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              )}

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {uploadComplete
                  ? "Upload Complete"
                  : isUploading
                    ? "Uploading..."
                    : "File Selected"}
              </h3>

              <p className="text-slate-600 mb-2">{currentFile.name}</p>
              <p className="text-sm text-slate-500 mb-4">
                Size: {formatFileSize(currentFile.size)}
              </p>

              {/* Upload progress indicator when file is being uploaded */}
              {isUploading && (
                <div className="space-y-2 mb-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-slate-600">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {/* Success message and file info */}
              {uploadComplete && uploadResponse && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-800">
                    File uploaded successfully! File ID:{" "}
                    {uploadResponse.fileId || uploadResponse.id}
                  </p>
                </div>
              )}

              {/* File management buttons */}
              {!isUploading && (
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    onClick={handleButtonClick}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change File
                  </Button>

                  {!autoUpload && !uploadComplete && (
                    <Button
                      type="button"
                      onClick={handleManualUpload}
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Optional "My Files" selection button */}
      {showMyFiles && onMyFilesClick && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={onMyFilesClick}
            disabled={isUploading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Choose from My Files
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
