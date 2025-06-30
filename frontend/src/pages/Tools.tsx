import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";
import { DownloadTestButton } from "@/components/shared/DownloadTestButton";
import { djangoAPI } from "@/lib/api";

const toolsData = [
  {
    title: "Split",
    description: "Divide a PDF into multiple files",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "✂️",
  },
  {
    title: "Merge",
    description: "Combine multiple PDFs into one",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "🔗",
  },
  {
    title: "Reorder",
    description: "Rearrange pages within your PDF",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "📋",
  },
  {
    title: "Generate CV",
    description: "Create a professional resume from your inputs",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "👤",
  },
  {
    title: "Compress",
    description: "Reduce the size of your PDF file",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "📦",
  },
  {
    title: "Scan to PDF",
    description: "Create PDFs by scanning documents",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "📱",
  },
  {
    title: "Extract Pages",
    description: "Save specific pages from a PDF",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "📄",
  },
  {
    title: "Delete Pages",
    description: "Remove specific pages from a PDF",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "🗑️",
  },
  {
    title: "Rotate",
    description: "Change the orientation of pages",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "🔄",
  },
  {
    title: "Convert",
    description: "Transform PDFs into multiple formats",
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    emoji: "🔄",
  },
];

const Tools = () => {
  const navigate = useNavigate();
  const [recentlyUsedTools, setRecentlyUsedTools] = useState<typeof toolsData>(
    [],
  );

  // Load recently used tools from localStorage on component mount
  useEffect(() => {
    const savedTools = localStorage.getItem("recentlyUsedTools");
    if (savedTools) {
      try {
        const parsedTools = JSON.parse(savedTools);
        setRecentlyUsedTools(parsedTools);
      } catch (error) {
        console.error("Error parsing recently used tools:", error);
      }
    }
  }, []);

  // Function to track tool usage and update localStorage
  const handleToolClick = (tool: (typeof toolsData)[0]) => {
    // Prevent interaction with disabled tools
    if (tool.title === "Scan to PDF") {
      return;
    }

    const updatedRecent = [
      tool,
      ...recentlyUsedTools.filter((t) => t.title !== tool.title),
    ].slice(0, 3);
    setRecentlyUsedTools(updatedRecent);
    localStorage.setItem("recentlyUsedTools", JSON.stringify(updatedRecent));

    // Navigate to specific tool pages
    switch (tool.title) {
      case "Split":
        navigate("/split-pdf");
        break;
      case "Merge":
        navigate("/tools/merge");
        break;
      case "Reorder":
        navigate("/tools/reorder");
        break;
      case "Generate CV":
        navigate("/generate-cv");
        break;
      case "Compress":
        navigate("/tools/compress");
        break;
      case "Extract Pages":
        navigate("/tools/extract");
        break;
      case "Rotate":
        navigate("/tools/rotate");
        break;
      case "Convert":
        navigate("/tools/convert");
        break;
      case "Delete Pages":
        navigate("/tools/delete");
        break;
      case "Fill & Sign":
        navigate("/fill-sign");
        break;
      default:
      // Navigate to tool
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Recently Used Tools */}
            {recentlyUsedTools.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Recently Used
                </h2>
                <div className="grid grid-cols-6 gap-4">
                  <TooltipProvider>
                    {recentlyUsedTools.map((tool) => {
                      const isDisabled = tool.title === "Scan to PDF";

                      const cardContent = (
                        <Card
                          key={`recent-${tool.title}`}
                          className={cn(
                            "transition-all duration-200 border-slate-200 relative",
                            isDisabled
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:shadow-md hover:-translate-y-1",
                          )}
                          onClick={() => handleToolClick(tool)}
                        >
                          {isDisabled && (
                            <>
                              <div className="absolute inset-0 bg-slate-200/30 rounded-lg z-10" />
                              <div className="absolute -top-1 -right-1 z-20">
                                <Lock className="h-3 w-3 text-slate-500" />
                              </div>
                            </>
                          )}

                          <CardContent className="p-4 text-center">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center mb-2 mx-auto",
                                isDisabled ? "bg-slate-100" : tool.bgColor,
                              )}
                            >
                              <span
                                className={cn(
                                  "text-lg",
                                  isDisabled && "grayscale",
                                )}
                              >
                                {tool.emoji}
                              </span>
                            </div>
                            <h3
                              className={cn(
                                "text-sm font-medium truncate",
                                isDisabled
                                  ? "text-slate-500"
                                  : "text-slate-900",
                              )}
                            >
                              {tool.title}
                            </h3>
                          </CardContent>
                        </Card>
                      );

                      if (isDisabled) {
                        return (
                          <Tooltip key={`recent-${tool.title}`}>
                            <TooltipTrigger asChild>
                              {cardContent}
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-center bg-slate-900 text-white p-3 rounded-lg shadow-lg"
                            >
                              <p className="text-sm">
                                This feature will be available once the ALTech
                                mobile app is released and camera access is
                                enabled.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return cardContent;
                    })}
                  </TooltipProvider>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Tools</h1>
              <p className="text-slate-600">
                Choose from our comprehensive suite of PDF tools to get your
                work done efficiently.
              </p>
            </div>

            {/* New All Entry Section */}
            <div className="mb-8">
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Batch Processing
                      </h3>
                      <p className="text-sm text-slate-600">
                        Process multiple files with batch operations
                      </p>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => navigate("/tools/batch")}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-3 gap-6">
              <TooltipProvider>
                {toolsData.map((tool) => {
                  const isDisabled = tool.title === "Scan to PDF";

                  const cardContent = (
                    <Card
                      key={tool.title}
                      className={cn(
                        "transition-all duration-200 border-slate-200 relative",
                        isDisabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:shadow-md hover:-translate-y-1",
                      )}
                      onClick={() => handleToolClick(tool)}
                    >
                      {/* Disabled overlay for Scan to PDF */}
                      {isDisabled && (
                        <div className="absolute inset-0 bg-slate-200/30 rounded-lg z-10" />
                      )}

                      {/* Lock icon and SOON badge for disabled tool */}
                      {isDisabled && (
                        <>
                          <div className="absolute top-3 right-3 z-20">
                            <Lock className="h-5 w-5 text-slate-500" />
                          </div>
                          <div className="absolute top-3 left-3 z-20">
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-700 border-orange-200 text-xs font-medium px-2 py-1"
                            >
                              SOON
                            </Badge>
                          </div>
                        </>
                      )}

                      <CardContent className="p-6">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                            isDisabled ? "bg-slate-100" : tool.bgColor,
                          )}
                        >
                          <span
                            className={cn(
                              "text-2xl",
                              isDisabled && "grayscale",
                            )}
                          >
                            {tool.emoji}
                          </span>
                        </div>
                        <h3
                          className={cn(
                            "text-lg font-semibold text-slate-900 mb-2",
                            isDisabled ? "text-slate-500" : "text-slate-900",
                          )}
                        >
                          {tool.title}
                        </h3>
                        <p
                          className={cn(
                            "text-sm text-slate-600 leading-relaxed",
                            isDisabled ? "text-slate-400" : "text-slate-600",
                          )}
                        >
                          {tool.description}
                        </p>
                      </CardContent>
                    </Card>
                  );

                  // Wrap disabled tools with tooltip
                  if (isDisabled) {
                    return (
                      <Tooltip key={tool.title}>
                        <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs text-center bg-slate-900 text-white p-3 rounded-lg shadow-lg"
                        >
                          <p className="text-sm">
                            This feature will be available once the ALTech
                            mobile app is released and camera access is enabled.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return cardContent;
                })}
              </TooltipProvider>
            </div>

            {/* Additional Features */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                onClick={() => navigate("/tools/batch")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Batch Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Process multiple PDF files at once to save time and increase
                    productivity.
                  </p>
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    Start Batch Processing
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                onClick={() => navigate("/security")}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Security & Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Your files are processed securely and automatically deleted
                    after 72 hours.
                  </p>
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Download Test Section - FOR DEBUGGING */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">
                🧪 Download Test (Development Only)
              </h3>
              <div className="flex justify-center">
                <DownloadTestButton />
              </div>
              <p className="text-sm text-yellow-700 mt-2 text-center">
                Use these buttons to test if downloads work in your browser
              </p>
            </div>

            {/* My Files API Test Section - FOR DEBUGGING */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                📁 My Files API Test (Development Only)
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log("🧪 Testing My Files API...");
                      const response = await djangoAPI.getFiles();
                      console.log("📁 API Response:", response);
                      alert(
                        `Success! Found ${response.data?.length || 0} files. Check console for details.`,
                      );
                    } catch (error) {
                      console.error("📁 API Error:", error);
                      alert(
                        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                      );
                    }
                  }}
                >
                  Test Get Files API
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate("/files");
                  }}
                >
                  Go to My Files
                </Button>
              </div>
              <p className="text-sm text-blue-700 mt-2 text-center">
                Use these buttons to test My Files API and navigation
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Tools;
