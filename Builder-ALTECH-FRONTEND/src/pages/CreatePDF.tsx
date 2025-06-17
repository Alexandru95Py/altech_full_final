import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { DocumentEditor } from "@/components/document-editor";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { realFileDownload } from "@/utils/realFileDownload";
import { djangoAPI, handleAPIError } from "@/lib/api";

/**
 * CreatePDF - Advanced document creation page with Word-style editor
 * Features full rich text editing, image insertion, tables, and automatic page breaks
 */
const CreatePDF = () => {
  const [isSaving, setIsSaving] = useState(false);

  // Handle save to backend
  const handleSave = async (content: string) => {
    if (!content || content.trim() === "<p></p>") {
      toast.error("Document is empty. Please add some content before saving.");
      return;
    }

    setIsSaving(true);

    try {
      // Extract text for title (first few words)
      const textContent = content.replace(/<[^>]*>/g, "").trim();
      const title =
        textContent.slice(0, 50) + (textContent.length > 50 ? "..." : "") ||
        "Untitled Document";

      const response = await djangoAPI.createBasicPDF({
        title,
        content,
        format: "A4",
      });

      if (response.success) {
        toast.success("Document saved to My Files successfully!");

        // Clear draft after successful save
        localStorage.removeItem("document_draft");
        localStorage.removeItem("document_draft_timestamp");
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${handleAPIError(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle download
  const handleDownload = async (content: string) => {
    if (!content || content.trim() === "<p></p>") {
      toast.error(
        "Document is empty. Please add some content before downloading.",
      );
      return;
    }

    try {
      // For now, save and then attempt download
      // In a real implementation, you might want a separate download endpoint
      await handleSave(content);

      // Download real PDF file
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `created_document_${timestamp}.pdf`;

      // Use real file download system
      await realFileDownload("create", filename);

      toast.success("Document downloaded successfully as PDF!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Create PDF Document
              </h1>
              <p className="text-slate-600 mt-1">
                Create professional documents with full text formatting, images,
                and tables
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-saving enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Editor */}
        <DocumentEditor
          onSave={handleSave}
          onDownload={handleDownload}
          isSaving={isSaving}
          title="New Document"
          showPageNumbers={true}
          header={
            <div className="text-center text-sm text-slate-500">
              ALTech PDF Document
            </div>
          }
          className="h-full"
        />
      </main>

      <Footer />

      {/* Help Text */}
      <div className="fixed bottom-4 left-80 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md shadow-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          💡 Tips for using the editor:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click anywhere on the page to start typing</li>
          <li>• Use Ctrl+B, Ctrl+I, Ctrl+U for quick formatting</li>
          <li>• Drag & drop images directly into the document</li>
          <li>• Use the toolbar to insert tables and adjust formatting</li>
          <li>• Documents auto-save every 30 seconds</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePDF;
