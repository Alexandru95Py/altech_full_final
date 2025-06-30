import React, { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { DocumentPage } from "./DocumentPage";
import { RichTextEditor } from "./RichTextEditor";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onDownload?: (content: string) => void;
  isSaving?: boolean;
  className?: string;
  title?: string;
  showPageNumbers?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * DocumentEditor - Main document editor container
 * Manages multiple pages and document-wide functionality
 */
export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialContent = "",
  onSave,
  onDownload,
  isSaving = false,
  className,
  title = "Untitled Document",
  showPageNumbers = true,
  header,
  footer,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [content, setContent] = useState(initialContent);
  const [pageCount, setPageCount] = useState(1);

  // Handle editor ready
  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  // Handle content updates
  const handleContentUpdate = useCallback((newContent: string) => {
    setContent(newContent);

    // Simple page count estimation based on content length
    // In a real implementation, you'd measure the actual rendered height
    const estimatedPages = Math.max(1, Math.ceil(newContent.length / 3000));
    setPageCount(estimatedPages);
  }, []);

  // Handle save action
  const handleSave = useCallback(() => {
    if (onSave && content) {
      onSave(content);
    }
  }, [onSave, content]);

  // Handle download action
  const handleDownload = useCallback(() => {
    if (onDownload && content) {
      onDownload(content);
    }
  }, [onDownload, content]);

  // Auto-save functionality (optional)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (content && content.length > 0) {
        // Auto-save to localStorage
        localStorage.setItem("document_draft", content);
        localStorage.setItem("document_draft_timestamp", Date.now().toString());
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [content]);

  // Load draft on mount
  useEffect(() => {
    if (!initialContent) {
      const draft = localStorage.getItem("document_draft");
      const timestamp = localStorage.getItem("document_draft_timestamp");

      if (draft && timestamp) {
        const draftAge = Date.now() - parseInt(timestamp);
        // Load draft if it's less than 24 hours old
        if (draftAge < 24 * 60 * 60 * 1000) {
          setContent(draft);
          if (editor) {
            editor.commands.setContent(draft);
          }
        }
      }
    }
  }, [initialContent, editor]);

  return (
    <div className={cn("document-editor-container", className)}>
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onSave={handleSave}
        onDownload={handleDownload}
        isSaving={isSaving}
      />

      {/* Document Area */}
      <div className="document-area bg-slate-100 min-h-screen py-8">
        <div className="max-w-none">
          {/* Generate pages based on content */}
          {Array.from({ length: pageCount }, (_, index) => (
            <DocumentPage
              key={index}
              pageNumber={index + 1}
              showPageNumber={showPageNumbers}
              header={header}
              footer={footer}
              className={index === 0 ? "" : "mt-8"}
            >
              {index === 0 ? (
                // First page contains the editor
                <RichTextEditor
                  content={content}
                  onUpdate={handleContentUpdate}
                  onEditorReady={handleEditorReady}
                  placeholder="Click here to start typing your document..."
                  className="min-h-full"
                />
              ) : (
                // Additional pages (for visual representation)
                <div className="min-h-full flex items-center justify-center text-slate-400">
                  <p>Page {index + 1} content continues here...</p>
                </div>
              )}
            </DocumentPage>
          ))}
        </div>
      </div>

      {/* Document Statistics */}
      <div className="document-stats fixed bottom-4 right-4 bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-sm text-slate-600">
        <div className="flex items-center gap-4">
          <span>Pages: {pageCount}</span>
          <span>
            Words:{" "}
            {
              content
                .replace(/<[^>]*>/g, "")
                .split(/\s+/)
                .filter(Boolean).length
            }
          </span>
          <span>Characters: {content.replace(/<[^>]*>/g, "").length}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
