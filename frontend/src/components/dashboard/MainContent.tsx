import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSupportModal } from "../../App";
import {
  FolderOpen,
  HelpCircle,
  PenTool,
  ExternalLink,
  FileText,
  Wrench,
  Zap,
} from "lucide-react";

interface MainContentProps {
  className?: string;
}

export function MainContent({ className }: MainContentProps) {
  const navigate = useNavigate();
  const { openSupportModal } = useSupportModal();

  const handleActionClick = (action: string) => {
    switch (action) {
      case "files":
        navigate("/files");
        break;
      case "support":
        openSupportModal();
        break;
      case "fill-sign":
        navigate("/fill-sign");
        break;
      default:
        break;
    }
  };

  // Always fetch user from localStorage to ensure latest data
  let user: any = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {}

  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          {user && user.first_name ? `Welcome back, ${user.first_name}` : "Welcome back, User"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-1">
                No. Users
              </h3>
              <p className="text-2xl font-semibold text-slate-900">1</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-1">
                Recent Files
              </h3>
              <p className="text-2xl font-semibold text-slate-900">4</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ALTech Updates Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              📢 ALTech Updates
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View All Updates
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <PenTool className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Fill & Sign now supports handwritten input</span>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700">
              <Wrench className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Planned maintenance: June 12, 02:00 – 04:00 CET</span>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FileText className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
              <span>White Paper v1.0 released – see bottom of page</span>
            </div>

            <div className="flex items-start gap-3 text-sm text-slate-700">
              <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Smart Split now detects invoice patterns</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-slate-700 text-white border-slate-700"
          onClick={() => handleActionClick("files")}
        >
          <CardContent className="p-6 text-center">
            <FolderOpen className="h-8 w-8 mx-auto mb-3 text-white" />
            <h3 className="text-sm font-semibold text-white">My Files</h3>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-slate-700 text-white border-slate-700"
          onClick={() => handleActionClick("support")}
        >
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-8 w-8 mx-auto mb-3 text-white" />
            <h3 className="text-sm font-semibold text-white">Support</h3>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 bg-slate-700 text-white border-slate-700"
          onClick={() => handleActionClick("fill-sign")}
        >
          <CardContent className="p-6 text-center">
            <PenTool className="h-8 w-8 mx-auto mb-3 text-white" />
            <h3 className="text-sm font-semibold text-white">Fill & Sign</h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
