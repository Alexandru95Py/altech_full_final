import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useSupportModal } from "../../App";
import {
  LayoutDashboard,
  FolderOpen,
  HelpCircle,
  PenTool,
  Plus,
  Shield,
  Settings,
  Info,
  FileText,
  MessageCircleQuestion,
  Brain,
  Lock,
  Sparkles,
  Zap,
  Wand2,
  Bot,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Settings,
    label: "My Tools",
    path: "/tools",
    tutorialId: "my-tools",
  },
  {
    icon: FolderOpen,
    label: "My Files",
    path: "/files",
    tutorialId: "my-files",
  },
  {
    icon: PenTool,
    label: "Fill & Sign",
    path: "/fill-sign",
  },
  {
    icon: Shield,
    label: "Protect Documents",
    path: "/protect",
    tutorialId: "protect-documents",
  },
  {
    icon: Plus,
    label: "Create",
    path: "/create",
  },
];

const infoItems = [
  {
    icon: Info,
    label: "About Us",
    path: "/about",
  },
  {
    icon: FileText,
    label: "White Paper",
    path: "/whitepaper",
  },
  {
    icon: MessageCircleQuestion,
    label: "FAQ",
    path: "/faq",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSupportModal } = useSupportModal();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleAIAssistantClick = () => {
    setIsAIModalOpen(true);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen w-60 bg-slate-800 text-white z-30",
        "flex flex-col",
        className,
      )}
    >
      <div className="px-6 py-6 flex-shrink-0">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-16 scrollbar-hide">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left font-normal",
                  "hover:bg-slate-700 hover:text-white",
                  location.pathname === item.path && "bg-slate-700 text-white",
                )}
                data-tutorial={item.tutorialId}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </li>
          ))}

          {/* AI Assistant Locked Feature */}
          <li>
            <Button
              variant="ghost"
              onClick={handleAIAssistantClick}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left font-normal",
                "hover:bg-slate-700 hover:text-white relative",
              )}
            >
              <Brain className="h-5 w-5" />
              <span className="flex items-center gap-2">
                AI Assistant
                <Lock className="h-3 w-3 text-yellow-400" />
              </span>
              <Badge
                variant="outline"
                className="absolute -top-1 -right-1 h-5 px-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none text-xs"
              >
                SOON
              </Badge>
            </Button>
          </li>

          {/* Support Modal Trigger */}
          <li>
            <Button
              variant="ghost"
              onClick={openSupportModal}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left font-normal",
                "hover:bg-slate-700 hover:text-white",
              )}
              data-tutorial="support"
            >
              <HelpCircle className="h-5 w-5" />
              Support
            </Button>
          </li>

          {/* Info Section Header */}
          <li className="pt-6">
            <div className="px-3 pb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Info
              </h3>
            </div>
          </li>

          {/* Info Menu Items */}
          {infoItems.map((item) => (
            <li key={item.label}>
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left font-normal",
                  "hover:bg-slate-700 hover:text-white",
                  location.pathname === item.path && "bg-slate-700 text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* AI Assistant Coming Soon Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              AI Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Coming Soon Badge */}
            <div className="text-center">
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-1" />
                Coming Soon
              </Badge>
            </div>

            {/* Main Description */}
            <div className="text-center space-y-3">
              <p className="text-slate-600 leading-relaxed">
                This feature will include smart PDF creation, automated
                suggestions, and AI-powered editing.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">
                    Smart PDF Creation
                  </h4>
                  <p className="text-xs text-slate-600">
                    AI will help you structure and format documents
                    automatically
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">
                    Automated Suggestions
                  </h4>
                  <p className="text-xs text-slate-600">
                    Get intelligent recommendations for content and layout
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Wand2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">
                    AI-Powered Editing
                  </h4>
                  <p className="text-xs text-slate-600">
                    Advanced text processing, grammar correction, and style
                    improvements
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-slate-600">
                <strong className="text-slate-900">Expected Launch:</strong> Q2
                2025
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Stay tuned for updates on this exciting feature!
              </p>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <Button
                onClick={() => setIsAIModalOpen(false)}
                className="w-full"
              >
                Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
