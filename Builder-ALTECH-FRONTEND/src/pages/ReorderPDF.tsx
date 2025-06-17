import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { HelpTooltip, toolHelpContent } from "@/components/ui/help-tooltip";
import { realFileDownload } from "@/utils/realFileDownload";
import {
  Upload,
  FolderOpen,
  ArrowLeft,
  X,
  GripVertical,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  FileText,
  Eye,
  Download,
  Save,
  CheckCircle,
  Files,
} from "lucide-react";

interface PDFPage {
  id: string;
  pageNumber: number;
  originalIndex: number;
  content: string;
  thumbnail: string;
}

// Mock data for My Files
const mockMyFiles = [
  {
    id: "1",
    name: "Document_Draft.pdf",
    size: "4.2 MB",
    pages: 15,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Meeting_Minutes.pdf",
    size: "2.8 MB",
    pages: 8,
    uploadDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Project_Proposal.pdf",
    size: "6.1 MB",
    pages: 22,
    uploadDate: "2024-01-12",
  },
];

export default function ReorderPDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedPage, setDraggedPage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [outputOption, setOutputOption] = useState<"download" | "save">(
    "download",
  );

  // Generate realistic PDF content for thumbnails
  const generateRealisticPDFContent = (
    pageNumber: number,
    totalPages: number,
  ): string => {
    const contentTypes = [
      // Title page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <rect x="20" y="40" width="170" height="2" fill="#333"/>
        <text x="105" y="80" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">PAGE ${pageNumber}</text>
        <text x="105" y="100" text-anchor="middle" font-size="12" fill="#666">Document Content</text>
        <rect x="70" y="120" width="70" height="80" fill="#f0f0f0" stroke="#ddd"/>
        <text x="105" y="165" text-anchor="middle" font-size="8" fill="#999">Content Preview</text>
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber} of ${totalPages}</text>
      </svg>`,

      // Text content page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="20" y="30" font-size="14" font-weight="bold" fill="#333">Page ${pageNumber}</text>
        <rect x="20" y="40" width="170" height="1" fill="#ddd"/>
        ${Array.from(
          { length: 18 },
          (_, i) =>
            `<rect x="20" y="${55 + i * 12}" width="${120 + Math.random() * 50}" height="2" fill="#666"/>`,
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
      </svg>`,

      // Chart/graph page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white" stroke="#ddd"/>
        <text x="105" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Chart - Page ${pageNumber}</text>
        <rect x="40" y="50" width="130" height="100" fill="#f8f8f8" stroke="#ddd"/>
        <rect x="60" y="120" width="15" height="20" fill="#3b82f6"/>
        <rect x="80" y="110" width="15" height="30" fill="#10b981"/>
        <rect x="100" y="100" width="15" height="40" fill="#f59e0b"/>
        <rect x="120" y="130" width="15" height="10" fill="#ef4444"/>
        <text x="105" y="180" text-anchor="middle" font-size="10" fill="#666">Data Visualization</text>
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
      </svg>`,
    ];

    const contentIndex = pageNumber % contentTypes.length;
    return `data:image/svg+xml;base64,${btoa(contentTypes[contentIndex])}`;
  };

  // Generate mock pages
  const generateMockPages = (pageCount: number): PDFPage[] => {
    return Array.from({ length: pageCount }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      originalIndex: index,
      content: `Page ${index + 1} content`,
      thumbnail: generateRealisticPDFContent(index + 1, pageCount),
    }));
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

  // Handle page reordering
  const handlePageDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();

    if (!draggedPage) return;

    const draggedIndex = pdfPages.findIndex((page) => page.id === draggedPage);
    const targetIndex = pdfPages.findIndex((page) => page.id === targetPageId);

    if (draggedIndex === targetIndex) return;

    const newPages = [...pdfPages];
    const [movedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);

    // Update page numbers
    const updatedPages = newPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));

    setPdfPages(updatedPages);
    setDraggedPage(null);
  };

  // Remove page
  const removePage = (pageId: string) => {
    const updatedPages = pdfPages
      .filter((page) => page.id !== pageId)
      .map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }));

    setPdfPages(updatedPages);
    toast({
      title: "Page removed",
      description: "Page has been removed from the document",
    });
  };

  // Reset to original order
  const resetOrder = () => {
    const originalPages = [...pdfPages].sort(
      (a, b) => a.originalIndex - b.originalIndex,
    );
    const resetPages = originalPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1,
    }));
    setPdfPages(resetPages);
    toast({
      title: "Order reset",
      description: "Pages have been reset to their original order",
    });
  };

  // Apply changes
  const handleApplyChanges = () => {
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);

      toast({
        title: "Page order updated successfully!",
        description: "Your PDF has been reordered according to your changes.",
      });
    }, 3000);
  };

// Handle download/save
const handleDownload = async () => {
  if (!uploadedFile) return;

  const formData = new FormData();
  formData.append("file", uploadedFile);
  formData.append(
    "new_order",
    JSON.stringify(pdfPages.map((p) => p.pageNumber)), // pagina reală ordonată
  );

  try {
    const response = await fetch("http://localhost:8000/basic/reorder/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = uploadedFile.name.replace(".pdf", "_reordered.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your reordered PDF is being downloaded.",
    });
  } catch (error) {
    toast({
      title: "Download failed",
      description: "There was an error downloading your PDF.",
      variant: "destructive",
    });
  }
};

  const handleSaveToMyFiles = () => {
    toast({
      title: "Saved to My Files",
      description: "Your reordered PDF has been saved to My Files",
    });
  };

  // Remove uploaded file and start over
  const removeFile = () => {
    setUploadedFile(null);
    setPdfPages([]);
    setIsProcessed(false);
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
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Reorder Pages
                  </h1>
                  <p className="text-slate-600">
                    Drag and drop pages to rearrange your PDF document.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.reorder} />
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
                          Uploading and generating page previews...
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
                        Loaded Document - {pdfPages.length} pages
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetOrder}
                          className="flex items-center gap-2"
                        >
                          <RotateCw className="h-4 w-4" />
                          Reset Order
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setZoomLevel(Math.max(50, zoomLevel - 25))
                          }
                          disabled={zoomLevel <= 50}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-slate-600 w-12 text-center">
                          {zoomLevel}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setZoomLevel(Math.min(200, zoomLevel + 25))
                          }
                          disabled={zoomLevel >= 200}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Page Reordering */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-purple-600" />
                      Drag Pages to Reorder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(120, (120 * zoomLevel) / 100)}px, 1fr))`,
                      }}
                    >
                      {pdfPages.map((page) => (
                        <div
                          key={page.id}
                          className={cn(
                            "relative border-2 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-300",
                            draggedPage === page.id
                              ? "border-purple-500 bg-purple-50 scale-105 shadow-xl rotate-2 z-10"
                              : "border-slate-200 hover:border-purple-300 hover:shadow-lg",
                          )}
                          draggable
                          onDragStart={() => setDraggedPage(page.id)}
                          onDragEnd={() => setDraggedPage(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handlePageDrop(e, page.id)}
                        >
                          {/* Drag Handle */}
                          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                            <GripVertical className="h-3 w-3 text-slate-400" />
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removePage(page.id)}
                            className="absolute top-2 left-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 shadow-sm transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>

                          {/* Page Preview */}
                          <div className="relative">
                            <img
                              src={page.thumbnail}
                              alt={`Page ${page.pageNumber}`}
                              className="w-full h-32 object-cover bg-white border border-slate-200 rounded mb-2"
                              style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: "top center",
                              }}
                            />

                            {/* Page Number Badge */}
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <Badge
                                variant="secondary"
                                className="text-xs font-bold"
                              >
                                {page.pageNumber}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-xs text-center font-medium text-slate-700">
                            Page {page.pageNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Output Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Output Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={outputOption}
                      onValueChange={(value: "download" | "save") =>
                        setOutputOption(value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="download" id="download" />
                        <Label htmlFor="download" className="cursor-pointer">
                          Download reordered PDF
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="save" id="save" />
                        <Label htmlFor="save" className="cursor-pointer">
                          Save to My Files
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Processing */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Reordering Pages...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we apply your page reordering
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
                      onClick={handleApplyChanges}
                      className="px-8 py-4 text-lg font-medium bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Apply Changes
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
                    Pages Reordered Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your PDF pages have been reordered and are ready for{" "}
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
                        Download Reordered PDF
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
                    Reorder Another PDF
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
              Select a PDF file from your saved documents to reorder pages
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