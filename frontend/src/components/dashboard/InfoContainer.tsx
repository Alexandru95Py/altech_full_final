import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InfoContainerProps {
  className?: string;
}

const infoButtons = [
  { label: "About Us" },
  { label: "White Paper" },
  { label: "FAQ" },
];

export function InfoContainer({ className }: InfoContainerProps) {
  return (
    <div
      className={cn(
        "bg-blue-50 rounded-lg p-6 border border-blue-100",
        className,
      )}
    >
      <div className="flex justify-between gap-4">
        {infoButtons.map((button) => (
          <Button
            key={button.label}
            variant="outline"
            className={cn(
              "flex-1 bg-white border-blue-200 text-slate-700",
              "hover:bg-blue-600 hover:text-white hover:border-blue-600",
              "transition-all duration-200",
            )}
          >
            {button.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
