import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  required?: boolean;
}

/**
 * Reusable form section component with optional collapsible functionality
 * Provides consistent styling for form groups across PDF tool pages
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
  required = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Header content with title, icon, and optional collapse toggle
  const headerContent = (
    <CardHeader className={cn("pb-4", headerClassName)}>
      <CardTitle className="flex items-center gap-2 text-lg">
        {Icon && <Icon className="h-5 w-5" />}
        {title}
        {required && <span className="text-red-500">*</span>}
        {collapsible && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardTitle>
      {description && (
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      )}
    </CardHeader>
  );

  // Collapsible version with expand/collapse functionality
  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={cn("", className)}>
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer">{headerContent}</div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className={cn("pt-0 space-y-4", contentClassName)}>
              {children}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  // Standard non-collapsible version
  return (
    <Card className={cn("", className)}>
      {headerContent}
      <CardContent className={cn("pt-0 space-y-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default FormSection;
