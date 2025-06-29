import { useState, useRef, useEffect, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { savePDFToMyFiles } from "@/utils/myFilesUpload";

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
  ArrowLeft,
  Trash2,
  GripVertical,
  Download,
  Save,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import { MyFileData } from "@/utils/fetchMyFiles";
import { UploadFromMyFiles } from "@/utils/UploadFromMyFiles";
import { PDFPage } from "@/components/pdf/PageSelector";

export default function MergePDF() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 State management
  const [uploadMethod, setUploadMethod] = useState<"device" | "myfiles">("device");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showMyFilesModal, setShowMyFilesModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);

  // 🔧 Merge settings
  const [preserveBookmarks, setPreserveBookmarks] = useState(true);
  const [startNewPage, setStartNewPage] = useState(false);

  // 📂 My Files (mock + real)
  const mockMyFiles = [
    { id: 1, name: "Invoice_Q4_2024.pdf", size: "2.4 MB", pages: 15 },
    { id: 2, name: "Contract_ALTech_Signed.pdf", size: "1.8 MB", pages: 8 },
    { id: 3, name: "Report_January.pdf", size: "5.1 MB", pages: 24 },
    { id: 4, name: "Presentation_Draft.pdf", size: "3.7 MB", pages: 18 },
  ];

  const [myFiles, setMyFiles] = useState<MyFileData[]>([]);

  useEffect(() => {
    setMyFiles([
      { id: 1, name: "Example1.pdf", size: "1.2 MB", pages: 5, url: "" },
      // ... alte fișiere reale dacă le obții din fetchMyFiles()
    ]);
  }, []);

  const handlePageCount = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken"); // 🟢 nu "token", ci "authToken" dacă așa salvezi

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

  
  } catch (error) {
    console.error("Error getting page count:", error);
    toast({
      title: "Page count failed",
      description: "Could not retrieve the number of pages in the PDF.",
      variant: "destructive",
    });
  }
};


  // 🎨 Previzualizare SVG cu stiluri diferite în funcție de tip
  const generatePreviewContent = (fileName: string, pageCount: number) => {
    const contentType = fileName.includes("invoice")
      ? "invoice"
      : fileName.includes("contract")
        ? "contract"
        : "document";

    const colors = {
      invoice: "#f0f9ff",
      contract: "#fef7ff",
      document: "#f8fafc",
    };

    return `data:image/svg+xml;base64,${btoa(`
      <svg viewBox="0 0 210 297" xmlns="http://www.w3.org/2000/svg">
        <rect width="210" height="297" fill="${colors[contentType]}" stroke="#e2e8f0"/>
        <rect x="20" y="30" width="170" height="40" fill="white" stroke="#cbd5e1"/>
        <text x="105" y="55" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">
          ${contentType.toUpperCase()}
        </text>
        <rect x="20" y="80" width="170" height="2" fill="#94a3b8"/>
        ${Array.from({ length: 12 }, (_, i) =>
          `<rect x="20" y="${100 + i * 12}" width="${120 + Math.random() * 50}" height="2" fill="#cbd5e1"/>`).join("")}
        <text x="105" y="280" text-anchor="middle" font-size="8" fill="#64748b">
          ${pageCount} pages
        </text>
      </svg>
    `)}`;
  };

  // 📄 Contor real pagini PDF (pentru fallback sau frontend rapid)
  const getPDFPageCount = async (file: File): Promise<number> => {
    try {
      const pdfData = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error("❌ Error counting pages:", error);
      return 1; // fallback dacă eșuează
    }
  };

  // Handle file upload from device (multiple files)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: "Upload failed",
          description: validation.error,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
      await handlePageCount(file);
    }
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setIsUploading(false);
    if (validFiles.length > 0) {
      toast({
        title: "File(s) uploaded successfully",
        description: `${validFiles.length} file(s) added for merging.`,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle file selection from My Files (multiple files)
  const handleMyFileSelect = async (file: MyFileData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");
      const response = await fetch(`http://localhost:8000/myfiles/base/${file.id}/download/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to download selected file from My Files.");
      const blob = await response.blob();
      const realFile = new File([blob], file.name, { type: "application/pdf" });
      setUploadedFiles((prev) => [...prev, realFile]);
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

  // Handle merge process
  const handleMerge = async () => {
  if (uploadedFiles.length < 2) {
    toast({
      title: "Not enough files",
      description: "Please select at least 2 PDF files to merge.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Missing auth token");

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file); // 🧩 asigură-te că backendul acceptă 'files'
    });

    // Opțiuni adiționale (dacă le ai activate)
    formData.append("preserve_bookmarks", preserveBookmarks.toString());
    formData.append("start_new_page", startNewPage.toString());

    const response = await fetch("http://localhost:8000/basic/merge/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Merge request failed");

    const blob = await response.blob();
    const mergedFile = new File([blob], "merged_result.pdf", {
      type: "application/pdf",
    });

    setResultFile(mergedFile);
    setIsProcessed(true);

    toast({
      title: "PDFs merged successfully",
      description: "Your merged PDF is ready for download or save.",
    });

    console.log("✅ Merged file created:", mergedFile.name);
    console.log("📦 Size:", mergedFile.size);
    console.log("📁 Type:", mergedFile.type);
  } catch (error) {
    console.error("❌ Merge failed:", error);
    toast({
      title: "Merge Failed",
      description: "Something went wrong while merging the PDFs.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};

  const handleDownload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files Uploaded",
        description: "Please upload at least one PDF to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const formData = new FormData();

      uploadedFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append("files", file);
          formData.append("preserve_bookmarks", preserveBookmarks.toString());
          formData.append("start_new_page", startNewPage.toString());
        } else {
          console.error("Invalid file object detected:", file);
          toast({
            title: "Invalid file",
            description: "One or more files are not valid PDF objects.",
            variant: "destructive",
          });
          return;
        }
      });

      const response = await fetch("http://localhost:8000/basic/merge/", {
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
      link.download = "merged_result.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your merged PDF is being downloaded.",
      });
    } catch (error) {
      console.error("❌ Merge download error:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the merged PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle save to My Files
 const handleSaveToMyFiles = async () => {
  const token = localStorage.getItem("authToken");

  if (!resultFile) {
    toast({
      title: "Save Failed",
      description: "No merged PDF available to save. Please merge the files first.",
      variant: "destructive",
    });
    return;
  }

  // 🔍 DEBUG INFO
  console.log("📤 [SAVE TO MY FILES - MERGE]");
  console.log("📄 File name:", resultFile.name);
  console.log("📦 File size:", resultFile.size);
  console.log("📁 File type:", resultFile.type);

  try {
    const response = await savePDFToMyFiles(resultFile, token);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Upload failed:", error);
      throw new Error("Upload failed");
    }

    toast({
      title: "Saved to My Files",
      description: `${resultFile.name} uploaded successfully.`,
    });

    console.log("✅ File uploaded successfully.");
  } catch (error) {
    console.error("❌ Save error:", error);
    toast({
      title: "Save Failed",
      description: "Could not save the merged PDF to My Files.",
      variant: "destructive",
    });
  }
};


  // Reset to start over
  const handleStartOver = () => {
    setUploadedFiles([]);
    setIsProcessed(false);
    setIsProcessing(false);
  };

  // Adjust rendering logic for file source
  const renderFileSource = (file: File) => {
    return "Uploaded from device"; // Default description for uploaded files
  };

  // Remove file by name
function removeFile(name: string): void {
  setUploadedFiles((prev) => prev.filter((f) => f.name !== name));
}

// Clear all files
function clearAllFiles() {
  setUploadedFiles([]);
}

// Handle drag and drop for reordering
function handleFileDrop(e: DragEvent<HTMLDivElement>, name: string): void {
  e.preventDefault();
  if (!draggedFile || draggedFile === name) return;
  const draggedIdx = uploadedFiles.findIndex((f) => f.name === draggedFile);
  const targetIdx = uploadedFiles.findIndex((f) => f.name === name);
  if (draggedIdx === -1 || targetIdx === -1) return;
  const reordered = [...uploadedFiles];
  const [removed] = reordered.splice(draggedIdx, 1);
  reordered.splice(targetIdx, 0, removed);
  setUploadedFiles(reordered);
  setDraggedFile(null);
}

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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Merge PDFs
                  </h1>
                  <p className="text-slate-600">
                    Combine multiple PDF files into a single document.
                  </p>
                </div>
              </div>
              <HelpTooltip {...toolHelpContent.merge} />
            </div>
          </div>

          <div className="max-w-4xl space-y-8">
            {!isProcessed ? (
              <>
                {/* Upload Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                      Select PDF Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
                          isDragOver
                            ? "border-blue-400 bg-blue-50"
                            : "border-slate-300 hover:border-blue-400 hover:bg-blue-50",
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          handleFileUpload(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-medium text-slate-900 mb-1">
                          Upload from Device
                        </h3>
                        <p className="text-sm text-slate-500">
                          Drag & drop or click to select PDF files
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>

                      <div
                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => setShowMyFilesModal(true)}
                      >
                        <FolderOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-medium text-slate-900 mb-1">
                          Choose from My Files
                        </h3>
                        <p className="text-sm text-slate-500">
                          Select from your saved documents
                        </p>
                      </div>
                    </div>

                    {isUploading && (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-slate-600">
                          Uploading files...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Files to Merge ({uploadedFiles.length})
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFiles}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={file.name + '-' + file.size + '-' + index}
                            className={cn(
                              "flex items-center gap-4 p-4 border border-slate-200 rounded-lg transition-all",
                              draggedFile === file.name
                                ? "opacity-50 scale-95"
                                : "hover:shadow-md",
                            )}
                            draggable
                            onDragStart={() => setDraggedFile(file.name)}
                            onDragEnd={() => setDraggedFile(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleFileDrop(e, file.name)}
                          >
                            {/* Drag Handle */}
                            <div className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-5 w-5 text-slate-400" />
                            </div>

                            {/* File Preview */}
                            <div className="w-12 h-12 flex-shrink-0">
                              
                               <img
                                src={generatePreviewContent(file.name, (file as any).pageCount || 1)}

                                alt={`Preview of ${file.name}`}
                                className="w-full h-full object-cover rounded border border-slate-200"
                              />
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 truncate">
                                {index + 1}. {file.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span>
                                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </span>
                                <span>{(file as any).pageCount || 1} page(s)</span>

                                <Badge variant="outline" className="text-xs">
                                  {renderFileSource(file)}
                                </Badge>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6" />

                      {/* Merge Settings */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-slate-900">
                          Merge Settings
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="preserve-bookmarks"
                              checked={preserveBookmarks}
                              onCheckedChange={(checked) =>
                                setPreserveBookmarks(checked as boolean)
                              }
                            />
                            <Label
                              htmlFor="preserve-bookmarks"
                              className="text-sm"
                            >
                              Preserve bookmarks from original files
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="start-new-page"
                              checked={startNewPage}
                              onCheckedChange={(checked) =>
                                setStartNewPage(checked as boolean)
                              }
                            />
                            <Label htmlFor="start-new-page" className="text-sm">
                              Start each file on a new page
                            </Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processing */}
                {isProcessing && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Merging PDFs...
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Combining {uploadedFiles.length} files into a single
                        document
                      </p>
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    </CardContent>
                  </Card>
                )}

                {/* Merge Button */}
                {uploadedFiles.length > 0 && !isProcessing && (
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleMerge}
                      disabled={uploadedFiles.length < 2}
                      className="px-8 py-4 text-lg"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Merge {uploadedFiles.length} PDFs
                    </Button>
                    {uploadedFiles.length < 2 && (
                      <p className="text-sm text-slate-500 mt-2">
                        Add at least 2 PDF files to merge
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Success Screen */
              <Card className="text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    PDFs Merged Successfully!
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your {uploadedFiles.length} PDF files have been combined
                    into a single document.
                  </p>

                  <div className="flex justify-center gap-3 mb-6">
                    <Button
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Merged PDF
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

                  <Button variant="ghost" onClick={handleStartOver}>
                    Merge More Files
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
                handleMyFileSelect({ ...file, id: file.id }); // keep id as number
              }}
            />
            <Footer />
    </div>
  );
}

function setPdfPages(pages: PDFPage[]) {
  throw new Error("Function not implemented.");
}

function validateFile(file: File): { valid: boolean; error?: string } {
  // Example validation: check file type and size (max 50MB)
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed." };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: "File size exceeds 50MB limit." };
  }
  return { valid: true };
}

