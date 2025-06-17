import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RotateCw, Move, Trash2 } from "lucide-react";

export interface PDFElement {
  id: string;
  type: "text" | "signature" | "initial" | "date";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  signatureData?: string;
  signatureType?: "draw" | "upload" | "type";
}

interface InteractiveElementProps {
  element: PDFElement;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<PDFElement>) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  containerBounds: DOMRect;
  className?: string;
}

interface ResizeHandle {
  position: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";
  cursor: string;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { position: "nw", cursor: "nw-resize" },
  { position: "ne", cursor: "ne-resize" },
  { position: "sw", cursor: "sw-resize" },
  { position: "se", cursor: "se-resize" },
  { position: "n", cursor: "n-resize" },
  { position: "s", cursor: "s-resize" },
  { position: "e", cursor: "e-resize" },
  { position: "w", cursor: "w-resize" },
];

/**
 * InteractiveElement - Fully interactive PDF element with move, resize, and rotate capabilities
 */
export const InteractiveElement: React.FC<InteractiveElementProps> = ({
  element,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  containerBounds,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target !== elementRef.current &&
        !elementRef.current?.contains(e.target as Node)
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      onSelect(element.id);

      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) return;

      setIsDragging(true);
      setDragStart({
        x: e.clientX - element.x,
        y: e.clientY - element.y,
      });
    },
    [element.id, element.x, element.y, onSelect],
  );

  // Handle resize handle mouse down
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  // Handle rotation start
  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(
            containerBounds.width - element.width,
            e.clientX - dragStart.x,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            containerBounds.height - element.height,
            e.clientY - dragStart.y,
          ),
        );

        onUpdate(element.id, { x: newX, y: newY });
      } else if (isResizing && resizeHandle) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = element.width;
        let newHeight = element.height;
        let newX = element.x;
        let newY = element.y;

        const aspectRatio = element.width / element.height;
        const isImage = element.type === "signature" && element.signatureData;

        switch (resizeHandle) {
          case "se":
            newWidth = Math.max(20, element.width + deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(20, element.height + deltaY);
            }
            break;
          case "sw":
            newWidth = Math.max(20, element.width - deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(20, element.height + deltaY);
            }
            newX = element.x + (element.width - newWidth);
            break;
          case "ne":
            newWidth = Math.max(20, element.width + deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
              newY = element.y + (element.height - newHeight);
            } else {
              newHeight = Math.max(20, element.height - deltaY);
              newY = element.y + (element.height - newHeight);
            }
            break;
          case "nw":
            newWidth = Math.max(20, element.width - deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(20, element.height - deltaY);
            }
            newX = element.x + (element.width - newWidth);
            newY = element.y + (element.height - newHeight);
            break;
          case "n":
            if (!isImage) {
              newHeight = Math.max(20, element.height - deltaY);
              newY = element.y + (element.height - newHeight);
            }
            break;
          case "s":
            if (!isImage) {
              newHeight = Math.max(20, element.height + deltaY);
            }
            break;
          case "e":
            newWidth = Math.max(20, element.width + deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
            }
            break;
          case "w":
            newWidth = Math.max(20, element.width - deltaX);
            if (isImage) {
              newHeight = newWidth / aspectRatio;
            }
            newX = element.x + (element.width - newWidth);
            break;
        }

        // Ensure element stays within bounds
        newX = Math.max(0, Math.min(containerBounds.width - newWidth, newX));
        newY = Math.max(0, Math.min(containerBounds.height - newHeight, newY));

        onUpdate(element.id, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });

        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isRotating) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const rotation = (angle * 180) / Math.PI;

        onUpdate(element.id, { rotation });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    isRotating,
    dragStart,
    resizeHandle,
    element,
    containerBounds,
    onUpdate,
  ]);

  // Render content based on element type
  const renderContent = () => {
    const style = {
      fontSize: element.fontSize ? `${element.fontSize}px` : "14px",
      fontFamily: element.fontFamily || "Arial, sans-serif",
    };

    switch (element.type) {
      case "text":
        return (
          <div
            className="w-full h-full flex items-center justify-center text-black border border-dashed border-gray-400 bg-white/90 px-2 py-1"
            style={style}
          >
            {element.content || "Text"}
          </div>
        );

      case "signature":
      case "initial":
        if (element.signatureData) {
          return (
            <img
              src={element.signatureData}
              alt={element.type}
              className="w-full h-full object-contain"
              draggable={false}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center text-black border border-dashed border-gray-400 bg-white/90 px-2 py-1"
            style={style}
          >
            {element.content || element.type}
          </div>
        );

      case "date":
        return (
          <div
            className="w-full h-full flex items-center justify-center text-black border border-dashed border-gray-400 bg-white/90 px-2 py-1"
            style={style}
          >
            {element.content || new Date().toLocaleDateString()}
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            {element.content}
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute select-none cursor-move group",
        isSelected && "ring-2 ring-blue-500 ring-offset-1",
        (isDragging || isResizing || isRotating) && "z-50",
        className,
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: "center",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {/* Element content */}
      {renderContent()}

      {/* Selection handles */}
      {isSelected && (
        <>
          {/* Resize handles */}
          {RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.position}
              className={cn(
                "absolute w-3 h-3 bg-blue-500 border border-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity",
                handle.position === "nw" && "-top-1.5 -left-1.5",
                handle.position === "ne" && "-top-1.5 -right-1.5",
                handle.position === "sw" && "-bottom-1.5 -left-1.5",
                handle.position === "se" && "-bottom-1.5 -right-1.5",
                handle.position === "n" && "-top-1.5 left-1/2 -translate-x-1/2",
                handle.position === "s" &&
                  "-bottom-1.5 left-1/2 -translate-x-1/2",
                handle.position === "e" &&
                  "top-1/2 -right-1.5 -translate-y-1/2",
                handle.position === "w" && "top-1/2 -left-1.5 -translate-y-1/2",
              )}
              style={{ cursor: handle.cursor }}
              onMouseDown={(e) => handleResizeStart(e, handle.position)}
            />
          ))}

          {/* Rotation handle */}
          <div
            className="absolute w-6 h-6 bg-green-500 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center"
            onMouseDown={handleRotateStart}
          >
            <RotateCw className="w-3 h-3 text-white" />
          </div>

          {/* Move handle */}
          <div className="absolute top-0 left-0 w-full h-full cursor-move opacity-0 group-hover:opacity-20 bg-blue-500 pointer-events-none" />

          {/* Delete button */}
          <button
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};

export default InteractiveElement;
