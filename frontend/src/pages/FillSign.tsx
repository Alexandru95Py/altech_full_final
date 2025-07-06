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
import { savePDFToMyFiles } from "@/utils/myFilesUpload";
import { isMockMode } from "@/config/mockMode";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
// Set PDF.js worker source to local worker to avoid CORS issues
GlobalWorkerOptions.workerSrc = pdfjsWorker;
import {
  generateMockUploadResponse,
  generateMockFillSignResponse,
  createMockDownloadBlob,
} from "@/lib/mockData";
import { PDFCanvas, SignatureModal, PDFElement } from "@/components/pdf-editor";

// Extend PDFElement to include page property
type PDFElementWithPage = PDFElement & { page: number };
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  // PDF scale state for zoom controls
  const [pdfScale, setPdfScale] = useState(1);

  // Core state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [elements, setElements] = useState<PDFElementWithPage[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  // ...existing code...
  const [previewPages, setPreviewPages] = useState<string[]>([]);


  // Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureModalType, setSignatureModalType] = useState<"signature" | "initial">("signature");
  const [pendingSignaturePos, setPendingSignaturePos] = useState<{ x: number; y: number; type: "signature" | "initial" } | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<PDFElementWithPage[][]>([]);
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
  if (!canUpload(file.size)) return;

  const url = URL.createObjectURL(file);
  setPdfUrl(url);

  try {
    // 🔍 Încarcă fișierul PDF și determină numărul total de pagini
    const loadingTask = getDocument(url);
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    setPdfPageCount(totalPages);
    setCurrentPage(1);

    // 🖼 Generează preview-uri PNG pentru fiecare pagină
    const previews: string[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.3 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context!, viewport }).promise;
      previews.push(canvas.toDataURL("image/png"));
    }
    setPreviewPages(previews); // ✅ actualizează bara de preview

    // 🎯 Reset tool-uri și stări
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
    setActiveTool("select");

    // 🧪 Upload mock
    if (isMockMode()) {
      const response = generateMockUploadResponse(file);
      setUploadedFile(file);
      setUploadedFileId(response.data.id);
      toast.success("[MOCK] PDF uploaded successfully!");
      return;
    }

    // 🚀 Upload real către backend
    const response = await djangoAPI.uploadFile(file);
    if (response.success && response.data) {
      setUploadedFile(file);
      setUploadedFileId(response.data.id);
      toast.success("PDF uploaded successfully!");
    }

  } catch (error) {
    console.error("File upload or PDF processing failed:", error);
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
  const updateElementsWithHistory = (newElements: PDFElementWithPage[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setElements(newElements);
  };

  // Handle element changes
  const handleElementsChange = (newElements: PDFElementWithPage[]) => {
    setElements(newElements);
  };

  // Add new element
  const handleElementAdd = (elementData: Omit<PDFElementWithPage, "id">) => {
    const newElement: PDFElementWithPage = {
      ...elementData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      page: currentPage,
    };
    const newElements = [...elements, newElement];
    updateElementsWithHistory(newElements);
    setActiveTool("select"); // Switch to select tool after adding
  };

  // Handle signature creation at a specific position
  const handleSignatureCreate = (
    signatureData: string,
    inputType: "draw" | "upload" | "type",
  ) => {
    if (!pendingSignaturePos) return;
    const { x, y, type } = pendingSignaturePos;
    const width = type === "signature" ? 150 : 75;
    const height = 50;
    // Get the current PDF container size for ratio calculation
    const container = document.querySelector('.pdf-active-page-area') as HTMLElement;
    const rect = container?.getBoundingClientRect();
    let xRatio = 0, yRatio = 0;
    if (rect) {
      xRatio = x / rect.width;
      yRatio = y / rect.height;
    }
    const newElement: PDFElementWithPage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      x: Math.max(0, x - width / 2),
      y: Math.max(0, y - height / 2),
      xRatio,
      yRatio,
      width,
      height,
      rotation: 0,
      content: type === "signature" ? "Signature" : "Initial",
      signatureData,
      signatureType: inputType,
      page: currentPage,
    };
    const newElements = [...elements, newElement];
    updateElementsWithHistory(newElements);
    setActiveTool(null);
    setPendingSignaturePos(null);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1] as PDFElementWithPage[]);
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1] as PDFElementWithPage[]);
    }
  };

  // Reset all elements
  const handleReset = () => {
    const newElements: PDFElementWithPage[] = [];
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
    // ...removed isSaving logic...
    if (isMockMode()) {
      // Mock save logic
      setTimeout(() => {
        toast.success("[MOCK] Document saved to My Files successfully!");
        setElements([]);
        setHistory([]);
        setHistoryIndex(-1);
        setActiveTool("select");
        // ...removed isSaving logic...
      }, 500);
      return;
    }
    try {
      // Real save
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
        setElements([]);
        setHistory([]);
        setHistoryIndex(-1);
        setActiveTool("select");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${handleAPIError(error)}`);
    } finally {
      // ...removed isSaving logic...
    }
  };


  // Download filled PDF (SplitPDF logic)
  const handleDownload = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a PDF before downloading.");
      return;
    }
    if (elements.length === 0) {
      toast.error("No elements added to the PDF.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      // Only send elements with valid data
      const filteredElements = elements.filter(el => {
        if (el.type === "signature" || el.type === "initial") {
          return typeof el.signatureData === "string" && el.signatureData.startsWith("data:image/");
        }
        return true;
      });
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("mode", "download");

      // Removed invalid Python/Django line: mode is handled on the backend


      formData.append("elements", JSON.stringify(filteredElements));
      const response = await fetch("http://localhost:8000/fill-and-sign/download/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "filled_elements.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Modified PDF downloaded successfully!");
    } catch (error) {
      toast.error("Download failed. Please try again.");
      console.error("[ERROR] Download failed:", error);
    }
  };

  // Save filled PDF to My Files (SplitPDF logic)
  const handleSaveToMyFiles = async () => {
    const token = localStorage.getItem("authToken");
    if (!uploadedFile || elements.length === 0) {
      toast.error("No file or elements to save");
      return;
    }
    // Prepare the filled PDF as a Blob by calling the backend (same as download, but get Blob)
    const filteredElements = elements.filter(el => {
      if (el.type === "signature" || el.type === "initial") {
        return typeof el.signatureData === "string" && el.signatureData.startsWith("data:image/");
      }
      return true;
    });
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("elements", JSON.stringify(filteredElements));
    formData.append("mode", "save");

    try {
      const response = await fetch("http://localhost:8000/fill-and-sign/download/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to generate filled PDF");
      }
      const blob = await response.blob();
      const filledFile = new File([blob], uploadedFile.name.replace(/\.pdf$/i, "_filled.pdf"), { type: "application/pdf" });
      const saveResp = await savePDFToMyFiles(filledFile, token);
      if (saveResp.ok) {
        toast.success("Filled PDF saved to My Files!");
      } else {
        toast.error("Failed to save to My Files");
      }
    } catch (err) {
      console.error("Save to My Files failed:", err);
      toast.error("Save to My Files failed");
    }
  };

  return (
<>
  <div className="min-h-screen bg-slate-50">
    <Sidebar />
    <Header />

    <main className="ml-60 pt-16 min-h-screen px-6">
      {/* Download & Save Buttons at the top */}
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={handleDownload} variant="default" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Filled PDF
        </Button>
        <Button
          onClick={handleSaveToMyFiles}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save to My Files
        </Button>
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Fill & Sign</h1>
        <p className="text-slate-600">
          Upload a PDF document and add interactive signatures, text, and other elements
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
                    <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">No file selected</p>
                    <p className="text-sm text-slate-500">Upload a PDF to get started</p>
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
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {uploadedFile ? "Replace File" : "Upload PDF"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Sidebar 1/3: Dynamic PDF page previews */}
        <div className="col-span-1">
          <div className="preview-sidebar h-[700px] overflow-y-scroll bg-slate-100 p-2 border rounded-md shadow-sm">
            {previewPages.length > 0 ? (
              previewPages.map((thumb, i) => (
                <div
                  key={i}
                  className={`mb-2 h-[100px] bg-white border shadow-sm flex items-center justify-center text-sm text-slate-700 cursor-pointer hover:bg-slate-200 transition-all duration-150 ${currentPage === i + 1 ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ position: 'relative' }}
                >
                  <img
                    src={thumb}
                    alt={`Page ${i + 1}`}
                    className="max-h-[90px] max-w-full object-contain rounded"
                    style={{ boxShadow: currentPage === i + 1 ? '0 0 0 2px #3b82f6' : undefined }}
                  />
                  <span
                    className="absolute bottom-1 right-2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded shadow"
                    style={{ opacity: 0.85 }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-center mt-10">No PDF loaded</div>
            )}
          </div>
        </div>
        {/* PDF Editor Canvas 2/3: Show selected page */}
        <div className="col-span-3">
          {/* PDF Toolbar: Only page numbering and zoom controls */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 rounded-t-md" style={{ minHeight: 48 }}>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">
                Page {currentPage} / {pdfPageCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full bg-white border border-slate-300 px-2 py-1 text-lg font-bold text-slate-700 hover:bg-slate-200 transition"
                aria-label="Zoom out"
                onClick={() => setPdfScale((s) => Math.max(0.5, s - 0.1))}
                type="button"
              >
                –
              </button>
              <span className="text-sm w-12 text-center select-none">{Math.round(pdfScale * 100)}%</span>
              <button
                className="rounded-full bg-white border border-slate-300 px-2 py-1 text-lg font-bold text-slate-700 hover:bg-slate-200 transition"
                aria-label="Zoom in"
                onClick={() => setPdfScale((s) => Math.min(2, s + 0.1))}
                type="button"
              >
                +
              </button>
            </div>
          </div>
          <Card className="overflow-hidden relative flex items-center justify-center h-[652px]">
            <CardContent className="p-0 h-full w-full relative flex items-center justify-center">
              <div className="pdf-editable-area relative overflow-auto w-full h-full flex items-center justify-center">
                <div
                  className="pdf-active-page-area bg-white shadow-lg border border-gray-300 overflow-hidden flex items-center justify-center"
                  style={{
                    // True A4 at 96 DPI: 794x1123px
                    width: '100%',
                    height: '100%',
                    aspectRatio: '1 / 1.4142',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    margin: '0 auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb', // Tailwind gray-200
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 794 * pdfScale,
                      height: 1123 * pdfScale,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      aspectRatio: '1 / 1.4142',
                      position: 'relative',
                      overflow: 'visible',
                      background: 'transparent',
                      transition: 'width 0.2s, height 0.2s',
                    }}
                  >
                    <PDFCanvas
                      pdfUrl={pdfUrl}
                      elements={elements}
                      activeTool={activeTool}
                      onElementsChange={handleElementsChange}
                      onElementAdd={(element) => {
                        setElements((prev) => [
                          ...prev,
                          { ...element, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), page: currentPage },
                        ]);
                      }}
                      className="w-full h-full"
                      pageNumber={currentPage}
                      scale={pdfScale}
                      onToolReset={() => setActiveTool(null)}
                      onRequestSignatureAt={(x, y, type) => {
                        setSignatureModalType(type);
                        setPendingSignaturePos({ x, y, type });
                        setIsSignatureModalOpen(true);
                      }}
                    />
                    {/* Optional: A4 label overlay */}
                    <span style={{
                      position: 'absolute',
                      top: 8,
                      right: 12,
                      background: 'rgba(243,244,246,0.85)', // Tailwind gray-100
                      color: '#374151', // Tailwind gray-700
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 6,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}>A4 (794×1123px @ 96 DPI)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Panel 2/6 */}
        <div className="col-span-2 space-y-6">
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
                    onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <tool.icon className="h-4 w-4" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setPendingSignaturePos(null);
        }}
        onSignatureCreate={(signatureData, inputType) => {
          // Only add if valid base64 image string
          if (typeof signatureData === "string" && signatureData.startsWith("data:image/")) {
            handleSignatureCreate(signatureData, inputType);
          } else {
            toast.error("Invalid or empty signature. Please draw or upload a signature.");
          }
          setIsSignatureModalOpen(false);
          setPendingSignaturePos(null);
        }}
        elementType={signatureModalType}
      />
    </main>

    <Footer />
  </div>
</>
  );
};

export default FillSign;