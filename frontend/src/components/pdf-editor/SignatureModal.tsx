import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PenTool, Upload, Type, Trash2 } from "lucide-react";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureCreate: (
    signatureData: string,
    type: "draw" | "upload" | "type",
  ) => void;
  elementType: "signature" | "initial";
}

/**
 * SignatureModal - Enhanced modal for creating signatures and initials
 */
export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSignatureCreate,
  elementType,
}) => {
  const [activeTab, setActiveTab] = useState<"draw" | "upload" | "type">(
    "draw",
  );
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Drawing functionality
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [isOpen]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      onSignatureCreate(imageData, "upload");
      onClose();
    };
    reader.readAsDataURL(file);
  };

  // Apply signature based on active tab
  const handleApply = () => {
    switch (activeTab) {
      case "draw":
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataURL = canvas.toDataURL();
        onSignatureCreate(dataURL, "draw");
        break;

      case "type":
        if (!typedSignature.trim()) return;
        // Create a canvas with the typed signature
        const textCanvas = document.createElement("canvas");
        textCanvas.width = 300;
        textCanvas.height = 100;
        const textCtx = textCanvas.getContext("2d");
        if (textCtx) {
          textCtx.font = "24px cursive";
          textCtx.fillStyle = "#000000";
          textCtx.textAlign = "center";
          textCtx.textBaseline = "middle";
          textCtx.fillText(typedSignature, 150, 50);
        }
        onSignatureCreate(textCanvas.toDataURL(), "type");
        break;

      case "upload":
        uploadRef.current?.click();
        return; // Don't close modal yet
    }

    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTypedSignature("");
      clearCanvas();
      setActiveTab("draw");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create {elementType === "signature" ? "Signature" : "Initial"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="border border-gray-300 rounded-lg cursor-crosshair w-full bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="absolute top-2 right-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Draw your {elementType} in the box above
            </p>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div>
              <Label htmlFor="signature-text">Type your {elementType}</Label>
              <Input
                id="signature-text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder={`Enter your ${elementType}...`}
                className="mt-2"
              />
            </div>
            {typedSignature && (
              <div className="p-4 border border-gray-300 rounded-lg bg-white text-center">
                <span className="text-2xl" style={{ fontFamily: "cursive" }}>
                  {typedSignature}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Preview of your typed {elementType}
            </p>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Upload an image of your {elementType}
              </p>
              <Button
                variant="outline"
                onClick={() => uploadRef.current?.click()}
              >
                Choose File
              </Button>
              <input
                ref={uploadRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-600">
              Supported formats: JPG, PNG, GIF
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
            disabled={
              (activeTab === "draw" && !canvasRef.current) ||
              (activeTab === "type" && !typedSignature.trim())
            }
          >
            Apply {elementType === "signature" ? "Signature" : "Initial"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
