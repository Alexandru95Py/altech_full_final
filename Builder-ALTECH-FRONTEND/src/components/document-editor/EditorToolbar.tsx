import React, { useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image,
  Table,
  Undo,
  Redo,
  Save,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
  onSave?: () => void;
  onDownload?: () => void;
  isSaving?: boolean;
  className?: string;
}

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
];

const FONT_SIZES = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "32",
  "36",
  "48",
  "72",
];

/**
 * EditorToolbar - Rich text formatting controls for the document editor
 * Supports all major text formatting options with keyboard shortcuts
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onSave,
  onDownload,
  isSaving = false,
  className,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleImageInsert = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = "";
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const setFontFamily = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
  };

  const setFontSize = (size: string) => {
    // Custom font size implementation
    editor
      .chain()
      .focus()
      .setMark("textStyle", { fontSize: `${size}px` })
      .run();
  };

  return (
    <div
      className={cn(
        "editor-toolbar bg-white border-b border-slate-200 p-4 sticky top-16 z-10",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* File Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Font Family */}
        <Select
          value={
            editor.getAttributes("textStyle").fontFamily || "Arial, sans-serif"
          }
          onValueChange={setFontFamily}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select
          value={
            editor.getAttributes("textStyle").fontSize?.replace("px", "") ||
            "14"
          }
          onValueChange={setFontSize}
        >
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-8" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("underline") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <Button
            variant={
              editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageInsert}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            title="Insert Image"
          >
            <Image className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={insertTable}
            title="Insert Table"
          >
            <Table className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
