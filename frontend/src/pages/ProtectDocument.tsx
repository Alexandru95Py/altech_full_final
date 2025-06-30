import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { realFileDownload } from "@/utils/realFileDownload";
import { fetchMyFiles, MyFileData } from "@/utils/fetchMyFiles";
import { fetchMyFileAsRealFile } from "@/services/fetchMyFileAsRealFile";

import {
  Upload,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Download,
  CheckCircle,
  Shield,
  FolderOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { blob } from "stream/consumers";

const ProtectDocument = () => {
  const [sourceType, setSourceType] = useState<"myfiles" | "upload">("myfiles");
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [protectionResult, setProtectionResult] = useState<{
    success: boolean;
    fileName?: string;
    downloadUrl?: string;
    message?: string;
  } | null>(null);

  // Add pdfPages state to avoid compile error
  const [pdfPages, setPdfPages] = useState<{ pageNumber: number; selected: boolean }[]>([]);

  // Mock data for My Files
  const [myFiles, setMyFiles] = useState<MyFileData[]>([]);

  // Advanced permissions
  const [disablePrinting, setDisablePrinting] = useState(false);
  const [disableCopying, setDisableCopying] = useState(false);
  const [disableEditing, setDisableEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setProtectionResult(null);
      toast.success("PDF uploaded successfully!");
    } else {
      toast.error("Please upload a valid PDF file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      setUploadedFile(pdfFile);
      setSourceType("upload");
      setProtectionResult(null);
      toast.success("PDF uploaded successfully!");
    } else {
      toast.error("Please drop a valid PDF file");
    }
  };

  const validatePasswords = () => {
    if (!password) {
      toast.error("Please enter a password");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateFileSelection = () => {
    if (sourceType === "myfiles" && !selectedFile) {
      toast.error("Please select a file from My Files");
      return false;
    }
    if (sourceType === "upload" && !uploadedFile) {
      toast.error("Please upload a PDF file");
      return false;
    }
    return true;
  };

  // Helper to download and set file from My Files
  const handleMyFileSelect = async (file: MyFileData) => {
    try {
      const token = localStorage.getItem("authToken") || "";
      const realFile = await fetchMyFileAsRealFile(String(file.id), file.name, token);
      setUploadedFile(realFile);
      setProtectionResult(null);
      toast.success(`${file.name} loaded from My Files.`);
    } catch (error) {
      console.error("❌ Error selecting file from My Files:", error);
      toast.error("File selection failed: Could not load the file from My Files.");
    }
  };

  const handleProtectPDF = async () => {
  if (!validateFileSelection() || !validatePasswords()) {
    return;
  }

  setIsProtecting(true);
  setProtectionResult(null);

  try {
    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);

    let url = "";
if (sourceType === "upload" && uploadedFile) {
  formData.append("file", uploadedFile);
  url = "http://localhost:8000/free/upload/";
} else if (sourceType === "myfiles" && selectedFile) {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Missing auth token");

  // 🔽 Descărcăm fișierul real din My Files
  const fileResponse = await fetch(`http://localhost:8000/myfiles/base/${selectedFile}/download/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!fileResponse.ok) {
    throw new Error("Failed to download selected file from My Files.");
  }

  const fileBlob = await fileResponse.blob();
  const file = new File([fileBlob], "selected_file.pdf", { type: "application/pdf" });

  // 🆕 Pregătim pentru trimitere ca și cum ar fi fost "upload"
  formData.append("file", file);
  url = "http://localhost:8000/free/upload/";
} else {
  toast.error("File not selected");
  setIsProtecting(false);
  return;
}

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to protect file");
    }
    const filename =
      (sourceType === "upload" && uploadedFile?.name) ||
      myFiles.find((f) => String(f.id) === selectedFile)?.name ||
      "protected.pdf";

    const fileBlob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(fileBlob);

    setProtectionResult({
      success: true,
      fileName: filename,
      downloadUrl,
      message: "PDF protected successfully and ready for download.",
    });

    toast.success("PDF protected successfully!");
    setPassword("");
    setConfirmPassword("");
  } catch (error) {
    console.error("❌ Error protecting PDF:", error);
    setProtectionResult({
      success: false,
      message: "Failed to protect PDF. Please try again.",
    });
    toast.error("Protection failed. Please try again.");
  } finally {
    setIsProtecting(false);
  }
};


// Download handler for protected PDF
const handleDownload = async () => {
  try {
    if (!protectionResult?.downloadUrl || !protectionResult?.fileName) {
      toast.error("No protected PDF available for download.");
      return;
    }

    const downloadUrl = protectionResult.downloadUrl;
    const fileName = protectionResult.fileName.endsWith(".pdf")
      ? protectionResult.fileName.replace(/\.pdf$/, "_protected.pdf")
      : protectionResult.fileName + "_protected.pdf";

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    toast.success("Protected PDF downloaded successfully.");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download protected file.");
  }
};


// Helper to get selected file name
  const getSelectedFileName = () => {
    if (sourceType === "myfiles" && selectedFile) {
      return myFiles.find((f) => String(f.id) === selectedFile)?.name;
    }
    if (sourceType === "upload" && uploadedFile) {
      return uploadedFile.name;
    }
    return null;
  };

  // Fetch My Files on mount (like SplitPDF)
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("authToken") || "";
        const files = await fetchMyFiles(token);
        setMyFiles(files);
      } catch (error) {
        console.error("Failed to fetch My Files:", error);
        toast.error("Failed to load My Files. Please try again.");
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Protect Document
            </h1>
            <p className="text-slate-600">
              Secure your PDF by adding password protection to prevent
              unauthorized access.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - File Selection & Settings */}
            <div className="space-y-6">
              {/* Source Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select PDF Source</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={sourceType}
                    onValueChange={(value) => {
                      setSourceType(value as "myfiles" | "upload");
                      setProtectionResult(null);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="myfiles" id="myfiles" />
                      <Label
                        htmlFor="myfiles"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen className="h-4 w-4" />
                        From My Files
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label
                        htmlFor="upload"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                        From This Device
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* File Selection based on source type */}
                  {sourceType === "myfiles" ? (
                    <div className="space-y-2">
                      <Label>Select File</Label>
                      <Select
                        value={selectedFile}
                        onValueChange={setSelectedFile}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a file from My Files" />
                        </SelectTrigger>
                        <SelectContent>
                          {myFiles.map((file) => (
                            <SelectItem key={file.id} value={String(file.id)}>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-red-600" />
                                <span>{file.name}</span>
                                <span className="text-slate-500 text-sm">
                                  ({file.size})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Upload PDF File</Label>
                      <div
                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-8 w-8 text-red-600" />
                            <div>
                              <p className="font-medium text-slate-900">
                                {uploadedFile.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-slate-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              PDF files only
                            </p>
                          </>
                        )}
                      </div>
                      {uploadedFile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Replace File
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">🔑 Enter Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">🔑 Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showPassword"
                      checked={showPassword}
                      onCheckedChange={setShowPassword}
                    />
                    <Label htmlFor="showPassword" className="text-sm">
                      Show passwords
                    </Label>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Minimum 6 characters recommended
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Advanced Permissions (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disablePrinting"
                      checked={disablePrinting}
                      onCheckedChange={(checked) => setDisablePrinting(checked === true)}
                    />
                    <Label htmlFor="disablePrinting" className="text-sm">
                      Disable printing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disableCopying"
                      checked={disableCopying}
                      onCheckedChange={(checked) => setDisableCopying(checked === true)}
                    />
                    <Label htmlFor="disableCopying" className="text-sm">
                      Disable copying text
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="disableEditing"
                      checked={disableEditing}
                      onCheckedChange={(checked) => setDisableEditing(checked === true)}
                    />
                    <Label htmlFor="disableEditing" className="text-sm">
                      Disable editing
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Action */}
            <div className="space-y-6">
              {/* File Preview */}
              {getSelectedFileName() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected File</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <FileText className="h-10 w-10 text-red-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {getSelectedFileName()}
                        </p>
                        <p className="text-sm text-slate-500">
                          {sourceType === "myfiles"
                            ? myFiles.find((f) => f.id === Number(selectedFile))
                                ?.size
                            : uploadedFile
                              ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Protection Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Apply Protection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleProtectPDF}
                    disabled={isProtecting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {isProtecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Protecting PDF...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Protect PDF
                      </>
                    )}
                  </Button>

                  {password &&
                    confirmPassword &&
                    password === confirmPassword &&
                    password.length >= 6 && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Password validation passed
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Result Area */}
              {protectionResult && (
                <Card>
                  <CardHeader>
                    <CardTitle
                      className={cn(
                        "text-lg flex items-center gap-2",
                        protectionResult.success
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {protectionResult.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      {protectionResult.success ? "Success!" : "Error"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600">{protectionResult.message}</p>

                    {protectionResult.success && (
                      <div className="space-y-2">
                        {protectionResult.downloadUrl ? (
                          <Button onClick={handleDownload} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download Protected PDF
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full">
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View in My Files
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProtectDocument;
function setPdfPages(arg0: undefined[]) {
  throw new Error("Function not implemented.");
}

function handlePageCount(realFile: File) {
  throw new Error("Function not implemented.");
}

function setShowMyFilesModal(arg0: boolean) {
  throw new Error("Function not implemented.");
}
