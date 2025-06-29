import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Files } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MyFileData, fetchMyFiles } from "@/utils/fetchMyFiles";

interface UploadFromMyFilesProps {
  open: boolean;
  onClose: () => void;
  onSelectFile: (file: MyFileData) => void;
}

export const UploadFromMyFiles = ({
  open,
  onClose,
  onSelectFile,
}: UploadFromMyFilesProps) => {
  const [files, setFiles] = useState<MyFileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadFiles = async () => {
      const token = localStorage.getItem("authToken");

      console.log("🔐 TOKEN FOUND IN LOCAL STORAGE:", token);

      if (!token) {
        setError("Token not found in localStorage");
        return;
      }

      try {
        const fetched = await fetchMyFiles(token);
        console.log("📂 FETCHED FILES FROM API:", fetched);

        if (!Array.isArray(fetched)) {
          throw new Error("Unexpected response: not an array");
        }

        setFiles(fetched);
        setError(null);
      } catch (error) {
        console.error("❌ Failed to fetch files:", error);
        setError("Could not load your saved files. Check console for details.");
        toast({
          title: "Error loading files",
          description: "Please try again later or check the console.",
          variant: "destructive",
        });
      }
    };

    if (open) loadFiles();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Files className="h-5 w-5" />
            Upload from My Files
          </DialogTitle>
          <DialogDescription>
            Select a previously saved PDF file to use in this tool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {error && (
            <div className="text-sm text-red-500 text-center font-mono">
              ⚠️ Debug: {error}
            </div>
          )}

          {!error && files.length === 0 && (
            <p className="text-sm text-slate-500 text-center">
              No saved files found (or failed to fetch).
            </p>
          )}

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => {
                console.log("📄 Selected file from list:", file);
                onSelectFile(file);
                onClose();
                toast({
                  description: (
                    <p className="text-sm text-slate-500">
                      {file.size
                        ? `${file.size} • ${file.pages} pages`
                        : `${file.pages} pages`}
                    </p>
                  ),
                });
              }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-medium text-slate-900">{file.name}</h3>
                  <p className="text-sm text-slate-500">
                    {file.size || "Unknown size"} • {file.pages} pages
                  </p>
                </div>
              </div>
              <Badge variant="outline">Select</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
