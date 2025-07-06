import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { DocumentEditor } from "@/components/document-editor";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { realFileDownload } from "@/utils/realFileDownload";
import { djangoAPI, handleAPIError } from "@/lib/api";
import { HelpTooltip } from "@/components/ui/help-tooltip";

import { savePDFToMyFiles } from "@/utils/myFilesUpload";


/**
 * CreatePDF - Advanced document creation page with Word-style editor
 * Features full rich text editing, image insertion, tables, and auto page breaks.
 */
const CreatePDF = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  // 🧹 La intrarea în pagină, curățăm orice text salvat anterior
  useEffect(() => {
    localStorage.removeItem("document_draft");
    localStorage.removeItem("document_draft_timestamp");
  }, []);

  // 🧾 Salvează documentul în "My Files"
  const handleSaveToMyFiles = async (content: string) => {
  const token = localStorage.getItem("authToken");

  if (!content || content.trim() === "<p></p>") {
    toast.error("Document is empty. Please add some content before saving.");
    return;
  }

  const textContent = content.replace(/<[^>]*>/g, "").trim();
  const title = textContent.slice(0, 50) + (textContent.length > 50 ? "..." : "") || "Untitled Document";

  try {
    const response = await fetch("http://localhost:8000/api/create/free/basic/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to generate PDF.");
    }

    const blob = await response.blob();
    setGeneratedBlob(blob); // opțional: îl salvezi și în state

    const file = new File([blob], `${title}.pdf`, {
      type: blob.type,
      lastModified: Date.now(),
    });

    const uploadResponse = await savePDFToMyFiles(file, token);

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      throw new Error(uploadError || "Upload failed.");
    }

    toast.success("Document successfully saved to My Files!");
  } catch (error: any) {
    console.error("Save error:", error);
    toast.error(`Save failed: ${error.message || "Unexpected error"}`);
  }
};

  const handleDownload = async (content: string) => {
    setIsSaving(true);
    try {
      if (!content || content.trim() === "<p></p>") {
        toast.error("Document is empty. Please add some content before downloading.");
        return;
      }

      const textContent = content.replace(/<[^>]*>/g, "").trim();
      const title = textContent.slice(0, 50) + (textContent.length > 50 ? "..." : "") || "Untitled Document";

      const token = localStorage.getItem("authToken");
      console.log("🔐 Token trimis:", token); // Debug

      // Correct backend endpoint for create PDF (matches backend: path('api/create/free/basic/', ...))
      const response = await fetch("http://localhost:8000/api/create/free/basic/", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate PDF.");
      }

      const blob = await response.blob();
      setGeneratedBlob(blob); // Save blob for My Files upload
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `created_document.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // 🧹 Curățăm draftul local după descărcare
      localStorage.removeItem("document_draft");
      localStorage.removeItem("document_draft_timestamp");

      toast.success("Document downloaded successfully!");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(`Download failed: ${error.message || "Unexpected error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen px-6">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create PDF Document</h1>
            <p className="text-slate-600 mt-1">
              Create professional documents with full text formatting, images, and tables
            </p>
          </div>

          <HelpTooltip
            title="How to use the Create PDF editor"
            steps={[
              { content: "Click anywhere on the page to start typing" },
              { content: "Use Ctrl+B, Ctrl+I, Ctrl+U for quick formatting" },
              { content: "Drag & drop images directly into the document" },
              { content: "Use the toolbar to insert tables and adjust formatting" },
              { content: "Documents auto-save every 30 seconds" },
            ]}
            position="top-right"
          />
        </div>

        {/* Editor */}
        <DocumentEditor
          onSave={handleSaveToMyFiles}
          onDownload={handleDownload}
          isSaving={isSaving}
          title="New Document"
          showPageNumbers={true}
          header={<div className="text-center text-sm text-slate-500">ALTech PDF Document</div>}
          className="h-full"
        />
      </main>

      <Footer />
    </div>
  );
};

export default CreatePDF;
