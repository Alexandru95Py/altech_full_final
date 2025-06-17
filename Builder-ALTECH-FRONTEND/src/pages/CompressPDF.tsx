import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { HelpTooltip, toolHelpContent } from "@/components/ui/help-tooltip";
import { realFileDownload } from "@/utils/realFileDownload";
import {
  Upload,
  FolderOpen,
  FileText,
  X,
  CheckCircle,
  ArrowLeft,
  Download,
  Save,
  Settings,
  Files,
  Zap,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Gauge,
  Image,
  Info,
} from "lucide-react";

interface CompressionSettings {
  level: "low" | "medium" | "high";
  retainImageQuality: boolean;
  removeMetadata: boolean;
  replaceOriginal: boolean;
}

interface FileInfo {
  originalSize: number;
  estimatedCompressedSize: number;
  estimatedReduction: number;
}

// Mock data for My Files
const mockMyFiles = [
  {
    id: "1",
    name: "Annual_Report_2024.pdf",
    size: "12.5 MB",
    pages: 45,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Product_Catalog.pdf",
    size: "8.2 MB",
    pages: 28,
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Training_Manual.pdf",
    size: "15.7 MB",
    pages: 67,
    uploadDate: "2024-01-12",
  },
];

export default function CompressPDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const [compressionSettings, setCompressionSettings] =
    useState<CompressionSettings>({
      level: "medium",
      retainImageQuality: true,
      removeMetadata: false,
      replaceOriginal: false,
    });

  const [fileInfo, setFileInfo] = useState<FileInfo>({
    originalSize: 0,
    estimatedCompressedSize: 0,
    estimatedReduction: 0,
  });

  // Calculate estimated compression based on settings
  const calculateEstimatedCompression = (
    originalSize: number,
    level: "low" | "medium" | "high",
  ) => {
    let reductionFactor = 0.3; // 30% default for medium

    switch (level) {
      case "low":
        reductionFactor = 0.15; // 15% reduction
        break;
      case "medium":
        reductionFactor = 0.35; // 35% reduction
        break;
      case "high":
        reductionFactor = 0.55; // 55% reduction
        break;
    }

    const compressedSize = originalSize * (1 - reductionFactor);
    const reduction = reductionFactor * 100;

    return {
      estimatedCompressedSize: compressedSize,
      estimatedReduction: reduction,
    };
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 25MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload processing
    setTimeout(() => {
      setUploadedFile(file);

      // Calculate file info
      const estimates = calculateEstimatedCompression(
        file.size,
        compressionSettings.level,
      );
      setFileInfo({
        originalSize: file.size,
        ...estimates,
      });

      setIsUploading(false);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) is ready for compression`,
      });
    }, 2000);
  };

  // Handle compression level change
  const handleCompressionLevelChange = (level: "low" | "medium" | "high") => {
    setCompressionSettings({ ...compressionSettings, level });

    if (uploadedFile) {
      const estimates = calculateEstimatedCompression(uploadedFile.size, level);
      setFileInfo({
        originalSize: uploadedFile.size,
        ...estimates,
      });
    }
  };

  // Handle My Files selection
  const handleMyFileSelect = (file: (typeof mockMyFiles)[0]) => {
    const mockFile = new File([], file.name, { type: "application/pdf" });
    Object.defineProperty(mockFile, "size", {
      value: parseFloat(file.size.replace(/[^\d.]/g, "")) * 1024 * 1024,
    });

    setUploadedFile(mockFile);

    const estimates = calculateEstimatedCompression(
      mockFile.size,
      compressionSettings.level,
    );
    setFileInfo({
      originalSize: mockFile.size,
      ...estimates,
    });

    setShowMyFilesModal(false);

    toast({
      title: "File selected",
      description: `${file.name} loaded for compression`,
    });
  };

  // Handle drag and drop
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
    handleFileUpload(e.dataTransfer.files);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle compression
  const handleCompress = async () => {
  if (!uploadedFile) {
    toast({
      title: "No File",
      description: "Please upload a file first.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    const formData = new FormData();
    formData.append("file", uploadedFile);  // 🔧 PDF
    formData.append("compression_level", compressionSettings.level);  // 🔧 low | medium | high

    const token = localStorage.getItem("authToken");

    const response = await fetch("http://localhost:8000/basic/compress/api/compress/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Compression failed");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_file.pdf";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "File compressed and downloaded successfully.",
    });
  } catch (error) {
    console.error("❌ Compression failed:", error);
    toast({
      title: "Error",
      description: "Failed to compress the file.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};


  // Handle download
  const handleDownload = async () => {
  if (!uploadedFile) {
    toast({
      title: "No File",
      description: "Please upload a file first.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);
  setProcessingProgress(0);

  try {
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("compression_level", compressionSettings.level);

    const token = localStorage.getItem("authToken");
    const response = await fetch("http://localhost:8000/basic/compress/api/compress/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Compression failed");
    }

    const data = await response.json();

    // Descărcare reală a fișierului PDF din `file` primit
    const downloadResponse = await fetch(data.file, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await downloadResponse.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed_${uploadedFile.name}`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "PDF compressed and downloaded.",
    });
  } catch (error) {
    console.error("❌ Compression failed:", error);
    toast({
      title: "Compression Failed",
      description: "Something went wrong during compression.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
    setProcessingProgress(100);
  }
};

  // Handle save to My Files
  const handleSaveToMyFiles = () => {
    toast({
      title: "Saved to My Files",
      description: "Your compressed PDF has been saved to My Files",
    });
  };

  // Remove uploaded file and start over
  const removeFile = () => {
    setUploadedFile(null);
    setIsProcessed(false);
    setFileInfo({
      originalSize: 0,
      estimatedCompressedSize: 0,
      estimatedReduction: 0,
    });
    toast({
      title: "File removed",
      description: "You can now upload a new PDF file",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="pl-60 pt-16 pb-20">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/tools")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Compress PDF
                  </h1>
                  <p className="text-slate-600">
                    Reduce the size of your PDF files while maintaining quality.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.compress} />
            </div>
          </div>

          <div className="max-w-6xl space-y-8">
            {!uploadedFile ? (
              /* Upload Section */
              <Card className="border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload PDF File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "relative rounded-lg transition-all duration-200 p-8",
                      isDragOver
                        ? "bg-blue-50 border-2 border-blue-300"
                        : "bg-slate-50 border-2 border-dashed border-slate-200",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-600">
                          Uploading and analyzing PDF file...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload from Device
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setShowMyFilesModal(true)}
                            className="flex items-center gap-2"
                          >
                            <FolderOpen className="h-4 w-4" />
                            Choose from My Files
                          </Button>
                        </div>

                        <div className="text-sm text-slate-500">
                          <p>
                            Drag and drop your PDF file here, or click to browse
                          </p>
                          <p className="mt-1">
                            Maximum file size: 25MB • PDF format only
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : !isProcessed ? (
              <>
                {/* File Info and Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        File Information
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Original Size */}
                      <div className="text-center p-4 border border-slate-200 rounded-lg">
                        <HardDrive className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-1">
                          Original Size
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatFileSize(fileInfo.originalSize)}
                        </p>
                      </div>

                      {/* Estimated Compressed Size */}
                      <div className="text-center p-4 border border-green-200 bg-green-50 rounded-lg">
                        <Gauge className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-600 mb-1">
                          Estimated Compressed
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatFileSize(fileInfo.estimatedCompressedSize)}
                        </p>
                      </div>

                      {/* Reduction Percentage */}
                      <div className="text-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-blue-600 mb-1">
                          Size Reduction
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {fileInfo.estimatedReduction.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <strong>{uploadedFile.name}</strong>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Compression Settings */}
                <Card>
                  <Collapsible
                    open={showAdvancedSettings}
                    onOpenChange={setShowAdvancedSettings}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-600" />
                            Compression Settings
                          </div>
                          {showAdvancedSettings ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        {/* Compression Level */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">
                            Compression Level
                          </Label>
                          <RadioGroup
                            value={compressionSettings.level}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              handleCompressionLevelChange(value)
                            }
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <RadioGroupItem value="low" id="low" />
                              <div className="flex-1">
                                <Label
                                  htmlFor="low"
                                  className="font-medium cursor-pointer"
                                >
                                  Low Compression
                                </Label>
                                <p className="text-sm text-slate-500">
                                  Faster processing, minimal size reduction
                                  (~15%)
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Fast
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <RadioGroupItem value="medium" id="medium" />
                              <div className="flex-1">
                                <Label
                                  htmlFor="medium"
                                  className="font-medium cursor-pointer"
                                >
                                  Medium Compression
                                </Label>
                                <p className="text-sm text-slate-500">
                                  Balanced quality and size reduction (~35%)
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-200"
                              >
                                Recommended
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <RadioGroupItem value="high" id="high" />
                              <div className="flex-1">
                                <Label
                                  htmlFor="high"
                                  className="font-medium cursor-pointer"
                                >
                                  High Compression
                                </Label>
                                <p className="text-sm text-slate-500">
                                  Maximum size reduction, may affect quality
                                  (~55%)
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-200"
                              >
                                Max Size
                              </Badge>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Additional Options */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="retain-images"
                              checked={compressionSettings.retainImageQuality}
                              onCheckedChange={(checked) =>
                                setCompressionSettings({
                                  ...compressionSettings,
                                  retainImageQuality: checked as boolean,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4 text-slate-500" />
                              <Label
                                htmlFor="retain-images"
                                className="text-sm cursor-pointer"
                              >
                                Retain image quality (slower compression)
                              </Label>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remove-metadata"
                              checked={compressionSettings.removeMetadata}
                              onCheckedChange={(checked) =>
                                setCompressionSettings({
                                  ...compressionSettings,
                                  removeMetadata: checked as boolean,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-slate-500" />
                              <Label
                                htmlFor="remove-metadata"
                                className="text-sm cursor-pointer"
                              >
                                Remove metadata (for privacy)
                              </Label>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="replace-original"
                              checked={compressionSettings.replaceOriginal}
                              onCheckedChange={(checked) =>
                                setCompressionSettings({
                                  ...compressionSettings,
                                  replaceOriginal: checked as boolean,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-slate-500" />
                              <Label
                                htmlFor="replace-original"
                                className="text-sm cursor-pointer"
                              >
                                Replace original file in My Files
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Processing Section */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Compressing PDF...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we compress your PDF file
                        </p>
                        <div className="max-w-md mx-auto">
                          <Progress
                            value={processingProgress}
                            className="h-2"
                          />
                          <p className="text-sm text-slate-500 mt-2">
                            {processingProgress.toFixed(0)}% complete
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Button */}
                {!isProcessing && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleCompress}
                      className="px-8 py-4 text-lg font-medium bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Compress Now
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Success Screen */
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    PDF Compressed Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your PDF has been compressed by{" "}
                    {fileInfo.estimatedReduction.toFixed(0)}%. New file size:{" "}
                    {formatFileSize(fileInfo.estimatedCompressedSize)}
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    <Button
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Compressed PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSaveToMyFiles}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save to My Files
                    </Button>
                  </div>

                  <Button variant="ghost" onClick={removeFile}>
                    Compress Another PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* My Files Modal */}
      <Dialog open={showMyFilesModal} onOpenChange={setShowMyFilesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Files className="h-5 w-5" />
              Choose from My Files
            </DialogTitle>
            <DialogDescription>
              Select a PDF file from your saved documents to compress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockMyFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => handleMyFileSelect(file)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div>
                    <h3 className="font-medium text-slate-900">{file.name}</h3>
                    <p className="text-sm text-slate-500">
                      {file.size} • {file.pages} pages
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Select</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
