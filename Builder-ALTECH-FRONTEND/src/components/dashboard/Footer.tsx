import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer
      className={cn(
        "h-[50px] w-full bg-slate-800",
        "flex items-center justify-center",
        "text-white text-sm",
        className,
      )}
    >
      <div className="text-center w-full px-8 ml-20">
        © 2025 ALTech PDF. All rights reserved.
        <span className="mx-3">|</span>
        <span
          className="hover:underline cursor-pointer transition-colors hover:text-blue-300"
          onClick={() => navigate("/privacy")}
        >
          Privacy Policy
        </span>
        <span className="mx-3">|</span>
        <span
          className="hover:underline cursor-pointer transition-colors hover:text-blue-300"
          onClick={() => navigate("/terms")}
        >
          Terms of Service
        </span>
      </div>
    </footer>
  );
}
