import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSupportModal } from "../../App";
import { Wrench, FolderOpen, HelpCircle, PenTool } from "lucide-react";

interface QuickActionsProps {
  className?: string;
}

const quickActions = [
  { icon: Wrench, label: "Tools", path: "/tools" },
  { icon: FolderOpen, label: "My Files", path: "/files" },
  { icon: HelpCircle, label: "Support", action: "support" },
  { icon: PenTool, label: "Fill & Sign", path: "/fill-sign" },
];

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();
  const { openSupportModal } = useSupportModal();

  const handleActionClick = (action: (typeof quickActions)[0]) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action === "support") {
      openSupportModal();
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Quick actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex-1 h-auto p-4 flex flex-col items-center gap-2 rounded-md cursor-pointer",
                "bg-white border border-slate-200",
                "transition-all duration-200 ease-in-out",
                "hover:bg-white hover:-translate-y-0.5 hover:shadow-md",
                "active:scale-95 active:duration-75",
                "group",
              )}
            >
              <action.icon
                className={cn(
                  "h-5 w-5 text-slate-600 transition-colors duration-200",
                  "group-hover:text-blue-600",
                )}
              />
              <span
                className={cn(
                  "text-sm text-slate-900 transition-colors duration-200",
                  "group-hover:text-blue-600",
                )}
              >
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
