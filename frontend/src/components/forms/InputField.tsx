import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "password" | "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
  rows?: number; // For textarea
  maxLength?: number;
  autoComplete?: string;
}

/**
 * Enhanced input field component with validation, error states, and character counting
 * Supports both single-line inputs and multi-line textareas
 */
export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  className,
  inputClassName,
  rows = 4,
  maxLength,
  autoComplete,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Field label with required indicator */}
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input field - textarea or regular input based on type */}
      {type === "textarea" ? (
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            error ? "border-red-500 focus:ring-red-500" : "",
            inputClassName,
          )}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={cn(
            error ? "border-red-500 focus:ring-red-500" : "",
            inputClassName,
          )}
        />
      )}

      {/* Character count indicator for fields with maxLength */}
      {maxLength && value.length > 0 && (
        <div className="text-xs text-slate-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Error message display */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Helper text when no error is present */}
      {hint && !error && <p className="text-sm text-slate-500">{hint}</p>}
    </div>
  );
};

export default InputField;
