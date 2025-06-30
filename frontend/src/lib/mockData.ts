/**
 * Mock Data Generators
 * Generate realistic mock data for API responses
 */

import { MOCK_CONFIG } from "../config/mockMode";

// Sample PDF files for mock responses (matching backend API structure)
export const SAMPLE_PDF_FILES = [
  {
    id: "sample-1",
    name: "ALTech_Business_Proposal.pdf",
    filename: "ALTech_Business_Proposal.pdf", // Backend compatibility
    size: 2456789, // ~2.4MB in bytes
    pages: 15,
    type: "application/pdf",
    status: "Original",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Frontend compatibility
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Legacy compatibility
    url: "#mock-pdf-1",
    thumbnail: "/placeholder-pdf-thumb.png",
  },
  {
    id: "sample-2",
    name: "Technical_Documentation.pdf",
    filename: "Technical_Documentation.pdf",
    size: 1234567, // ~1.2MB in bytes
    pages: 8,
    type: "application/pdf",
    status: "Processed",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    url: "#mock-pdf-2",
    thumbnail: "/placeholder-pdf-thumb.png",
  },
  {
    id: "sample-3",
    name: "Marketing_Materials.pdf",
    filename: "Marketing_Materials.pdf",
    size: 3456789, // ~3.4MB in bytes
    pages: 22,
    type: "application/pdf",
    status: "Generated",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    dateCreated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    url: "#mock-pdf-3",
    thumbnail: "/placeholder-pdf-thumb.png",
  },
  {
    id: "sample-4",
    name: "Compressed_Report.pdf",
    filename: "Compressed_Report.pdf",
    size: 892345, // ~890KB in bytes
    pages: 12,
    type: "application/pdf",
    status: "Compressed",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    dateCreated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    url: "#mock-pdf-4",
    thumbnail: "/placeholder-pdf-thumb.png",
  },
  {
    id: "sample-5",
    name: "Generated_CV.pdf",
    filename: "Generated_CV.pdf",
    size: 156789, // ~153KB in bytes
    pages: 2,
    type: "application/pdf",
    status: "Generated",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    dateCreated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: "#mock-pdf-5",
    thumbnail: "/placeholder-pdf-thumb.png",
  },
];

/**
 * Generate a mock upload response with realistic data
 */
export const generateMockUploadResponse = (
  file: File,
  operation?: string,
): any => {
  const fileId = `mock-${Math.random().toString(36).substr(2, 9)}`;
  const pages = Math.floor(Math.random() * 20) + 5; // 5-25 pages

  return {
    success: true,
    data: {
      id: fileId,
      name: file.name,
      filename: file.name, // Added for compatibility
      originalName: file.name,
      size: file.size,
      type: file.type,
      pages: pages,
      uploadDate: new Date().toISOString(),
      created_at: new Date().toISOString(), // Added for compatibility
      url: `#mock-download-${fileId}`,
      downloadUrl: `#mock-download-${fileId}`,
      thumbnail: "/placeholder-pdf-thumb.png",
      metadata: {
        operation: operation || "upload",
        processed: true,
        version: "1.0",
      },
    },
    message: `File "${file.name}" uploaded successfully`,
  };
};

/**
 * Generate a mock user profile
 */
export const generateMockUserProfile = (): any => {
  return {
    id: "mock-user-123",
    email: "user@altech.com",
    firstName: "Alex",
    lastName: "Smith",
    avatar: "/placeholder-avatar.png",
    plan: "Pro",
    storageUsed: 1.2 * 1024 * 1024 * 1024, // 1.2GB
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB
    filesCount: 28,
    lastLogin: new Date().toISOString(),
    memberSince: "2023-01-15",
    settings: {
      notifications: true,
      autoSave: true,
      defaultQuality: "high",
    },
  };
};

/**
 * Generate a mock authentication response
 */
export const generateMockAuthResponse = (email: string): any => {
  return {
    success: true,
    data: {
      token: `mock-token-${Math.random().toString(36).substr(2, 16)}`,
      user: {
        id: "mock-user-123",
        email: email,
        firstName: "Alex",
        lastName: "Smith",
        avatar: "/placeholder-avatar.png",
        plan: "Pro",
      },
      expiresIn: 3600, // 1 hour
    },
    message: "Authentication successful",
  };
};

/**
 * Generate a mock PDF creation response
 */
export const generateMockPdfCreateResponse = (
  content: string,
  filename?: string,
): any => {
  const fileId = `created-${Math.random().toString(36).substr(2, 9)}`;
  const finalFilename =
    filename || `document_${new Date().toISOString().split("T")[0]}.pdf`;

  return {
    success: true,
    data: {
      id: fileId,
      name: finalFilename,
      filename: finalFilename, // Added for compatibility
      size: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
      type: "application/pdf",
      pages: Math.max(1, Math.floor(content.length / 1000)), // Estimate pages
      created_at: new Date().toISOString(), // Added for compatibility
      uploadDate: new Date().toISOString(),
      url: `#mock-created-${fileId}`,
      downloadUrl: `#mock-created-${fileId}`,
      content: content,
    },
    message: "PDF created successfully",
  };
};

/**
 * Generate a mock Fill & Sign response
 */
export const generateMockFillSignResponse = (fileId: string): any => {
  return {
    success: true,
    data: {
      id: `signed-${fileId}`,
      originalFileId: fileId,
      downloadUrl: `#mock-signed-${fileId}`,
      signedAt: new Date().toISOString(),
      signatures: [
        {
          id: "sig-1",
          type: "digital",
          position: { x: 100, y: 200, page: 1 },
          timestamp: new Date().toISOString(),
        },
      ],
      formData: {
        saved: true,
        fields: {},
      },
    },
    message: "Document signed successfully",
  };
};

/**
 * Generate a mock processing response
 */
export const generateMockProcessingResponse = (
  operation: string,
  fileId: string,
  options?: any,
): any => {
  const resultId = `${operation}-${fileId}-${Math.random().toString(36).substr(2, 6)}`;

  return {
    success: true,
    data: {
      id: resultId,
      originalFileId: fileId,
      operation: operation,
      downloadUrl: `#mock-${operation}-${resultId}`,
      processedAt: new Date().toISOString(),
      options: options || {},
      status: "completed",
      metadata: {
        operation: operation,
        originalSize: Math.floor(Math.random() * 5000000) + 1000000,
        processedSize: Math.floor(Math.random() * 3000000) + 500000,
        compressionRatio: Math.random() * 0.5 + 0.3, // 30-80% compression
        processingTime: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
      },
    },
    message: `${operation} operation completed successfully`,
  };
};

/**
 * Calculate mock storage usage from existing files
 */
export const calculateMockStorageUsage = (files?: any[]) => {
  // Use sample files or provided files
  const fileList = files || SAMPLE_PDF_FILES;

  // Calculate total used storage from file sizes
  const totalUsed = fileList.reduce((sum, file) => sum + (file.size || 0), 0);

  // Set total limit to 100MB
  const totalLimit = 100 * 1024 * 1024; // 100MB in bytes

  const totalAvailable = totalLimit - totalUsed;
  const percentageUsed = (totalUsed / totalLimit) * 100;

  return {
    used: totalUsed,
    limit: totalLimit,
    available: Math.max(0, totalAvailable),
    percentageUsed: Math.min(100, Math.round(percentageUsed * 100) / 100),
    filesCount: fileList.length,
  };
};

/**
 * Generate mock PDF metadata (simplified without jsPDF)
 */
export const generateMockPDFInfo = (
  filename: string,
  operation?: string,
): { filename: string; operation?: string; generated: string } => {
  return {
    filename,
    operation,
    generated: new Date().toISOString(),
  };
};

/**
 * Create a mock download blob for testing
 */
export const createMockDownloadBlob = (
  filename: string,
  operation?: string,
): Blob => {
  const content = `ALTech PDF Tools - Mock Download

File: ${filename}
Operation: ${operation || "download"}
Generated: ${new Date().toString()}

This is a mock file created for development and testing purposes.
In a real application, this would be replaced with actual file content
from your backend server.

Mock file properties:
- Operation: ${operation || "generic"}
- File type: PDF
- Generated at: ${new Date().toISOString()}
- Mock ID: ${Math.random().toString(36).substr(2, 9)}

This mock system allows developers to test download functionality
without requiring a real backend server or external file resources.
`;

  return new Blob([content], { type: "text/plain" });
};

/**
 * Generate mock error responses for different error types
 */
export const generateMockErrorResponse = (errorType: string): Error => {
  const errorMessages = {
    auth: "Authentication failed. Please check your credentials.",
    network: "Network error occurred. Please check your internet connection.",
    server: "Server error occurred. Please try again later.",
    validation: "Invalid input data. Please check your request.",
    upload: "File upload failed. Please try again.",
    processing: "Processing failed. Please try again.",
    storage: "Storage limit exceeded. Please upgrade your plan.",
    permission: "You don't have permission to perform this action.",
    not_found: "The requested resource was not found.",
    timeout: "Request timed out. Please try again.",
  };

  const message =
    errorMessages[errorType as keyof typeof errorMessages] ||
    "An unknown error occurred.";

  return new Error(message);
};

/**
 * Generate operation-specific PDF content (simplified without jsPDF)
 */
export const generateOperationPDF = (
  operation: string,
  filename: string,
  data?: any,
): Blob => {
  const content = `ALTech PDF Tools - ${operation.toUpperCase()} Operation

File: ${filename}
Operation: ${operation}
Generated: ${new Date().toString()}
Processing ID: ${Math.random().toString(36).substr(2, 9)}

Operation Details:
${JSON.stringify(data || {}, null, 2)}

This document represents the result of a ${operation} operation
performed using ALTech PDF Tools in mock mode.

Operation Summary:
- Input file processed successfully
- All data preserved during operation
- Output generated with high quality
- Ready for download or further processing

Technical Information:
- Mock processing time: ${Math.floor(Math.random() * 3000) + 500}ms
- Quality level: High
- Compression ratio: ${Math.floor(Math.random() * 40) + 20}%
- File integrity: Verified

For production use, this mock content would be replaced
with actual PDF processing results from the server.
`;

  return new Blob([content], { type: "text/plain" });
};
