import React, { useState, useRef } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useStorageValidation } from "@/hooks/useStorageValidation";
import { djangoAPI, handleAPIError } from "@/lib/api";
import { realFileDownload } from "@/utils/realFileDownload";
import { PDFCanvas, SignatureModal, PDFElement } from "@/components/pdf-editor";
import {
  Upload,
  PenTool,
  Type,
  Calendar,
  Trash2,
  Undo,
  Redo,
  Download,
  Save,
  FileText,
  Mouse,
  Signature,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Enhanced FillSign component with fully interactive elements
 * Features move, resize, rotate capabilities for all PDF elements
 */
const FillSign = () => {
  const { canUpload } = useStorageValidation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [elements, setElements] = useState<PDFElement[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureModalType, setSignatureModalType] = useState<
    "signature" | "initial"
  >("signature");

  // History for undo/redo
  const [history, setHistory] = useState<PDFElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const tools = [
    { id: "select", icon: Mouse, label: "Select" },
    { id: "text", icon: Type, label: "Add Text" },
    { id: "signature", icon: PenTool, label: "Add Signature" },
    { id: "initial", icon: Signature, label: "Add Initial" },
    { id: "date", icon: Calendar, label: "Add Date" },
    { id: "delete", icon: Trash2, label: "Delete" },
  ];

  // File upload handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (!canUpload(file.size)) {
      return;
    }

    try {
      // Upload file to Django backend
      const response = await djangoAPI.uploadFile(file);

      if (response.success && response.data) {
        setUploadedFile(file);
        setUploadedFileId(response.data.id);
        setPdfUrl(URL.createObjectURL(file));
        setElements([]);
        setHistory([]);
        setHistoryIndex(-1);
        setActiveTool("select");
        toast.success("PDF uploaded successfully!");
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error(`Upload failed: ${handleAPIError(error)}`);
    }
  };

  // Tool selection
  const handleToolSelect = (toolId: string) => {
    if (toolId === "signature") {
      setSignatureModalType("signature");
      setIsSignatureModalOpen(true);
      setActiveTool(null);
    } else if (toolId === "initial") {
      setSignatureModalType("initial");
      setIsSignatureModalOpen(true);
      setActiveTool(null);
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  // Add element to history and update elements
  const updateElementsWithHistory = (newElements: PDFElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setElements(newElements);
  };

  // Handle element changes
  const handleElementsChange = (newElements: PDFElement[]) => {
    setElements(newElements);
  };

  // Add new element
  const handleElementAdd = (elementData: Omit<PDFElement, "id">) => {
    const newElement: PDFElement = {
      ...elementData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const newElements = [...elements, newElement];
    updateElementsWithHistory(newElements);
    setActiveTool("select"); // Switch to select tool after adding
  };

  // Handle signature creation
  const handleSignatureCreate = (
    signatureData: string,
    type: "draw" | "upload" | "type",
  ) => {
    const newElement: PDFElement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: signatureModalType,
      x: 100,
      y: 100,
      width: signatureModalType === "signature" ? 150 : 75,
      height: signatureModalType === "signature" ? 50 : 50,
      rotation: 0,
      content: signatureModalType === "signature" ? "Signature" : "Initial",
      signatureData,
      signatureType: type,
    };

    const newElements = [...elements, newElement];
    updateElementsWithHistory(newElements);
    setActiveTool("select");
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Reset all elements
  const handleReset = () => {
    const newElements: PDFElement[] = [];
    updateElementsWithHistory(newElements);
    setActiveTool("select");
    toast.success("All elements cleared");
  };

  // Save functionality
  const handleSave = async () => {
    if (!uploadedFileId || elements.length === 0) {
      toast.error("No file uploaded or no elements to save");
      return;
    }

    setIsSaving(true);

    try {
      // Get the first signature element for the API call
      const signatureElement = elements.find((el) => el.type === "signature");

      if (!signatureElement) {
        toast.error("No signature found to save");
        return;
      }

      const response = await djangoAPI.signPDF(
        uploadedFileId,
        signatureElement.signatureData || signatureElement.content
      );

      if (response.success) {
        toast.success("Document saved to My Files successfully!");
        // Reset the form
        setElements([]);
        setHistory([]);
        setHistoryIndex(-1);
        setActiveTool("select");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${handleAPIError(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Download functionality
  const handleDownload = async () => {
    if (!uploadedFileId) {
      toast.error("No file to download");
      return;
    }

    try {
      // First save the signed PDF, then download it
      await handleSave();

      // Use real file download with signed filename
      const filename =
        uploadedFile?.name.replace(".pdf", "_signed.pdf") ||
        "signed_document.pdf";

      await realFileDownload("fillsign", filename);
    } catch (error) {
      console.error("Download failed:", error);
      // Error handling is already done in realFileDownload
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Fill & Sign
            </h1>
            <p className="text-slate-600">
              Upload a PDF document and add interactive signatures, text, and
              other elements
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {uploadedFile ? (
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Upload className="h-8 w-8 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">
                          No file selected
                        </p>
                        <p className="text-sm text-slate-500">
                          Upload a PDF to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant={uploadedFile ? "outline" : "default"}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedFile ? "Replace File" : "Upload PDF"}
                  </Button>

                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Choose from My Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Editor Canvas */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] overflow-hidden relative">
                <CardContent className="p-0 h-full relative">
                  <div className="pdf-editable-area w-full h-full relative overflow-auto">
                    <PDFCanvas
                      pdfUrl={pdfUrl}
                      elements={elements}
                      activeTool={activeTool}
                      onElementsChange={handleElementsChange}
                      onElementAdd={handleElementAdd}
                      className="absolute top-0 left-0"
                    />
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Tools Panel */}
            <div className="space-y-6">
              {/* Tools */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Tools</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant={activeTool === tool.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolSelect(tool.id)}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                      >
                        <tool.icon className="h-4 w-4" />
                        <span className="text-xs">{tool.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="w-full justify-start"
                    >
                      <Undo className="mr-2 h-4 w-4" />
                      Undo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="w-full justify-start"
                    >
                      <Redo className="mr-2 h-4 w-4" />
                      Redo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={elements.length === 0}
                      className="w-full justify-start"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Save & Download */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">Export</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={handleSave}
                      disabled={
                        !uploadedFile || elements.length === 0 || isSaving
                      }
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to My Files
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      disabled={!uploadedFile || elements.length === 0}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Signed PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Instructions
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>• Upload a PDF file to begin</p>
                    <p>• Select a tool and click on the PDF to add elements</p>
                    <p>• Drag elements to move them</p>
                    <p>• Drag corners to resize elements</p>
                    <p>• Use the green handle to rotate elements</p>
                    <p>• Press Delete key to remove selected elements</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSignatureCreate={handleSignatureCreate}
        elementType={signatureModalType}
      />

      <Footer />
    </div>
  );
};

export default FillSign;