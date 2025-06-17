import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { realFileDownload } from "@/utils/realFileDownload";
import { HelpTooltip, toolHelpContent } from "@/components/ui/help-tooltip";
import {
  Upload,
  FolderOpen,
  FileText,
  X,
  CheckCircle,
  ArrowLeft,
  Download,
  Save,
  Files,
  RefreshCw,
  Eye,
  Zap,
  Presentation,
  AlignLeft,
  FileImage,
} from "lucide-react";

type ConvertFormat = "docx" | "pptx" | "jpg" | "png" | "txt";

interface ConversionOption {
  format: ConvertFormat;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  useCase: string;
}

// Mock data for My Files
const mockMyFiles = [
  {
    id: "1",
    name: "Business_Report_2024.pdf",
    size: "3.2 MB",
    pages: 18,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Presentation_Slides.pdf",
    size: "8.7 MB",
    pages: 32,
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Document_Scans.pdf",
    size: "12.1 MB",
    pages: 24,
    uploadDate: "2024-01-12",
  },
];

export default function ConvertPDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ConvertFormat>("docx");
  const [outputOption, setOutputOption] = useState<"download" | "save">(
    "download",
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Conversion format options
  const conversionOptions: ConversionOption[] = [
    {
      format: "docx",
      title: "Word Document",
      description: "Best for editing text and formatting",
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      useCase: "Perfect for reports, letters, and documents you need to edit",
    },
    {
      format: "pptx",
      title: "PowerPoint",
      description: "Perfect for slides and presentations",
      icon: <Presentation className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      useCase: "Ideal for slide decks, presentations, and visual content",
    },
    {
      format: "jpg",
      title: "JPG Images",
      description: "One image per page (compressed)",
      icon: <FileImage className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      useCase: "Great for sharing pages as images or web display",
    },
    {
      format: "png",
      title: "PNG Images",
      description: "One image per page (high quality)",
      icon: <FileImage className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      useCase: "Best for high-quality images and transparency support",
    },
    {
      format: "txt",
      title: "Plain Text",
      description: "Text only, no formatting",
      icon: <AlignLeft className="h-5 w-5" />,
      color: "text-slate-600",
      bgColor: "bg-slate-50 border-slate-200",
      useCase: "Extract just the text content for analysis or processing",
    },
  ];

  // Get selected conversion option
  const selectedOption = conversionOptions.find(
    (option) => option.format === selectedFormat,
  );

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

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload processing
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for conversion`,
      });
    }, 2000);
  };

  // Handle My Files selection
  const handleMyFileSelect = (file: (typeof mockMyFiles)[0]) => {
    const mockFile = new File([], file.name, { type: "application/pdf" });
    Object.defineProperty(mockFile, "size", {
      value: parseFloat(file.size.replace(/[^\d.]/g, "")) * 1024 * 1024,
    });

    setUploadedFile(mockFile);
    setShowMyFilesModal(false);

    toast({
      title: "File selected",
      description: `${file.name} is ready for conversion`,
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

  // Handle conversion
  const handleConvert = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate conversion progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 400);

    // Simulate processing time based on format
    const processingTime =
      selectedFormat === "txt"
        ? 2000
        : selectedFormat === "docx"
          ? 4000
          : selectedFormat === "pptx"
            ? 5000
            : 6000;

    setTimeout(() => {
      clearInterval(progressInterval);
      setProcessingProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        setIsProcessed(true);

        toast({
          title: "Conversion completed!",
          description: `Your PDF has been converted to ${selectedOption?.title}`,
        });
      }, 500);
    }, processingTime);
  };

  // Handle download/save
  const handleDownload = async () => {
    if (!uploadedFile) return;

    setIsDownloading(true);
    try {
      const filename = `converted_${uploadedFile.name.replace(/\.[^/.]+$/, "")}_${new Date().toISOString().split("T")[0]}.pdf`;
      await realFileDownload("convert", filename);
    } catch (error) {
      console.error("❌ Convert download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToMyFiles = () => {
    toast({
      title: "Saved to My Files",
      description: `Your converted ${selectedOption?.title} has been saved to My Files`,
    });
  };

  // Remove uploaded file and start over
  const removeFile = () => {
    setUploadedFile(null);
    setIsProcessed(false);
    setProcessingProgress(0);
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
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Convert PDF
                  </h1>
                  <p className="text-slate-600">
                    Transform your PDF into different formats for editing,
                    presenting, or sharing.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.convert} />
            </div>
          </div>

          <div className="max-w-4xl space-y-8">
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
                          Uploading and preparing PDF for conversion...
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
                            Maximum file size: 100MB • PDF format only
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
                {/* File Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Ready for Conversion
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
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB •
                          Ready to convert
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Ready
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Format Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-indigo-600" />
                      Choose Output Format
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={selectedFormat}
                      onValueChange={(value: ConvertFormat) =>
                        setSelectedFormat(value)
                      }
                      className="space-y-3"
                    >
                      {conversionOptions.map((option) => (
                        <div
                          key={option.format}
                          className={cn(
                            "border-2 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md",
                            selectedFormat === option.format
                              ? option.bgColor
                              : "border-slate-200 hover:border-slate-300",
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem
                              value={option.format}
                              id={option.format}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg",
                                    option.bgColor,
                                  )}
                                >
                                  <div className={option.color}>
                                    {option.icon}
                                  </div>
                                </div>
                                <div>
                                  <Label
                                    htmlFor={option.format}
                                    className="text-base font-medium cursor-pointer"
                                  >
                                    {option.title}
                                  </Label>
                                  <p className="text-sm text-slate-500">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 pl-11">
                                {option.useCase}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    {/* Output Options */}
                    <div className="space-y-3 pt-6 border-t border-slate-200">
                      <Label className="text-base font-medium">
                        Output Options
                      </Label>
                      <RadioGroup
                        value={outputOption}
                        onValueChange={(value: "download" | "save") =>
                          setOutputOption(value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="download" id="download" />
                          <Label htmlFor="download" className="cursor-pointer">
                            Download after processing
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="save" id="save" />
                          <Label htmlFor="save" className="cursor-pointer">
                            Save to My Files
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Converting to {selectedOption?.title}...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we convert your PDF file
                        </p>
                        <div className="max-w-md mx-auto">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${processingProgress}%` }}
                            ></div>
                          </div>
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
                      onClick={handleConvert}
                      className="px-8 py-4 text-lg font-medium bg-indigo-600 hover:bg-indigo-700"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Convert to {selectedOption?.title}
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
                    Conversion Completed!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your PDF has been successfully converted to{" "}
                    {selectedOption?.title} and is ready for{" "}
                    {outputOption === "download" ? "download" : "saving"}.
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    {outputOption === "download" ? (
                      <Button
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download {selectedOption?.title}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSaveToMyFiles}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save to My Files
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" onClick={removeFile}>
                    Convert Another PDF
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
              Select a PDF file from your saved documents to convert
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
