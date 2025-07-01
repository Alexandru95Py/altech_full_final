import { useState, useRef, useEffect } from "react";
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
import { savePDFToMyFiles } from "@/utils/myFilesUpload";
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
import { fetchMyFiles, MyFileData } from "@/utils/fetchMyFiles";

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
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedFilename, setConvertedFilename] = useState<string | null>(null);
  const [convertedContentType, setConvertedContentType] = useState<string>("application/pdf");
  const [myFiles, setMyFiles] = useState<MyFileData[]>([]);
  const [myFilesLoading, setMyFilesLoading] = useState(false);
  const [myFilesError, setMyFilesError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

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

  // Fetch My Files when modal opens
  useEffect(() => {
    if (showMyFilesModal) {
      const fetchFiles = async () => {
        setMyFilesLoading(true);
        setMyFilesError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setMyFilesError("Missing auth token");
          setMyFilesLoading(false);
          return;
        }
        try {
          const files = await fetchMyFiles(token);
          setMyFiles(files);
        } catch (e: any) {
          setMyFilesError(e.message || "Failed to fetch My Files");
        } finally {
          setMyFilesLoading(false);
        }
      };
      fetchFiles();
    }
  }, [showMyFilesModal]);

  // Get real page count from backend
  const handlePageCount = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8000/myfiles/count-pages/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to get page count");
      const data = await response.json();
      setPageCount(data.pages);
    } catch (error) {
      setPageCount(null);
      toast({
        title: "Page count failed",
        description: "Could not retrieve the number of pages in the PDF.",
        variant: "destructive",
      });
    }
  };

  // Handle file upload from device
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please upload a PDF file", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a PDF file smaller than 100MB", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    setUploadedFile(file);
    await handlePageCount(file);
    setIsUploading(false);
    toast({ title: "File uploaded successfully", description: `${file.name} is ready for conversion` });
  };

  // Handle My Files selection (real backend)
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
      setUploadedFile(realFile);
      setShowMyFilesModal(false);
      await handlePageCount(realFile);
      toast({ title: "File selected", description: `${file.name} is ready for conversion` });
    } catch (error) {
      toast({ title: "Failed to load file", description: "Could not load file from My Files.", variant: "destructive" });
    }
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

  const formData = new FormData();
  formData.append("file", uploadedFile);
  formData.append("target_format", selectedFormat);

  try {
    const response = await fetch("http://localhost:8000/convert/api/convert/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Server Error Response:", errorText);
      throw new Error(`Server responded with ${response.status}`);
    }
const blob = await response.blob();

const contentDisposition = response.headers.get("Content-Disposition");
const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
const filename = filenameMatch?.[1] || `converted.${selectedFormat}`;

const contentType =
  response.headers.get("Content-Type") || "application/octet-stream";



    // Setăm rezultatul în state pentru download sau salvare ulterioară
    setConvertedBlob(blob);
    setConvertedFilename(filename);
    setConvertedContentType(contentType);
    setIsProcessed(true);
    
        
    // 🔍 DEBUGURI
    console.log("📦 Blob primit:", blob);
    console.log("📁 Filename extras:", filename);
    console.log("🧾 Content-Type extras:", contentType);

 


    toast({
      title: "Conversion completed!",
      description: `Your PDF has been converted to ${selectedOption?.title}`,
    });
  } catch (error) {
    console.error("❌ Conversion error:", error);
    toast({
      title: "Conversion failed",
      description: "An error occurred while converting the file.",
      variant: "destructive",
    });
  } finally {
    setProcessingProgress(100);
    setIsProcessing(false);
  }
};


  // Handle download/save
  const handleDownload = async () => {
  if (!convertedBlob || !convertedFilename) {
    toast({
      title: "Nothing to download",
      description: "You must first convert a PDF before downloading",
      variant: "destructive",
    });
    return;
  }

  // 🔍 DEBUG
  console.log("⬇️ Pregătim descărcarea...");
  console.log("📦 Blob size:", convertedBlob.size);
  console.log("📁 Filename:", convertedFilename);
  console.log("🧾 Content-Type:", convertedContentType);

  // 🔄 Forțăm extensia corectă dacă tipul e ZIP
  let finalFilename = convertedFilename;
  if (convertedContentType === "application/zip" && !convertedFilename.endsWith(".zip")) {
    finalFilename = convertedFilename.replace(/\.[^/.]+$/, "") + ".zip";
    console.warn(`⚠️ Redenumire forțată: ${convertedFilename} → ${finalFilename}`);
  }

  setIsDownloading(true);
  try {
    const url = window.URL.createObjectURL(convertedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", finalFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log("✅ Descărcare inițiată cu succes.");
  } catch (error) {
    console.error("❌ Convert download error:", error);
    toast({
      title: "Download failed",
      description: "Could not download the converted file",
      variant: "destructive",
    });
  } finally {
    setIsDownloading(false);
  }
};


const handleSaveToMyFiles = async () => {
  const token = localStorage.getItem("authToken");
  
  if (!convertedBlob || !convertedFilename || !token) {
    toast({
      title: "Save Failed",
      description: "Conversion required before saving.",
      variant: "destructive",
    });
    return;
  }

  try {
    // 🔁 Creează fișier real din blob (necesar pentru upload corect)
    const fileToSave = new File([convertedBlob], convertedFilename, {
      type: convertedContentType,
    });

    // ✅ Folosește funcția utilitară reală
    const response = await savePDFToMyFiles(fileToSave, token);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", errorText);
      throw new Error("Upload failed");
    }

    toast({
      title: "Saved to My Files",
      description: "Your converted file has been saved successfully.",
    });
  } catch (error) {
    console.error("Save error:", error);
    toast({
      title: "Save Failed",
      description: "Could not save to My Files.",
      variant: "destructive",
    });
  }
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
                          {pageCount !== null ? `${pageCount} pages • ` : ""}Ready to convert
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
            {myFilesLoading ? (
              <div className="text-center text-slate-500">Loading...</div>
            ) : myFilesError ? (
              <div className="text-center text-red-500">{myFilesError}</div>
            ) : myFiles.length === 0 ? (
              <div className="text-center text-slate-500">No files found.</div>
            ) : (
              myFiles.map((file) => (
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
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}