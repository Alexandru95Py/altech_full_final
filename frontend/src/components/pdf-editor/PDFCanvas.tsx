import React, { useState, useRef, useCallback, useEffect } from "react";
import { InteractiveElement, PDFElement } from "./InteractiveElement";
import { cn } from "@/lib/utils";

interface PDFCanvasProps {
  pdfUrl: string | null;
  elements: PDFElement[];
  activeTool: string | null;
  onElementsChange: (elements: PDFElement[]) => void;
  onElementAdd: (element: Omit<PDFElement, "id">) => void;
  className?: string;
  pageNumber?: number; // Use pageNumber for clarity
  onToolReset?: () => void;
  onRequestSignatureAt?: (x: number, y: number, type: 'signature' | 'initial') => void;
  scale?: number;
}

/**
 * PDFCanvas - Interactive canvas for PDF editing with element management
 */
export const PDFCanvas: React.FC<PDFCanvasProps> = ({
  pdfUrl,
  elements,
  activeTool,
  onElementsChange,
  onElementAdd,
  className,
  pageNumber = 1,
  onToolReset,
  onRequestSignatureAt,
  scale = 1,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [containerBounds, setContainerBounds] = useState<DOMRect>(
    new DOMRect(0, 0, 800, 600),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container bounds when size changes
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setContainerBounds(containerRef.current.getBoundingClientRect());
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  // Handle clicking on the PDF canvas to add elements
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeTool) return;
      if (e.target !== e.currentTarget) return;
      if (activeTool === "delete") return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xRatio = x / rect.width;
      const yRatio = y / rect.height;

      // For signature/initial, delegate to parent for modal
      if (activeTool === "signature" || activeTool === "initial") {
        if (typeof onRequestSignatureAt === 'function') {
          onRequestSignatureAt(x, y, activeTool);
        }
        if (onToolReset) onToolReset();
        return;
      }

      // Default dimensions for different element types
      const getDefaultSize = (type: string) => {
        switch (type) {
          case "text":
            return { width: 100, height: 30 };
          case "date":
            return { width: 100, height: 25 };
          default:
            return { width: 100, height: 30 };
        }
      };

      const size = getDefaultSize(activeTool);

      let content = "";
      if (activeTool === "text") {
        content = "New text";
      } else if (activeTool === "date") {
        content = new Date().toLocaleDateString();
      }

      const newElement: Omit<PDFElement, "id"> = {
        type: activeTool as PDFElement["type"],
        x: Math.max(0, Math.min(x - size.width / 2, rect.width - size.width)),
        y: Math.max(0, Math.min(y - size.height / 2, rect.height - size.height)),
        xRatio,
        yRatio,
        width: size.width,
        height: size.height,
        rotation: 0,
        content: "New text",
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
      };

      onElementAdd(newElement);
      if (onToolReset) onToolReset();
    },
    [activeTool, onElementAdd, onToolReset, onRequestSignatureAt],
  );

  // Handle element updates
  const handleElementUpdate = useCallback(
    (id: string, updates: Partial<PDFElement>) => {
      const updatedElements = elements.map((element) =>
        element.id === id ? { ...element, ...updates } : element,
      );
      onElementsChange(updatedElements);
    },
    [elements, onElementsChange],
  );

  // Handle element deletion
  const handleElementDelete = useCallback(
    (id: string) => {
      const updatedElements = elements.filter((element) => element.id !== id);
      onElementsChange(updatedElements);
      setSelectedElementId(null);
    },
    [elements, onElementsChange],
  );

  // Handle element selection and delete tool
  const handleElementSelect = useCallback(
    (id: string) => {
      if (activeTool === "delete") {
        handleElementDelete(id);
        // Reset tool after delete
        if (typeof window !== "undefined") {
          const event = new CustomEvent("pdfcanvas-tool-reset");
          window.dispatchEvent(event);
        }
      } else {
        setSelectedElementId(id);
      }
    },
    [activeTool, handleElementDelete],
  );

  // Clear selection when clicking on canvas
  const handleCanvasClickCapture = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setSelectedElementId(null);
      }
    },
    [],
  );

  // Keyboard shortcuts
  // (Removed: window.setActiveTool and tool reset event listener, now handled via onToolReset prop)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElementId) {
        switch (e.key) {
          case "Delete":
          case "Backspace":
            e.preventDefault();
            handleElementDelete(selectedElementId);
            break;
          case "Escape":
            e.preventDefault();
            setSelectedElementId(null);
            break;
          case "ArrowUp":
            e.preventDefault();
            handleElementUpdate(selectedElementId, {
              y: Math.max(
                0,
                elements.find((el) => el.id === selectedElementId)?.y! - 1,
              ),
            });
            break;
          case "ArrowDown":
            e.preventDefault();
            handleElementUpdate(selectedElementId, {
              y: Math.min(
                containerBounds.height - 30,
                elements.find((el) => el.id === selectedElementId)?.y! + 1,
              ),
            });
            break;
          case "ArrowLeft":
            e.preventDefault();
            handleElementUpdate(selectedElementId, {
              x: Math.max(
                0,
                elements.find((el) => el.id === selectedElementId)?.x! - 1,
              ),
            });
            break;
          case "ArrowRight":
            e.preventDefault();
            handleElementUpdate(selectedElementId, {
              x: Math.min(
                containerBounds.width - 30,
                elements.find((el) => el.id === selectedElementId)?.x! + 1,
              ),
            });
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    elements,
    containerBounds,
    handleElementUpdate,
    handleElementDelete,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-white overflow-hidden cursor-crosshair",
        activeTool && activeTool !== "delete" && "cursor-crosshair",
        !activeTool && "cursor-default",
        className,
      )}
      onClick={handleCanvasClick}
      onClickCapture={handleCanvasClickCapture}
    >
      {/* PDF Background */}
      {pdfUrl ? (
        <>
  <iframe
    key={pageNumber}
    src={`${pdfUrl}#page=${pageNumber}`}
    className="w-full h-full border-0 pointer-events-none absolute top-0 left-0"
    title={`PDF Preview Page ${pageNumber}`}
  />
  <div
    className="absolute top-0 left-0 w-full h-full"
    onClick={handleCanvasClick}
    onClickCapture={handleCanvasClickCapture}
  />
</>

      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">No PDF loaded</p>
            <p className="text-sm">Upload a PDF to start editing</p>
          </div>
        </div>
      )}

      {/* Interactive Elements Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {elements.map((element) => (
          <div key={element.id} className="pointer-events-auto">
            <InteractiveElement
              element={element}
              isSelected={selectedElementId === element.id}
              onUpdate={handleElementUpdate}
              onSelect={handleElementSelect}
              onDelete={handleElementDelete}
              containerBounds={containerBounds}
            />
          </div>
        ))}
      </div>

      {/* Tool instruction overlay */}
      {activeTool && activeTool !== "delete" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 pointer-events-none">
          <p className="text-sm font-medium">
            Click anywhere on the PDF to place {activeTool}
          </p>
        </div>
      )}

      {/* Selection instructions */}
      {selectedElementId && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-10 pointer-events-none">
          <p className="text-xs">
            Drag to move • Drag corners to resize • Use green handle to rotate •
            Press Delete to remove
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFCanvas;
