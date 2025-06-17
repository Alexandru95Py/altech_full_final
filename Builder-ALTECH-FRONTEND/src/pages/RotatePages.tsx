import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Eye,
  Info,
  RefreshCw,
} from "lucide-react";
import { HelpTooltip, toolHelpContent } from "@/components/ui/help-tooltip";

interface PDFPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string;
  rotation: number; // 0, 90, 180, 270 degrees
}

type RotationAngle = "90cw" | "90ccw" | "180";

// Mock data for My Files
const mockMyFiles = [
  {
    id: "1",
    name: "Presentation_Slides.pdf",
    size: "4.2 MB",
    pages: 24,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Document_Scans.pdf",
    size: "18.5 MB",
    pages: 12,
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Report_Draft.pdf",
    size: "7.8 MB",
    pages: 35,
    uploadDate: "2024-01-12",
  },
];

export default function RotatePages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [pageRanges, setPageRanges] = useState("");
  const [rotationAngle, setRotationAngle] = useState<RotationAngle>("90cw");
  const [outputOption, setOutputOption] = useState<"download" | "save">(
    "download",
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Generate mock page thumbnails
  const generateMockPages = (pageCount: number): PDFPage[] => {
    return Array.from({ length: pageCount }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      selected: false,
      thumbnail: generateRealisticPDFContent(index + 1, pageCount),
      rotation: 0,
    }));
  };

  // Generate realistic PDF content for thumbnails
  const generateRealisticPDFContent = (
    pageNumber: number,
    totalPages: number,
  ): string => {
    const contentTypes = [
      // Document page with text
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="40" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">Page ${pageNumber}</text>
        <rect x="30" y="60" width="150" height="2" fill="#666"/>
        ${Array.from(
          { length: 12 },
          (_, i) =>
            `<rect x="30" y="${80 + i * 15}" width="${100 + Math.random() * 80}" height="2" fill="#888"/>`,
        ).join("")}
        <rect x="30" y="250" width="80" height="30" fill="#f0f0f0" stroke="#ddd"/>
        <text x="70" y="270" text-anchor="middle" font-size="8" fill="#666">Image</text>
        <text x="105" y="285" text-anchor="middle" font-size="8" fill="#999">${pageNumber} / ${totalPages}</text>
      </svg>`,

      // Landscape-oriented content
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Chart Page ${pageNumber}</text>
        <rect x="40" y="50" width="130" height="100" fill="#f8f8f8" stroke="#ddd"/>
        ${Array.from(
          { length: 5 },
          (_, i) =>
            `<rect x="${60 + i * 20}" y="${130 - Math.random() * 40}" width="12" height="${20 + Math.random() * 40}" fill="#${["3b82f6", "10b981", "f59e0b", "ef4444", "8b5cf6"][i]}"/>`,
        ).join("")}
        <text x="105" y="170" text-anchor="middle" font-size="10" fill="#666">Data Visualization</text>
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
      </svg>`,

      // Portrait document
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <rect x="30" y="30" width="150" height="40" fill="#f0f8ff" stroke="#ddd"/>
        <text x="105" y="50" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Header ${pageNumber}</text>
        ${Array.from(
          { length: 20 },
          (_, i) =>
            `<rect x="30" y="${80 + i * 8}" width="${120 + Math.random() * 50}" height="1.5" fill="#777"/>`,
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Document Page ${pageNumber}</text>
      </svg>`,
    ];

    const contentIndex = pageNumber % contentTypes.length;
    return `data:image/svg+xml;base64,${btoa(contentTypes[contentIndex])}`;
  };

  // Parse page ranges (e.g., "1,3-5,8" -> [1,3,4,5,8])
  const parsePageRanges = (ranges: string): number[] => {
    const pages: number[] = [];
    const parts = ranges
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((s) => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pdfPages.length && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (
          !isNaN(pageNum) &&
          pageNum >= 1 &&
          pageNum <= pdfPages.length &&
          !pages.includes(pageNum)
        ) {
          pages.push(pageNum);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  // Validate page ranges
  const validatePageRanges = (
    ranges: string,
  ): { valid: boolean; message: string } => {
    if (!ranges.trim()) {
      return { valid: false, message: "Please specify pages to rotate" };
    }

    try {
      const pages = parsePageRanges(ranges);
      if (pages.length === 0) {
        return {
          valid: false,
          message: "No valid pages found in the specified range",
        };
      }
      return {
        valid: true,
        message: `${pages.length} page(s) will be rotated`,
      };
    } catch (error) {
      return { valid: false, message: "Invalid page range format" };
    }
  };

  // Get rotation degrees from angle selection
  const getRotationDegrees = (angle: RotationAngle): number => {
    switch (angle) {
      case "90cw":
        return 90;
      case "90ccw":
        return -90;
      case "180":
        return 180;
      default:
        return 0;
    }
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

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload and page generation
    setTimeout(() => {
      setUploadedFile(file);
      const mockPageCount = Math.floor(Math.random() * 15) + 8; // 8-23 pages
      const pages = generateMockPages(mockPageCount);
      setPdfPages(pages);
      setIsUploading(false);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} loaded with ${mockPageCount} pages`,
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
    const pages = generateMockPages(file.pages);
    setPdfPages(pages);
    setShowMyFilesModal(false);

    toast({
      title: "File selected",
      description: `${file.name} loaded with ${file.pages} pages`,
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

  // Apply rotation preview
  const previewRotation = () => {
    if (!validatePageRanges(pageRanges).valid) return;

    const pagesToRotate = parsePageRanges(pageRanges);
    const rotationDegrees = getRotationDegrees(rotationAngle);

    setPdfPages((prevPages) =>
      prevPages.map((page) =>
        pagesToRotate.includes(page.pageNumber)
          ? { ...page, rotation: (page.rotation + rotationDegrees) % 360 }
          : page,
      ),
    );

    toast({
      title: "Rotation previewed",
      description: `Applied ${rotationAngle} rotation to ${pagesToRotate.length} page(s)`,
    });
  };

  // Reset all rotations
  const resetRotations = () => {
    setPdfPages((prevPages) =>
      prevPages.map((page) => ({ ...page, rotation: 0 })),
    );
    toast({
      title: "Rotations reset",
      description: "All pages restored to original orientation",
    });
  };

  // Handle rotation confirmation
  const handleRotate = async () => {
    const validation = validatePageRanges(pageRanges);
    if (!validation.valid) {
      toast({
        title: "Invalid page selection",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);

      const pages = parsePageRanges(pageRanges);
      toast({
        title: "Pages rotated successfully!",
        description: `${pages.length} page(s) rotated and ready for ${outputOption === "download" ? "download" : "saving"}`,
      });
    }, 3000);
  };

  // Handle download/save
  const handleDownload = async () => {
    if (!uploadedFile) return;

    setIsDownloading(true);
    try {
      const filename = `rotated_${uploadedFile.name.replace(".pdf", "")}_${new Date().toISOString().split("T")[0]}.pdf`;
      await realFileDownload("rotate", filename);
    } catch (error) {
      console.error("❌ Rotate download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToMyFiles = () => {
    toast({
      title: "Saved to My Files",
      description: "Your rotated PDF has been saved to My Files",
    });
  };

  // Remove uploaded file and start over
  const removeFile = () => {
    setUploadedFile(null);
    setPdfPages([]);
    setPageRanges("");
    setIsProcessed(false);
    toast({
      title: "File removed",
      description: "You can now upload a new PDF file",
    });
  };

  // Copy example to input
  const copyExample = (example: string) => {
    setPageRanges(example);
    toast({
      title: "Example copied",
      description: `Page range "${example}" has been set`,
    });
  };

  const validation = validatePageRanges(pageRanges);

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
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Rotate Pages
                  </h1>
                  <p className="text-slate-600">
                    Rotate specific pages in your PDF to correct orientation.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.rotate} />
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
                          Uploading and analyzing PDF pages...
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
                            Maximum file size: 50MB • PDF format only
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
                        Loaded Document
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
                          {pdfPages.length} pages •{" "}
                          {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Page Selection and Rotation Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-emerald-600" />
                      Rotation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Page Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="pageRanges">
                        Pages to Rotate (e.g., 1, 3-5, 8)
                      </Label>
                      <Input
                        id="pageRanges"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="1, 3-5, 8"
                        className={cn(
                          pageRanges && !validation.valid
                            ? "border-red-500"
                            : "",
                          pageRanges && validation.valid
                            ? "border-green-500"
                            : "",
                        )}
                      />
                      {pageRanges && (
                        <div
                          className={cn(
                            "text-sm flex items-center gap-2",
                            validation.valid
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          <Info className="h-4 w-4" />
                          {validation.message}
                        </div>
                      )}
                    </div>

                    {/* Quick Examples */}
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">
                        Quick Examples:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExample("1")}
                          className="text-xs"
                        >
                          First page
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExample(`${pdfPages.length}`)}
                          className="text-xs"
                        >
                          Last page
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExample("1-3")}
                          className="text-xs"
                        >
                          Pages 1-3
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExample(`1-${pdfPages.length}`)}
                          className="text-xs"
                        >
                          All pages
                        </Button>
                      </div>
                    </div>

                    {/* Rotation Angle Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Rotation Angle
                      </Label>
                      <RadioGroup
                        value={rotationAngle}
                        onValueChange={(value: RotationAngle) =>
                          setRotationAngle(value)
                        }
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <RadioGroupItem value="90cw" id="90cw" />
                          <div className="flex items-center gap-2 flex-1">
                            <RotateCw className="h-5 w-5 text-blue-600" />
                            <div>
                              <Label
                                htmlFor="90cw"
                                className="font-medium cursor-pointer"
                              >
                                90° Clockwise
                              </Label>
                              <p className="text-sm text-slate-500">
                                Rotate right
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <RadioGroupItem value="90ccw" id="90ccw" />
                          <div className="flex items-center gap-2 flex-1">
                            <RotateCcw className="h-5 w-5 text-purple-600" />
                            <div>
                              <Label
                                htmlFor="90ccw"
                                className="font-medium cursor-pointer"
                              >
                                90° Counter-clockwise
                              </Label>
                              <p className="text-sm text-slate-500">
                                Rotate left
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                          <RadioGroupItem value="180" id="180" />
                          <div className="flex items-center gap-2 flex-1">
                            <FlipHorizontal className="h-5 w-5 text-orange-600" />
                            <div>
                              <Label
                                htmlFor="180"
                                className="font-medium cursor-pointer"
                              >
                                180°
                              </Label>
                              <p className="text-sm text-slate-500">
                                Flip upside down
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Preview Controls */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        onClick={previewRotation}
                        disabled={!validation.valid}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview Rotation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetRotations}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset All
                      </Button>
                    </div>

                    {/* Output Options */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
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
                            Download to device
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

                {/* Page Preview */}
                {showPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-indigo-600" />
                        Page Preview with Rotation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                        {pdfPages.map((page) => {
                          const isSelected = pageRanges
                            ? parsePageRanges(pageRanges).includes(
                                page.pageNumber,
                              )
                            : false;
                          return (
                            <div
                              key={page.id}
                              className={cn(
                                "border-2 rounded-lg p-2 transition-all",
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200",
                              )}
                            >
                              <div className="relative">
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-20 object-cover bg-white border border-slate-200 rounded transition-transform duration-300"
                                  style={{
                                    transform: `rotate(${page.rotation}deg)`,
                                    transformOrigin: "center",
                                  }}
                                />
                                {page.rotation !== 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="absolute -top-1 -right-1 text-xs bg-emerald-600 text-white"
                                  >
                                    {page.rotation}°
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-center mt-1 font-medium">
                                Page {page.pageNumber}
                              </p>
                              {isSelected && (
                                <Badge
                                  variant="default"
                                  className="mt-1 w-full justify-center text-xs"
                                >
                                  Will rotate
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processing */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Rotating Pages...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we apply rotation to your selected
                          pages
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Button */}
                {!isProcessing && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleRotate}
                      disabled={!validation.valid}
                      className="px-8 py-4 text-lg font-medium bg-emerald-600 hover:bg-emerald-700"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Apply Rotation
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
                    Pages Rotated Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your pages have been rotated and are ready for{" "}
                    {outputOption === "download"
                      ? "download"
                      : "saving to My Files"}
                    .
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    {outputOption === "download" ? (
                      <Button
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Rotated PDF
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
                    Rotate Another PDF
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
              Select a PDF file from your saved documents to rotate pages
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
