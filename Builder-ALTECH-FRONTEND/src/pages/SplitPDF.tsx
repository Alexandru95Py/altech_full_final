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
import { Separator } from "@/components/ui/separator";
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
import { realMultipleFileDownload } from "@/utils/realFileDownload";
import {
  Upload,
  FolderOpen,
  Scissors,
  FileText,
  X,
  CheckCircle,
  ArrowLeft,
  Eye,
  Download,
  Save,
  Settings,
  Files,
} from "lucide-react";

interface PDFPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string; // Base64 or URL for thumbnail
}

export default function SplitPDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);

  // Split configuration
  const [splitMethod, setSplitMethod] = useState<
    "selection" | "range" | "evenly"
  >("selection");
  const [pageRanges, setPageRanges] = useState("");
  const [splitEvery, setSplitEvery] = useState("2");
  const [keepOriginal, setKeepOriginal] = useState(true);
  const [sendNotification, setSendNotification] = useState(false);

  // Mock My Files data
  const mockMyFiles = [
    { id: 1, name: "Invoice_Q4_2024.pdf", size: "2.4 MB", pages: 15 },
    { id: 2, name: "Contract_ALTech_Signed.pdf", size: "1.8 MB", pages: 8 },
    { id: 3, name: "Resume_Alexandru_CV.pdf", size: "856 KB", pages: 2 },
    { id: 4, name: "Report_Merged_Documents.pdf", size: "5.2 MB", pages: 45 },
  ];

  // Mock PDF pages (simulating extracted thumbnails)
  const generateMockPages = (pageCount: number): PDFPage[] => {
    return Array.from({ length: pageCount }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      selected: false,
      thumbnail: `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100">
          <rect width="80" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <text x="40" y="50" text-anchor="middle" font-family="Arial" font-size="12" fill="#64748b">Page ${index + 1}</text>
          <rect x="10" y="15" width="60" height="6" fill="#e2e8f0"/>
          <rect x="10" y="25" width="45" height="4" fill="#e2e8f0"/>
          <rect x="10" y="32" width="55" height="4" fill="#e2e8f0"/>
          <rect x="10" y="65" width="40" height="4" fill="#e2e8f0"/>
          <rect x="10" y="72" width="50" height="4" fill="#e2e8f0"/>
          <rect x="10" y="79" width="35" height="4" fill="#e2e8f0"/>
        </svg>`,
      )}`,
    }));
  };

  // File validation
  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.type !== "application/pdf") {
      return { valid: false, error: "Please upload a PDF file only." };
    }
    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" };
    }
    return { valid: true, error: null };
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.valid) {
      toast({
        title: "Upload failed",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setUploadedFile(file);
      // Generate mock pages based on a random page count (5-25 pages)
      const pageCount = Math.floor(Math.random() * 21) + 5;
      const pages = generateMockPages(pageCount);
      setPdfPages(pages);
      setIsUploading(false);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} loaded with ${pageCount} pages`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 2000);
  };

  // Handle file selection from My Files
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

  // Handle page selection
  const togglePageSelection = (pageId: string) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, selected: !page.selected } : page,
      ),
    );
  };

  // Select all pages
  const selectAllPages = () => {
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: false })));
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

  // Validation
  const isSplitValid = () => {
    if (!uploadedFile || pdfPages.length === 0) return false;

    if (splitMethod === "selection") {
      return pdfPages.some((page) => page.selected);
    }
    if (splitMethod === "range") {
      return pageRanges.trim() !== "";
    }
    if (splitMethod === "evenly") {
      return (
        parseInt(splitEvery) > 0 && parseInt(splitEvery) <= pdfPages.length
      );
    }
    return false;
  };

  // Handle split processing
  const handleSplit = async () => {
    if (!isSplitValid()) return;

    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsProcessed(true);

      let resultMessage = "";
      if (splitMethod === "selection") {
        const selectedCount = pdfPages.filter((page) => page.selected).length;
        resultMessage = `Selected ${selectedCount} pages split into a new document`;
      } else if (splitMethod === "range") {
        resultMessage = `Pages split by ranges: ${pageRanges}`;
      } else {
        const fileCount = Math.ceil(pdfPages.length / parseInt(splitEvery));
        resultMessage = `PDF split into ${fileCount} files (every ${splitEvery} pages)`;
      }

      toast({
        title: "PDF split successfully",
        description: resultMessage,
      });
    }, 3000);
  };

  // Handle download
  const handleDownload = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    // 🔧 Adaugă fișierul PDF
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF before downloading.",
        variant: "destructive",
      });
      return;
    }

    formData.append("file", uploadedFile);

    const selectedPages = pdfPages
      .filter((page) => page.selected)
      .map((page) => page.pageNumber);

    if (selectedPages.length === 0) {
      toast({
        title: "No pages selected",
        description: "Select at least one page to split.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Trimite ca JSON string
    formData.append("pages_to_split", JSON.stringify(selectedPages));

    const response = await fetch("http://localhost:8000/basic/split/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to download split results");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "split_result.pdf";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download successful",
      description: "Split PDF downloaded successfully.",
    });
  } catch (error) {
    console.error("Download failed:", error);
    toast({
      title: "Download failed",
      description: "Unable to download split results.",
      variant: "destructive",
    });
  }
};

  // Handle save to My Files
  const handleSaveToMyFiles = () => {
    toast({
      title: "Saved to My Files",
      description: "Your split PDF files have been saved to My Files",
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Scissors className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Split PDF
                  </h1>
                  <p className="text-slate-600">
                    Upload your file and choose how you want to split it into
                    separate documents.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.split} />
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
                          Processing PDF and generating page previews...
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

                        <p className="text-sm text-slate-500">
                          Or drag and drop your PDF file here (max 10MB)
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : !isProcessed ? (
              <>
                {/* File Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {uploadedFile.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                            • {pdfPages.length} pages
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Split Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      Split Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={splitMethod}
                      onValueChange={(value) =>
                        setSplitMethod(value as typeof splitMethod)
                      }
                    >
                      {/* Split by Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selection" id="selection" />
                          <Label htmlFor="selection" className="font-medium">
                            Split by selection (manually select pages)
                          </Label>
                        </div>
                        {splitMethod === "selection" && (
                          <div className="ml-6 text-sm text-slate-600">
                            Select specific pages below to extract into a new
                            document
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Split by Range */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="range" id="range" />
                          <Label htmlFor="range" className="font-medium">
                            Split by range
                          </Label>
                        </div>
                        {splitMethod === "range" && (
                          <div className="ml-6 space-y-2">
                            <Label htmlFor="page-ranges" className="text-sm">
                              Enter page ranges (e.g., 1-3, 5-7, 10-12)
                            </Label>
                            <Input
                              id="page-ranges"
                              placeholder="1-3, 5-7, 10-12"
                              value={pageRanges}
                              onChange={(e) => setPageRanges(e.target.value)}
                              className="max-w-md"
                            />
                            <p className="text-xs text-slate-500">
                              Use commas to separate ranges. Each range will
                              create a separate file.
                            </p>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Split Evenly */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evenly" id="evenly" />
                          <Label htmlFor="evenly" className="font-medium">
                            Split evenly (every X pages)
                          </Label>
                        </div>
                        {splitMethod === "evenly" && (
                          <div className="ml-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="split-every" className="text-sm">
                                Split every
                              </Label>
                              <Input
                                id="split-every"
                                type="number"
                                min="1"
                                max={pdfPages.length}
                                value={splitEvery}
                                onChange={(e) => setSplitEvery(e.target.value)}
                                className="w-20"
                              />
                              <span className="text-sm text-slate-600">
                                pages
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              This will create{" "}
                              {Math.ceil(
                                pdfPages.length / parseInt(splitEvery || "1"),
                              )}{" "}
                              separate files
                            </p>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Page Preview Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Page Preview ({pdfPages.length} pages)
                      </CardTitle>
                      {splitMethod === "selection" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllPages}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={deselectAllPages}
                          >
                            Deselect All
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {splitMethod === "selection" && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Click on pages</strong> to select them for
                          splitting. Selected pages:{" "}
                          {pdfPages.filter((page) => page.selected).length}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {pdfPages.map((page) => (
                        <div
                          key={page.id}
                          className={cn(
                            "relative border-2 rounded-lg p-2 transition-all duration-200 cursor-pointer",
                            splitMethod === "selection" && page.selected
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
                          )}
                          onClick={() =>
                            splitMethod === "selection" &&
                            togglePageSelection(page.id)
                          }
                        >
                          {splitMethod === "selection" && (
                            <div className="absolute top-1 left-1 z-10">
                              <Checkbox
                                checked={page.selected}
                                onChange={() => togglePageSelection(page.id)}
                                className="bg-white"
                              />
                            </div>
                          )}

                          <div className="bg-white border border-slate-200 rounded overflow-hidden mb-2">
                            <img
                              src={page.thumbnail}
                              alt={`Page ${page.pageNumber}`}
                              className="w-full h-auto block"
                              style={{ imageRendering: "crisp-edges" }}
                            />
                          </div>

                          <p className="text-xs text-slate-600 text-center font-medium">
                            Page {page.pageNumber}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Additional Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keep-original"
                        checked={keepOriginal}
                        onCheckedChange={(checked) =>
                          setKeepOriginal(checked as boolean)
                        }
                      />
                      <Label htmlFor="keep-original" className="text-sm">
                        Keep original file in My Files
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-notification"
                        checked={sendNotification}
                        onCheckedChange={(checked) =>
                          setSendNotification(checked as boolean)
                        }
                      />
                      <Label htmlFor="send-notification" className="text-sm">
                        Send notification when processing is complete
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={handleSplit}
                    disabled={!isSplitValid() || isProcessing}
                    className="px-8 py-4 text-lg font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scissors className="h-5 w-5 mr-2" />
                        Split PDF
                      </>
                    )}
                  </Button>

                  {!isSplitValid() && uploadedFile && (
                    <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                      Please configure your split options before proceeding
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Success Screen */
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    PDF Split Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your PDF has been split according to your specifications.
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    <Button
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Split Files
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
                    Split Another PDF
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
              Select a PDF file from your saved documents to split
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