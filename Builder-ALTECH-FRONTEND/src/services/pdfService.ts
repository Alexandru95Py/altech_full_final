/**
 * PDF processing service - centralized business logic for all PDF operations
 * Handles API communication, validation, and error handling for PDF tools
 */

import { pdfAPI, APIResponse, PDFProcessResponse } from "@/lib/api";

export interface SplitOptions {
  method: "selection" | "range" | "evenly";
  selectedPages?: number[];
  pageRanges?: string;
  splitEvery?: number;
  keepOriginal?: boolean;
  outputNaming?: "numbered" | "custom";
}

export interface MergeOptions {
  fileIds: string[];
  pageOrder?: number[];
  outputName?: string;
  bookmarks?: boolean;
}

export interface CompressOptions {
  quality: "low" | "medium" | "high";
  colorOptimization?: boolean;
  removeMetadata?: boolean;
  optimizeImages?: boolean;
}

export interface ProtectOptions {
  password: string;
  permissions: {
    allowPrinting?: boolean;
    allowCopying?: boolean;
    allowEditing?: boolean;
    allowAnnotations?: boolean;
  };
}

export interface ReorderOptions {
  pageOrder: number[];
  removePages?: number[];
}

export interface RotateOptions {
  pages: number[];
  angle: 90 | 180 | 270;
}

export interface ConvertOptions {
  outputFormat: "docx" | "xlsx" | "pptx" | "txt" | "html";
  preserveFormatting?: boolean;
  includeImages?: boolean;
}

/**
 * PDF processing service class that centralizes all PDF-related operations
 * Provides validation, error handling, and API communication for PDF tools
 */
class PDFService {
  // Split PDF into multiple files based on user-defined criteria
  async splitPDF(
    fileId: string,
    options: SplitOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      return await pdfAPI.splitPDF(fileId, options);
    } catch (error) {
      throw this.handleError(error, "Failed to split PDF");
    }
  }

  // Combine multiple PDF files into a single document
  async mergePDFs(
    options: MergeOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      return await pdfAPI.mergePDF(options.fileIds, options);
    } catch (error) {
      throw this.handleError(error, "Failed to merge PDFs");
    }
  }

  // Reduce PDF file size through compression algorithms
  async compressPDF(
    fileId: string,
    options: CompressOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      return await pdfAPI.compressPDF(fileId, options);
    } catch (error) {
      throw this.handleError(error, "Failed to compress PDF");
    }
  }

  // Add password protection and permission controls to PDF
  async protectPDF(
    fileId: string,
    options: ProtectOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      return await pdfAPI.protectPDF(fileId, options);
    } catch (error) {
      throw this.handleError(error, "Failed to protect PDF");
    }
  }

  // Reorder or remove pages within a PDF document
  async reorderPDF(
    fileId: string,
    options: ReorderOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      return await pdfAPI.reorderPDF(fileId, options);
    } catch (error) {
      throw this.handleError(error, "Failed to reorder PDF pages");
    }
  }

  // Rotate specific pages by 90, 180, or 270 degrees
  async rotatePDF(
    fileId: string,
    options: RotateOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      throw new Error("Rotate operation not yet implemented in API");
    } catch (error) {
      throw this.handleError(error, "Failed to rotate PDF pages");
    }
  }

  // Convert PDF to other document formats
  async convertPDF(
    fileId: string,
    options: ConvertOptions,
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      throw new Error("Convert operation not yet implemented in API");
    } catch (error) {
      throw this.handleError(error, "Failed to convert PDF");
    }
  }

  // Extract specific pages into a new PDF document
  async extractPages(
    fileId: string,
    pages: number[],
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      throw new Error("Extract operation not yet implemented in API");
    } catch (error) {
      throw this.handleError(error, "Failed to extract PDF pages");
    }
  }

  // Remove specific pages from PDF document
  async deletePages(
    fileId: string,
    pages: number[],
  ): Promise<APIResponse<PDFProcessResponse>> {
    try {
      throw new Error("Delete pages operation not yet implemented in API");
    } catch (error) {
      throw this.handleError(error, "Failed to delete PDF pages");
    }
  }

  // Validation methods to ensure proper options before API calls
  validateSplitOptions(options: SplitOptions): boolean {
    switch (options.method) {
      case "selection":
        return Boolean(options.selectedPages?.length);
      case "range":
        return Boolean(options.pageRanges?.trim());
      case "evenly":
        return Boolean(options.splitEvery && options.splitEvery > 0);
      default:
        return false;
    }
  }

  validateMergeOptions(options: MergeOptions): boolean {
    return options.fileIds.length >= 2;
  }

  validateCompressOptions(options: CompressOptions): boolean {
    return ["low", "medium", "high"].includes(options.quality);
  }

  validateProtectOptions(options: ProtectOptions): boolean {
    return Boolean(options.password?.trim());
  }

  validateReorderOptions(options: ReorderOptions): boolean {
    return options.pageOrder.length > 0;
  }

  validateRotateOptions(options: RotateOptions): boolean {
    return options.pages.length > 0 && [90, 180, 270].includes(options.angle);
  }

  validateConvertOptions(options: ConvertOptions): boolean {
    return ["docx", "xlsx", "pptx", "txt", "html"].includes(
      options.outputFormat,
    );
  }

  // Centralized error handling for consistent error messages
  private handleError(error: any, defaultMessage: string): Error {
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error(defaultMessage);
  }

  // Utility methods for UI formatting and file handling
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  formatProcessingTime(milliseconds: number): string {
    const seconds = Math.round(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Generate meaningful output filenames based on operation and timestamp
  generateOutputFileName(
    originalName: string,
    operation: string,
    suffix?: string,
  ): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
    const timestamp = new Date().toISOString().slice(0, 10);
    const suffixPart = suffix ? `_${suffix}` : "";
    return `${nameWithoutExt}_${operation}${suffixPart}_${timestamp}.pdf`;
  }
}

// Export singleton instance for use across the application
export const pdfService = new PDFService();

// Export types for use in components
export type {
  SplitOptions,
  MergeOptions,
  CompressOptions,
  ProtectOptions,
  ReorderOptions,
  RotateOptions,
  ConvertOptions,
};
