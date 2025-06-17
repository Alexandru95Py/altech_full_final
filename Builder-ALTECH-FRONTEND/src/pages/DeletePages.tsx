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
  Eye,
  Info,
  Trash2,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { HelpTooltip, toolHelpContent } from "@/components/ui/help-tooltip";

interface PDFPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string;
  markedForDeletion: boolean;
}

// Mock data for My Files
type MockMyFile = {
  id: string;
  name: string;
  size: string;
  pages: number;
  uploadDate: string;
};

const mockMyFiles: MockMyFile[] = [
  {
    id: "1",
    name: "Draft_Document.pdf",
    size: "5.4 MB",
    pages: 28,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Meeting_Notes.pdf",
    size: "2.8 MB",
    pages: 12,
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Report_With_Errors.pdf",
    size: "9.2 MB",
    pages: 35,
    uploadDate: "2024-01-12",
  },
];

export default function DeletePages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [pageRanges, setPageRanges] = useState("");
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Generate mock page thumbnails
  const generateMockPages = (pageCount: number): PDFPage[] => {
    return Array.from({ length: pageCount }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      selected: false,
      thumbnail: generateRealisticPDFContent(index + 1, pageCount),
      markedForDeletion: false,
    }));
  };

  // Generate realistic PDF content for thumbnails
  const generateRealisticPDFContent = (
    pageNumber: number,
    totalPages: number,
  ): string => {
    const contentTypes = [
      // Regular document page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="40" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">Page ${pageNumber}</text>
        <rect x="30" y="60" width="150" height="2" fill="#666"/>
        ${Array.from(
          { length: 18 },
          (_, i) =>
            `<rect x="30" y="${80 + i * 10}" width="${100 + Math.random() * 80}" height="1.5" fill="#888"/>`,
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber} of ${totalPages}</text>
      </svg>`,

      // Image-heavy page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Page ${pageNumber}</text>
        <rect x="40" y="50" width="130" height="80" fill="#f0f0f0" stroke="#ddd"/>
        <text x="105" y="95" text-anchor="middle" font-size="10" fill="#666">Image Content</text>
        ${Array.from(
          { length: 8 },
          (_, i) =>
            `<rect x="30" y="${150 + i * 12}" width="${120 + Math.random() * 60}" height="2" fill="#777"/>`,
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
      </svg>`,

      // Table/data page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Data - Page ${pageNumber}</text>
        ${Array.from({ length: 6 }, (_, row) =>
          Array.from(
            { length: 3 },
            (_, col) =>
              `<rect x="${40 + col * 40}" y="${60 + row * 25}" width="35" height="20" fill="#f8f8f8" stroke="#ddd"/>`,
          ).join(""),
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
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
  ): { valid: boolean; message: string; error?: string } => {
    if (!ranges.trim()) {
      return {
        valid: false,
        message: "Please specify pages to delete",
        error: "Empty input field",
      };
    }

    if (!uploadedFile) {
      return {
        valid: false,
        message: "Please upload a PDF file first",
        error: "No PDF uploaded",
      };
    }

    try {
      const pages = parsePageRanges(ranges);
      if (pages.length === 0) {
        return {
          valid: false,
          message: "No valid pages found in the specified range",
          error: "Invalid page input",
        };
      }

      // Check for out-of-range pages
      const outOfRange = pages.filter((p) => p > pdfPages.length);
      if (outOfRange.length > 0) {
        return {
          valid: false,
          message: `Page(s) ${outOfRange.join(", ")} are out of range (max: ${pdfPages.length})`,
          error: "Invalid page input - out of range",
        };
      }

      // Check if all pages would be deleted
      if (pages.length >= pdfPages.length) {
        return {
          valid: false,
          message: "Cannot delete all pages. At least one page must remain",
          error: "Cannot delete all pages",
        };
      }

      return {
        valid: true,
        message: `${pages.length} page(s) will be deleted, ${pdfPages.length - pages.length} will remain`,
      };
    } catch (error) {
      return {
        valid: false,
        message: "Invalid page range format",
        error: "Invalid page input",
      };
    }
  };

  // Added validateFile function for file validation
  const validateFile = (file: File): { valid: boolean; error: string | null } => {
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.type !== "application/pdf") {
      return { valid: false, error: "Please upload a PDF file only." };
    }
    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 50MB." };
    }
    return { valid: true, error: null };
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
      const mockPageCount = Math.floor(Math.random() * 20) + 10; // 10-30 pages
      const pages = generateMockPages(mockPageCount);
      setPdfPages(pages);
      setIsUploading(false);
    }, 2000);
  };

  // Handle My Files selection
  const handleMyFileSelect = async (file: MockMyFile) => {
    toast({
      title: "Feature Disabled",
      description: "Please upload a real file instead of selecting from mock files.",
      variant: "destructive",
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

  // Mark pages for deletion preview
  const previewDeletion = () => {
    const validation = validatePageRanges(pageRanges);
    if (!validation.valid) {
      toast({
        title: "Invalid page selection",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    const pagesToDelete = parsePageRanges(pageRanges);

    setPdfPages((prevPages) =>
      prevPages.map((page) => ({
        ...page,
        markedForDeletion: pagesToDelete.includes(page.pageNumber),
      })),
    );

    toast({
      title: "Deletion preview updated",
      description: `${pagesToDelete.length} page(s) marked for deletion`,
    });
  };

  // Clear deletion preview
  const clearPreview = () => {
    setPdfPages((prevPages) =>
      prevPages.map((page) => ({ ...page, markedForDeletion: false })),
    );
    toast({
      title: "Preview cleared",
      description: "All deletion markers removed",
    });
  };

  // Handle deletion confirmation dialog
  const handleDeleteConfirm = () => {
    const validation = validatePageRanges(pageRanges);
    if (!validation.valid) {
      toast({
        title: "Invalid page selection",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);

      const pages = parsePageRanges(pageRanges);
      const remaining = pdfPages.length - pages.length;

      toast({
        title: "Pages deleted successfully!",
        description: `${pages.length} page(s) removed. ${remaining} page(s) remain in the document.`,
      });
    }, 3000);
  };

  const handleDownload = async () => {
    const pagesToDelete = parsePageRanges(pageRanges).filter((p) => !isNaN(p) && p >= 1);

    if (!uploadedFile || pagesToDelete.length === 0) {
      toast({
        title: "Invalid Pages",
        description: "Please specify valid pages (only integers ≥ 1) before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      pagesToDelete.forEach((page) => {
        formData.append("pages_to_delete", page.toString());
      });

      console.log("DEBUG – FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("http://localhost:8000/basic/delete/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Backend error response:", errorData);
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = uploadedFile.name.replace(".pdf", "_deleted.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your modified PDF is being downloaded.",
      });
    } catch (error) {
      console.error("❌ Delete pages download error:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToMyFiles = () => {
    if (!toast) {
      console.error("Toast function is not defined.");
      return;
    }
    toast({
      title: "Saved to My Files",
      description: "Your modified PDF has been saved to My Files",
    });
  };

  // Remove uploaded file and start over
  const removeFile = () => {
    if (!setUploadedFile || !setPdfPages || !setPageRanges || !setIsProcessed || !toast) {
      console.error("One or more state functions are not defined.");
      return;
    }
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
    if (!setPageRanges || !toast) {
      console.error("One or more state functions are not defined.");
      return;
    }
    setPageRanges(example);
    toast({
      title: "Example copied",
      description: `Page range \"${example}\" has been set`,
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
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Delete Pages
                  </h1>
                  <p className="text-slate-600">
                    Remove specific pages from your PDF document permanently.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.delete} />
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

                {/* Page Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-red-600" />
                      Select Pages to Delete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageRanges">
                        Page Numbers to Delete (e.g., 2, 4-6, 9)
                      </Label>
                      <Input
                        id="pageRanges"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="2, 4-6, 9"
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
                          {validation.valid ? (
                            <Info className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
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
                          onClick={() => copyExample("2, 5, 8")}
                          className="text-xs"
                        >
                          Specific pages
                        </Button>
                      </div>
                    </div>

                    {/* Preview Controls */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        onClick={previewDeletion}
                        disabled={!validation.valid}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview Deletion
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearPreview}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear Preview
                      </Button>
                    </div>

                    {/* Warning Box */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium text-amber-800">
                          Important Warning
                        </h4>
                      </div>
                      <p className="text-sm text-amber-700">
                        Be careful! The deleted pages cannot be recovered unless
                        you re-upload the original file.
                      </p>
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
                            Download after processing
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="save" id="save" />
                          <Label htmlFor="save" className="cursor-pointer">
                            Save result to My Files
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
                        Page Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                        {pdfPages.map((page) => {
                          const isMarkedForDeletion = page.markedForDeletion;
                          return (
                            <div
                              key={page.id}
                              className={cn(
                                "border-2 rounded-lg p-2 transition-all relative",
                                isMarkedForDeletion
                                  ? "border-red-500 bg-red-50"
                                  : "border-slate-200",
                              )}
                            >
                              <div className="relative">
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  className={cn(
                                    "w-full h-20 object-cover bg-white border border-slate-200 rounded transition-all",
                                    isMarkedForDeletion
                                      ? "opacity-50 grayscale"
                                      : "",
                                  )}
                                />
                                {isMarkedForDeletion && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-red-600 text-white rounded-full p-1">
                                      <Trash2 className="h-3 w-3" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-center mt-1 font-medium">
                                Page {page.pageNumber}
                              </p>
                              {isMarkedForDeletion && (
                                <Badge
                                  variant="destructive"
                                  className="mt-1 w-full justify-center text-xs"
                                >
                                  Will Delete
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
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                          <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Deleting Pages...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we remove the selected pages from
                          your PDF
                        </p>
                        <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Button */}
                {!isProcessing && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleDeleteConfirm}
                      disabled={!validation.valid}
                      className="px-8 py-4 text-lg font-medium bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Pages
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
                    Pages Deleted Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    The selected pages have been removed and your document is
                    ready for{" "}
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
                        Download Modified PDF
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
                    Delete Pages from Another PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirm Page Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The following pages will be
              permanently deleted from your PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-800 mb-2">Pages to delete:</p>
              <p className="text-red-700">{pageRanges}</p>
              <p className="text-sm text-red-600 mt-2">
                {parsePageRanges(pageRanges).length} page(s) will be removed,{" "}
                {pdfPages.length - parsePageRanges(pageRanges).length} will
                remain
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Confirm Deletion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Files Modal */}
      <Dialog open={showMyFilesModal} onOpenChange={setShowMyFilesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Files className="h-5 w-5" />
              Choose from My Files
            </DialogTitle>
            <DialogDescription>
              Select a PDF file from your saved documents to delete pages from
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
