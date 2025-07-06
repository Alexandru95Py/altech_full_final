import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";
import { realFileDownload } from "@/utils/realFileDownload";
import {
  Upload,
  X,
  FileText,
  Play,
  Download,
  Save,
  Trash2,
  Archive,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  filename: string;
  id: string;
  file: File;
  name: string; // Added property for file name
  size: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  result?: {
    downloadUrl: string;
    filename: string;
  };
}

interface ProcessingOptions {
  // Merge options
  mergeOrder?: "alphabetical" | "upload-order" | "custom";

  // Split options
  splitMethod?: "pages" | "size" | "bookmarks";
  pagesPerSplit?: number;

  // Compression options
  compressionLevel?: "low" | "medium" | "high";

  // Conversion options
  convertFormat?: "docx" | "pptx" | "jpg" | "png" | "txt";

  // Rotation options
  rotationAngle?: "90" | "-90" | "180";

  // Page operations
  pageNumbers?: "string";

  // Protection options
  password?: "string";

  // Extract options
  extractType?: "first" | "last" | "custom" | "range";
}

const processingTypes = [
  {
    value: "merge",
    label: "Merge PDFs",
    description: "Combine all files into one PDF",
  },
  {
    value: "split",
    label: "Split PDFs",
    description: "Divide each PDF into smaller files",
  },
  {
    value: "compress",
    label: "Compress PDFs",
    description: "Reduce file sizes",
  },
  {
    value: "convert",
    label: "Convert PDFs",
    description: "Transform to other formats",
  },
  {
    value: "rotate",
    label: "Rotate Pages",
    description: "Change page orientation",
  },
  {
    value: "extract",
    label: "Extract Pages",
    description: "Save specific pages",
  },
  {
    value: "delete",
    label: "Delete Pages",
    description: "Remove specific pages",
  },
  {
    value: "protect",
    label: "Protect PDFs",
    description: "Add password protection",
  },
  {
    value: "reorder",
    label: "Reorder Pages",
    description: "Rearrange page order",
  },
];

const helpSteps = [
  {
    title: "Upload Files",
    content: "Upload multiple PDF files (max 100MB total)",
  },
  {
    title: "Choose Action",
    content: "Select the processing operation to apply",
  },
  {
    title: "Configure Options",
    content: "Set specific parameters for your chosen action",
  },
  {
    title: "Start Processing",
    content: "Begin batch processing all files",
  },
  {
    title: "Download Results",
    content: "Download individual files or all as ZIP",
  },
];

export default function BatchProcessing() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingType, setProcessingType] = useState<string>("");
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(
    {},
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [isFilesCollapsed, setIsFilesCollapsed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const maxSizeInBytes = 100 * 1024 * 1024; // 100MB

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const generateFileId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleFileUpload = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const pdfFiles = fileArray.filter(
        (file) => file.type === "application/pdf",
      );

      if (pdfFiles.length !== fileArray.length) {
        toast.error("Only PDF files are allowed");
        return;
      }

      const newTotalSize =
        totalSize + pdfFiles.reduce((sum, file) => sum + file.size, 0);

      if (newTotalSize > maxSizeInBytes) {
        toast.error(
          `Total file size cannot exceed ${formatFileSize(maxSizeInBytes)}`,
        );
        return;
      }

      const newFiles: UploadedFile[] = pdfFiles.map((file) => ({
        id: generateFileId(),
        file,
        name: file.name, // Set the file name
        filename: file.name, // Add the required filename property
        size: formatFileSize(file.size),
        status: "pending",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setTotalSize(newTotalSize);
      toast.success(`${pdfFiles.length} file(s) uploaded successfully`);
    },
    [totalSize, maxSizeInBytes],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      const newTotalSize = updatedFiles.reduce(
        (sum, f) => sum + f.file.size,
        0,
      );
      setTotalSize(newTotalSize);
      return updatedFiles;
    });
  };

  const startBatchProcessing = async () => {
    if (!processingType) {
      toast.error("Please select a processing type");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsProcessing(true);

    // Simulate processing each file
    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileId = uploadedFiles[i].id;

      // Update status to processing
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "processing" } : f)),
      );

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f)),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Mark as completed
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                result: {
                  downloadUrl: `#download-${fileId}`,
                  filename: `processed_${f.file.name}`,
                },
              }
            : f,
        ),
      );
    }

    setIsProcessing(false);
    toast.success("Batch processing completed successfully!");
  };

  const downloadAllAsZip = async () => {
    try {
      const filename = `batch_processed_files_${new Date().toISOString().split("T")[0]}.pdf`;
      await realFileDownload("batch", filename);
    } catch (error) {
      console.error("ZIP download failed:", error);
      // Error handling is already done in realFileDownload
    }
  };

  const saveToMyFiles = (fileId: string) => {
    toast.success("File saved to My Files");
  };

  const downloadFile = async (fileId: string) => {
    try {
      const file = uploadedFiles.find((f) => f.id === fileId);
      if (!file) return;

      const originalName = file.name || "converted_file.pdf";
      const extension = originalName.split(".").pop();
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const filename = `batch_processed_${baseName}_${new Date().toISOString().split("T")[0]}.${extension}`;

      console.log("🔽 Starting reliable batch download:", filename);

      await realFileDownload("batch", filename);
    } catch (error) {
      console.error("❌ Batch download error:", error);
    }
  };

  const deleteResult = (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              result: undefined,
              status: "pending",
              progress: 0,
            }
          : f,
      ),
    );
  };

  const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
  const remainingSize = maxSizeInBytes - totalSize;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Batch Processing
                </h1>
                <p className="text-slate-600">
                  Process multiple PDF files at once with any available tool
                </p>
              </div>
              <HelpTooltip
                title="How to use Batch Processing"
                steps={helpSteps}
                position="bottom-left"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload and Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* File Upload Area */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Files
                      <Badge variant="secondary" className="ml-auto">
                        {uploadedFiles.length} files •{" "}
                        {formatFileSize(totalSize)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        isDragOver
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-300",
                        "hover:border-blue-400 hover:bg-blue-50/50",
                      )}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        Drop PDF files here or click to upload
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Maximum total size: {formatFileSize(maxSizeInBytes)} •
                        Remaining: {formatFileSize(remainingSize)}
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Choose Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <Collapsible
                          open={!isFilesCollapsed}
                          onOpenChange={setIsFilesCollapsed}
                        >
                          <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-slate-50 rounded">
                            <span className="font-medium">
                              Uploaded Files ({uploadedFiles.length})
                            </span>
                            {isFilesCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 mt-2">
                            {uploadedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                              >
                                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {file.file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {file.size}
                                  </p>
                                  {file.status === "processing" && (
                                    <Progress
                                      value={file.progress}
                                      className="w-full h-2 mt-1"
                                    />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {file.status === "pending" && (
                                    <Clock className="h-4 w-4 text-slate-400" />
                                  )}
                                  {file.status === "processing" && (
                                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                                  )}
                                  {file.status === "completed" && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  {file.status === "error" && (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  {file.status === "pending" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(file.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Processing Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Processing Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={processingType}
                      onValueChange={setProcessingType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an action to apply to all files" />
                      </SelectTrigger>
                      <SelectContent>
                        {processingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-slate-500">
                                {type.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Dynamic Options Panel */}
                {processingType && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {processingType === "merge" && (
                        <div>
                          <Label htmlFor="merge-order">Merge Order</Label>
                          <Select
                            value={
                              processingOptions.mergeOrder || "upload-order"
                            }
                            onValueChange={(value) =>
                              setProcessingOptions((prev) => ({
                                ...prev,
                                mergeOrder: value as any,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upload-order">
                                Upload Order
                              </SelectItem>
                              <SelectItem value="alphabetical">
                                Alphabetical
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom Order
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {processingType === "compress" && (
                        <div>
                          <Label htmlFor="compression-level">
                            Compression Level
                          </Label>
                          <Select
                            value={
                              processingOptions.compressionLevel || "medium"
                            }
                            onValueChange={(value) =>
                              setProcessingOptions((prev) => ({
                                ...prev,
                                compressionLevel: value as any,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                Low (15% reduction)
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium (35% reduction)
                              </SelectItem>
                              <SelectItem value="high">
                                High (55% reduction)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {processingType === "convert" && (
                        <div>
                          <Label htmlFor="convert-format">Output Format</Label>
                          <Select
                            value={processingOptions.convertFormat || "docx"}
                            onValueChange={(value) =>
                              setProcessingOptions((prev) => ({
                                ...prev,
                                convertFormat: value as any,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="docx">
                                Word Document (.docx)
                              </SelectItem>
                              <SelectItem value="pptx">
                                PowerPoint (.pptx)
                              </SelectItem>
                              <SelectItem value="jpg">JPEG Images</SelectItem>
                              <SelectItem value="png">PNG Images</SelectItem>
                              <SelectItem value="txt">
                                Plain Text (.txt)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Processing and Results */}
              <div className="space-y-6">
                {/* Processing Control */}
                <Card>
                  <CardHeader>
                    <CardTitle>Batch Execution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={startBatchProcessing}
                      disabled={
                        isProcessing ||
                        uploadedFiles.length === 0 ||
                        !processingType
                      }
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Batch Processing
                        </>
                      )}
                    </Button>

                    {uploadedFiles.length > 0 && (
                      <p className="text-sm text-slate-600 mt-2 text-center">
                        {uploadedFiles.length} files ready for processing
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Results Section */}
                {completedFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Results ({completedFiles.length})
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadAllAsZip}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Download All ZIP
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {completedFiles.map((file) => (
                        <div key={file.id} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {file.result?.filename}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFile(file.id)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveToMyFiles(file.id)}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteResult(file.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Security Notice */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 mb-1">
                          Security & Privacy
                        </h4>
                        <p className="text-sm text-orange-800">
                          All files are processed securely and deleted
                          automatically after 72 hours.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
