import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
}

/**
 * Universal page layout wrapper that provides consistent structure across all pages
 * Manages sidebar, header, footer positioning and responsive spacing
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  contentClassName,
  title,
  description,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
}) => {
  return (
    <div className={cn("min-h-screen bg-slate-50", className)}>
      {/* Fixed navigation sidebar */}
      {showSidebar && <Sidebar />}

      {/* Fixed header with user controls */}
      {showHeader && <Header />}

      {/* Main content area with responsive margins for sidebar/header */}
      <main
        className={cn(
          "min-h-screen",
          showSidebar ? "ml-60" : "",
          showHeader ? "pt-16" : "",
          showFooter ? "pb-20" : "",
        )}
      >
        <div className={cn("p-6", contentClassName)}>
          {/* Optional page header with title and description */}
          {(title || description) && (
            <div className="mb-8 text-center">
              {title && (
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {title}
                </h1>
              )}
              {description && <p className="text-slate-600">{description}</p>}
            </div>
          )}

          {/* Page-specific content */}
          {children}
        </div>
      </main>

      {/* Fixed footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
