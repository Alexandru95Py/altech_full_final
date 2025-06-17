/**
 * Download Test Button - Simple component to test downloads
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TestTube } from "lucide-react";
import {
  realFileDownload,
  realMultipleFileDownload,
} from "@/utils/realFileDownload";

export const DownloadTestButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSingleTest = async () => {
    setIsDownloading(true);
    try {
      console.log("🧪 Testing single download...");
      await realFileDownload("test", "altech_single_test.txt");
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleMultipleTest = async () => {
    setIsDownloading(true);
    try {
      console.log("🧪 Testing multiple downloads...");
      await realMultipleFileDownload("test", 3, "altech_multi_test");
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSimpleTest = () => {
    console.log("🧪 Running ultra simple test...");

    // Ultra simple download
    const content = `ALTech PDF Tools - Simple Test
Generated: ${new Date().toString()}
This is the simplest possible download test.
If you see this file, downloads are working!`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ultra_simple_test.txt";
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1000);

    console.log("✅ Ultra simple test completed - check Downloads folder!");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Download Tests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={handleSimpleTest} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Ultra Simple Test
        </Button>

        <Button
          onClick={handleSingleTest}
          disabled={isDownloading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Downloading..." : "Single File Test"}
        </Button>

        <Button
          onClick={handleMultipleTest}
          disabled={isDownloading}
          variant="secondary"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Downloading..." : "Multiple Files Test (3)"}
        </Button>

        <div className="text-xs text-slate-500 text-center">
          Click any button to test downloads.
          <br />
          Check your Downloads folder for files.
        </div>
      </CardContent>
    </Card>
  );
};
