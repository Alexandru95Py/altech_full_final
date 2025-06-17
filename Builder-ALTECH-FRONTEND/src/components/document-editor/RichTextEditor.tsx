import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

/**
 * RichTextEditor - Advanced rich text editor using Tiptap
 * Supports full document editing with automatic page breaks
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onUpdate,
  onEditorReady,
  placeholder = "Start typing your document...",
  className,
  editable = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 50,
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "leading-relaxed",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc list-inside space-y-1",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal list-inside space-y-1",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
        allowBase64: true,
        inline: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-slate-300 w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-slate-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-slate-300 bg-slate-50 font-semibold p-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-slate-300 p-2",
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate max-w-none focus:outline-none",
          "min-h-[calc(1123px-192px)]", // Adjust for page margins
          "leading-relaxed",
          // Custom prose styles for document-like appearance
          "prose-p:my-3 prose-p:leading-relaxed",
          "prose-h1:text-2xl prose-h1:font-bold prose-h1:my-4",
          "prose-h2:text-xl prose-h2:font-semibold prose-h2:my-3",
          "prose-h3:text-lg prose-h3:font-medium prose-h3:my-2",
          "prose-ul:my-3 prose-ol:my-3",
          "prose-li:my-1",
          "prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-table:my-4",
          "prose-img:my-4 prose-img:mx-auto",
        ),
        spellcheck: "true",
        ...(placeholder && {
          "data-placeholder": placeholder,
        }),
      },
      handleDrop: (view, event, slice, moved) => {
        // Handle image drops
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/"),
        );

        if (imageFiles.length > 0) {
          event.preventDefault();

          imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target?.result as string;
              const { schema } = view.state;
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (pos) {
                const node = schema.nodes.image.create({ src: imageUrl });
                const transaction = view.state.tr.insert(pos.pos, node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
          });

          return true;
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        // Custom keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case "b":
              event.preventDefault();
              editor?.chain().focus().toggleBold().run();
              return true;
            case "i":
              event.preventDefault();
              editor?.chain().focus().toggleItalic().run();
              return true;
            case "u":
              event.preventDefault();
              editor?.chain().focus().toggleUnderline().run();
              return true;
            case "z":
              if (event.shiftKey) {
                event.preventDefault();
                editor?.chain().focus().redo().run();
              } else {
                event.preventDefault();
                editor?.chain().focus().undo().run();
              }
              return true;
            case "y":
              event.preventDefault();
              editor?.chain().focus().redo().run();
              return true;
          }
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Auto-scroll to cursor when typing near page boundaries
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Check if cursor is near bottom of viewport
        if (rect.bottom > window.innerHeight - 100) {
          setTimeout(() => {
            rect.top &&
              window.scrollTo({
                top: window.scrollY + rect.top - window.innerHeight / 2,
                behavior: "smooth",
              });
          }, 50);
        }
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  return (
    <div ref={contentRef} className={cn("rich-text-editor", className)}>
      <EditorContent
        editor={editor}
        className="focus-within:ring-0 focus-within:outline-none"
      />

      {/* Custom styles for placeholder */}
      <style jsx>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgb(148 163 184);
          pointer-events: none;
          height: 0;
        }

        .ProseMirror {
          line-height: 1.6;
          font-size: 14px;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          border-radius: 6px;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          overflow: hidden;
        }

        .ProseMirror table td,
        .ProseMirror table th {
          min-width: 1em;
          border: 1px solid #cbd5e1;
          padding: 8px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .ProseMirror table th {
          background-color: #f8fafc;
          font-weight: 600;
        }

        .ProseMirror table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.15);
          pointer-events: none;
        }

        /* Page break simulation */
        .ProseMirror .page-break {
          page-break-before: always;
          break-before: page;
          margin-top: 2rem;
          border-top: 2px dashed #cbd5e1;
          padding-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
