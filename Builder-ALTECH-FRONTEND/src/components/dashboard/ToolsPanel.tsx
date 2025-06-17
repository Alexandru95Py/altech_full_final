import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Merge,
  Split,
  ArrowUpDown,
  Download,
  Archive,
  RefreshCw,
} from "lucide-react";

interface ToolsPanelProps {
  className?: string;
}

const toolsData = [
  { icon: Merge, label: "Merge", description: "Combine PDFs" },
  { icon: Split, label: "Split", description: "Separate pages" },
  { icon: ArrowUpDown, label: "Reorder", description: "Rearrange pages" },
  { icon: Download, label: "Extract", description: "Extract content" },
  { icon: Archive, label: "Compress", description: "Reduce file size" },
  { icon: RefreshCw, label: "Convert", description: "Change format" },
];

export function ToolsPanel({ className }: ToolsPanelProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {toolsData.map((tool) => (
            <Button
              key={tool.label}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-slate-50"
            >
              <tool.icon className="h-5 w-5 text-slate-600" />
              <div className="text-center">
                <div className="text-sm font-medium text-slate-900">
                  {tool.label}
                </div>
                <div className="text-xs text-slate-500">{tool.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
