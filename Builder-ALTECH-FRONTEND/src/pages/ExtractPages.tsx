import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { savePDFToMyFiles } from "@/utils/myFilesUpload";
import { UploadFromMyFiles } from "@/utils/UploadFromMyFiles";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Bot,
  Copy,
  Eye,
  Info,
  Lightbulb,
  FileImage,
  ArrowRight,
} from "lucide-react";
// Define MyFileData interface locally (adjust fields as needed)
interface MyFileData {
  id: string;
  name: string;
  size: string;
  pages: number;
}

interface PDFPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string;
}

// Extracted pages result interface
interface ExtractedPagesResult {
  pageNumbers: number[];
  totalPages: number;
  filename: string;
  extractedAt: Date;
}

export default function ExtractPages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  


  const [pdfPages, setPdfPages] = useState<PDFPage[]>([]);
  const [pageRanges, setPageRanges] = useState("");
  const [outputOption, setOutputOption] = useState<"download" | "save">("download",);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [myFiles, setMyFiles] = useState([]);
  const [resultFile, setResultFile] = useState<File | null>(null);


  // NEW: Store the extracted pages result for download
  const [extractedResult, setExtractedResult] =
    useState<ExtractedPagesResult | null>(null);


   
  // Generate mock page thumbnails
  const generateMockPages = (pageCount: number): PDFPage[] => {
    return Array.from({ length: pageCount }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      selected: false,
      thumbnail: generateRealisticPDFContent(index + 1, pageCount),
    }));
  };

  // Generate realistic PDF content for thumbnails
  const generateRealisticPDFContent = (
    pageNumber: number,
    totalPages: number,
  ): string => {
    const contentTypes = [
      // Title page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <rect x="20" y="40" width="170" height="2" fill="#333"/>
        <text x="105" y="80" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">DOCUMENT TITLE</text>
        <text x="105" y="100" text-anchor="middle" font-size="12" fill="#666">Subtitle or Company Name</text>
        <rect x="70" y="120" width="70" height="80" fill="#f0f0f0" stroke="#ddd"/>
        <text x="105" y="165" text-anchor="middle" font-size="8" fill="#999">Image/Logo</text>
        <text x="105" y="250" text-anchor="middle" font-size="10" fill="#666">Page ${pageNumber} of ${totalPages}</text>
      </svg>`,

      // Text content page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <text x="20" y="30" font-size="14" font-weight="bold" fill="#333">Chapter ${pageNumber}</text>
        <rect x="20" y="40" width="170" height="1" fill="#ddd"/>
        ${Array.from(
          { length: 15 },
          (_, i) =>
            `<rect x="20" y="${55 + i * 12}" width="${120 + Math.random() * 50}" height="2" fill="#666"/>`,
        ).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#999">Page ${pageNumber}</text>
      </svg>`,

      // Chart/graph page
      `<svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="white"/>
        <text x="105" y="30" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Data Analysis</text>
        <rect x="40" y="50" width="130" height="100" fill="#f8f8f8" stroke="#ddd"/>
        <rect x="60" y="120" width="15" height="20" fill="#3b82f6"/>
        <rect x="80" y="110" width="15" height="30" fill="#10b981"/>
        <rect x="100" y="100" width="15" height="40" fill="#f59e0b"/>
        <rect x="120" y="130" width="15" height="10" fill="#ef4444"/>
        <text x="105" y="180" text-anchor="middle" font-size="10" fill="#666">Chart Title</text>
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
  ): { valid: boolean; message: string } => {
    if (!ranges.trim()) {
      return { valid: false, message: "Please specify pages to extract" };
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
        message: `${pages.length} page(s) will be extracted`,
      };
    } catch (error) {
      return { valid: false, message: "Invalid page range format" };
    }
  };

// ✅ 1. Funcția care obține numărul real de pagini din backend
const handlePageCount = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken"); // sau "token" dacă așa salvezi

    const response = await fetch("http://localhost:8000/myfiles/count-pages/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to get page count");
    }

    const data = await response.json();
    const count = data.pages;

    const pages: PDFPage[] = Array.from({ length: count }, (_, index) => ({
      id: `page-${index + 1}`,
      pageNumber: index + 1,
      selected: false,
      thumbnail: "",
    }));

    setPdfPages(pages);
  } catch (error) {
    console.error("❌ Error getting page count:", error);
    toast({
      title: "Page count failed",
      description: "Could not retrieve the number of pages in the PDF.",
      variant: "destructive",
    });
  }
};

  // ✅ 2. Înlocuiește funcția de upload local
// ✅ 1. Upload din device (stil Split)
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

  setUploadedFile(file); // 🔁 simplu File object
  setPdfPages([]); // resetăm previewul

  await handlePageCount(file); // ⬅️ contor real din backend

  toast({
    title: "File uploaded",
    description: `${file.name} is ready for processing`,
  });
};

// ✅ 2. Selectare din My Files (folosește File mock, ca în Split)
const handleMyFileSelect = async (file: MyFileData) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Missing auth token");

    const response = await fetch(`http://localhost:8000/myfiles/base/${file.id}/download/`, {

      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download selected file from My Files.");
    }

    const blob = await response.blob();
    const realFile = new File([blob], file.name, { type: "application/pdf" });

    setUploadedFile(realFile);
    setPdfPages([]);

    await handlePageCount(realFile);

    toast({
      title: "File selected",
      description: `${file.name} loaded from My Files with real page count.`,
    });

    setShowMyFilesModal(false);
  } catch (error) {
    console.error("❌ Error selecting file from My Files:", error);
    toast({
      title: "File selection failed",
      description: "Could not load the file from My Files.",
      variant: "destructive",
    });
  }
};

  // (Removed duplicate handleDragOver, handleDragLeave, handleDrop)


// ✅ 4. Extrage paginile (fără file_id, trimite fișierul ca FormData)
const handleExtract = async () => {
  const validation = validatePageRanges(pageRanges);
  if (!validation.valid) {
    toast({
      title: "Invalid page selection",
      description: validation.message,
      variant: "destructive",
    });
    return;
  }

  if (!uploadedFile) {
    toast({
      title: "No file selected",
      description: "Please upload a file first",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    const parsedPages = parsePageRanges(pageRanges);
    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("file", uploadedFile);
    parsedPages.forEach((page) => {
      formData.append("pages", page.toString());
    });

    const response = await fetch("http://localhost:8000/basic/extract_pages/extract/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to extract pages");
    }

    const blob = await response.blob();
    const file = new File([blob], `extracted_pages_${uploadedFile.name}`, {
      type: "application/pdf",
      
    });
    console.log("🧪 [DEBUG] Extracted file info:");
      console.log("Name:", file.name);
      console.log("Size (bytes):", file.size);
      console.log("Type:", file.type);


    setResultFile(file);
    setExtractedResult({
      pageNumbers: parsedPages,
      totalPages: parsedPages.length,
      filename: file.name,
      extractedAt: new Date(),
    });

    setIsProcessed(true);
    setIsProcessing(false);

    toast({
      title: "Pages extracted successfully!",
      description: "You can now download or save the new PDF.",
    });

    console.log("✅ Extract completed - awaiting user action (download or save)");
  } catch (error) {
    setIsProcessing(false);
    toast({
      title: "Extraction failed",
      description: (error as Error).message || "Failed to extract pages",
      variant: "destructive",
    });
  }
};



  // FIXED: Handle download with proper extracted pages check
 const handleDownload = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF before downloading.",
        variant: "destructive",
      });
      return;
    }

    const selectedPages = extractedResult?.pageNumbers || [];

    if (selectedPages.length === 0) {
      toast({
        title: "No pages selected",
        description: "Please extract pages first before downloading.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Adaugă fișierul o singură dată
    formData.append("file", uploadedFile);

    // ✅ Adaugă paginile selectate
    selectedPages.forEach((page) => {
      formData.append("pages", page.toString());
    });

    const response = await fetch("http://localhost:8000/basic/extract_pages/extract/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to download extracted pages");
    }

    const blob = await response.blob();
    const file = new File([blob], "extracted_pages.pdf", { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_pages.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download successful",
      description: "Extracted pages downloaded successfully.",
    });
  } catch (error) {
    console.error("Download failed:", error);
    toast({
      title: "Download failed",
      description: "Unable to download extracted pages.",
      variant: "destructive",
    });
  }
};


 const handleSaveToMyFiles = async () => {
  const token = localStorage.getItem("authToken");

  if (!extractedResult || !resultFile) {
    toast({
      title: "Save Failed",
      description: "No file available to save. Please extract pages first.",
      variant: "destructive",
    });
    return;
  }

  // 🔍 DEBUG INFO
  console.log("📤 [SAVE TO MY FILES] Preparing to upload file:");
  console.log("Name:", resultFile.name);
  console.log("Size (bytes):", resultFile.size);
  console.log("Type:", resultFile.type);

  try {
    const response = await savePDFToMyFiles(resultFile, token);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Upload to My Files failed:", error);
      throw new Error("Upload failed");
    }

    toast({
      title: "Saved to My Files",
      description: `Extracted pages (${extractedResult.pageNumbers.join(", ")}) have been saved.`,
    });

    console.log("✅ [SAVE TO MY FILES] File uploaded successfully.");
  } catch (error) {
    console.error("❌ [SAVE TO MY FILES] Upload error:", error);
    toast({
      title: "Save Failed",
      description: "Could not save the file to My Files.",
      variant: "destructive",
    });
  }
};


const removeFile = () => {
  setUploadedFile(null);
  setPdfPages([]);
  setPageRanges("");
  setIsProcessed(false);
  setExtractedResult(null);
  setResultFile(null);
  toast({
    title: "File removed",
    description: "You can now upload a new PDF file",
  });
};

const copyExample = (example: string) => {
  setPageRanges(example);
  toast({
    title: "Example copied",
    description: `Page range "${example}" has been set.`,
  });
};





  const validation = validatePageRanges(pageRanges);

  // Drag and drop handlers for file upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
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
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FileImage className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Extract Pages
                  </h1>
                  <p className="text-slate-600">
                    Select specific pages from your PDF and save them as a new
                    document.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.extract} />
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
                      <Copy className="h-5 w-5 text-purple-600" />
                      Select Pages to Extract
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pageRanges">
                        Page Numbers (e.g., 1, 3-5, 8, 10-12)
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
                          First page only
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
                          onClick={() => copyExample(`${pdfPages.length}`)}
                          className="text-xs"
                        >
                          Last page only
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyExample("1, 5, 10")}
                          className="text-xs"
                        >
                          Specific pages
                        </Button>
                      </div>
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
                            Download directly to device
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
                        Page Preview
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
                                "border-2 rounded-lg p-2 transition-all cursor-pointer",
                                isSelected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300",
                              )}
                              onClick={() => {
                                const current = pageRanges
                                  ? pageRanges
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter((s) => s)
                                  : [];
                                const pageStr = page.pageNumber.toString();

                                if (isSelected) {
                                  // Remove page
                                  const filtered = current.filter(
                                    (p) => p !== pageStr,
                                  );
                                  setPageRanges(filtered.join(", "));
                                } else {
                                  // Add page
                                  const updated = [...current, pageStr];
                                  setPageRanges(updated.join(", "));
                                }
                              }}
                            >
                              <img
                                src={page.thumbnail}
                                alt={`Page ${page.pageNumber}`}
                                className="w-full h-20 object-cover bg-white border border-slate-200 rounded"
                              />
                              <p className="text-xs text-center mt-1 font-medium">
                                Page {page.pageNumber}
                              </p>
                              {isSelected && (
                                <Badge
                                  variant="default"
                                  className="mt-1 w-full justify-center text-xs"
                                >
                                  Selected
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
                        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                          <FileImage className="h-8 w-8 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Extracting Pages...
                        </h3>
                        <p className="text-slate-600">
                          Please wait while we extract your selected pages
                        </p>
                        <div className="animate-spin w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Button */}
                {!isProcessing && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleExtract}
                      disabled={!validation.valid}
                      className="px-8 py-4 text-lg font-medium bg-violet-600 hover:bg-violet-700"
                    >
                      <FileImage className="h-5 w-5 mr-2" />
                      Extract Pages
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
                    Pages Extracted Successfully!
                  </h2>
                  <p className="text-slate-600 mb-2">
                    {extractedResult && (
                      <>
                        Extracted {extractedResult.totalPages} page(s):{" "}
                        {extractedResult.pageNumbers.join(", ")}
                      </>
                    )}
                  </p>
                  <p className="text-slate-600 mb-6">
                    Your selected pages are ready for{" "}
                    {outputOption === "download"
                      ? "download"
                      : "saving to My Files"}
                    .
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    {outputOption === "download" ? (
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading || !extractedResult}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {isDownloading
                          ? "Downloading..."
                          : "Download Extracted Pages"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSaveToMyFiles}
                        disabled={!extractedResult}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save to My Files
                      </Button>
                    )}
                  </div>

                  <Button variant="ghost" onClick={removeFile}>
                    Extract from Another PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

     <UploadFromMyFiles
  open={showMyFilesModal}
  onClose={() => {
    console.log("📁 MyFiles modal closed");
    setShowMyFilesModal(false);
  }}
  onSelectFile={(file) => {
    console.log("📁 Selected from MyFiles:", file);
    toast({
      title: "Selected file",
      description: `${file.name} (${file.size} • ${file.pages} pages)`,
    });
    handleMyFileSelect({ ...file, id: String(file.id) }); // convert id to string
  }}
/>


      <Footer />
    </div>
  );
}

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