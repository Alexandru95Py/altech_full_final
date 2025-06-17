import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

interface ProcessingOptionsProps {
  title?: string;
  options: ProcessingOption[];
  className?: string;
}

export interface ProcessingOption {
  id: string;
  type: "radio" | "checkbox" | "input" | "select" | "range";
  label: string;
  description?: string;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: string; label: string }>; // For select and radio
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  groupName?: string; // For radio groups
}

/**
 * Configurable processing options component for PDF operations
 * Renders dynamic form controls based on option type (radio, checkbox, input, etc.)
 */
export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  title = "Processing Options",
  options,
  className,
}) => {
  // Renders appropriate input control based on option type
  const renderOption = (option: ProcessingOption) => {
    switch (option.type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={option.value}
              onCheckedChange={option.onChange}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={option.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        );

      case "radio":
        // Group radio options by groupName to avoid duplicates
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{option.label}</Label>
            {option.description && (
              <p className="text-xs text-muted-foreground mb-3">
                {option.description}
              </p>
            )}
            <RadioGroup
              value={option.value}
              onValueChange={option.onChange}
              className="space-y-2"
            >
              {option.options?.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="text-sm">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={option.id} className="text-sm font-medium">
              {option.label}
            </Label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
            <Select value={option.value} onValueChange={option.onChange}>
              <SelectTrigger id={option.id}>
                <SelectValue placeholder={option.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {option.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "input":
        return (
          <div className="space-y-2">
            <Label htmlFor={option.id} className="text-sm font-medium">
              {option.label}
              {option.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
            <Input
              id={option.id}
              type="text"
              value={option.value}
              onChange={(e) => option.onChange(e.target.value)}
              placeholder={option.placeholder}
              required={option.required}
            />
          </div>
        );

      case "range":
        return (
          <div className="space-y-2">
            <Label htmlFor={option.id} className="text-sm font-medium">
              {option.label}
            </Label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
            <div className="space-y-2">
              <Input
                id={option.id}
                type="range"
                min={option.min}
                max={option.max}
                step={option.step}
                value={option.value}
                onChange={(e) => option.onChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{option.min}</span>
                <span className="font-medium">{option.value}</span>
                <span>{option.max}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Filter out duplicate radio options to show only first in each group
  const processedOptions = options.filter((option) => {
    if (option.type === "radio") {
      const groupOptions = options.filter(
        (opt) => opt.groupName === option.groupName && opt.type === "radio",
      );
      return groupOptions[0].id === option.id;
    }
    return true;
  });

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {processedOptions.map((option) => (
          <div key={option.id}>{renderOption(option)}</div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProcessingOptions;
