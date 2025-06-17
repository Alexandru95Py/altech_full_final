/**
 * Complete API service
 * Switches between real Django backend and mock responses based on configuration
 */

import { isMockMode } from "../config/mockMode";

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
};

// Request types for different operations
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  status: string;
}

export interface FileItem {
  id: string;
  name: string;
  filename: string;
  size: number;
  created_at: string;
  status: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string;
}

// Updated AuthResponse interface to match backend response
export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
}

// Error types that match the Django backend
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Base API client for Django backend
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Set JWT auth token for authenticated requests
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Remove auth token
  clearAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  // Get current auth header
  getAuthHeader() {
    return this.defaultHeaders.Authorization;
  }

  // Generic request method for Django API
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Log API requests in development for debugging
    if (import.meta.env.DEV) {
      console.log("API Request:", {
        url,
        method: options.method || "GET",
        mockMode: isMockMode(),
      });
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    };

    try {
      const response = await fetch(url, config);

      // Handle different response types from Django
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        throw new APIError(
          response.status,
          data.error_code || data.errorCode || "API_ERROR",
          data.message || data.detail || "An error occurred",
        );
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      console.error("API Request failed:", {
        url,
        method: options.method || "GET",
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        mockMode: isMockMode(),
      });

      if (error instanceof APIError) {
        throw error;
      }

      // Enhanced error messages for Django backend connectivity issues
      let errorMessage =
        "Network error occurred. Please check your connection.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = `Cannot connect to Django backend at ${this.baseURL}. Please ensure the server is running.`;
      } else if (error instanceof Error && error.name === "AbortError") {
        errorMessage = `Request timeout after ${API_CONFIG.TIMEOUT / 1000}s. Django backend may be slow or unavailable.`;
      }

      throw new APIError(0, "NETWORK_ERROR", errorMessage, error as Error);
    }
  }

  // HTTP method wrappers
  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload with progress tracking for Django
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<APIResponse<FileUploadResponse>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle response from Django
      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: response,
            });
          } else {
            reject(
              new APIError(
                xhr.status,
                response.error_code || "UPLOAD_FAILED",
                response.message || response.detail || "File upload failed",
              ),
            );
          }
        } catch (error) {
          reject(
            new APIError(
              xhr.status,
              "PARSE_ERROR",
              "Failed to parse Django response",
            ),
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(
          new APIError(0, "NETWORK_ERROR", "Network error during file upload"),
        );
      });

      xhr.addEventListener("timeout", () => {
        reject(new APIError(0, "TIMEOUT_ERROR", "File upload timed out"));
      });

      // Start upload to Django
      xhr.open("POST", `${this.baseURL}${endpoint}`);

      // Add JWT auth header if available
      if (this.defaultHeaders.Authorization) {
        xhr.setRequestHeader(
          "Authorization",
          this.defaultHeaders.Authorization,
        );
      }

      xhr.timeout = API_CONFIG.TIMEOUT;
      xhr.send(formData);
    });
  }

  // Profile image upload to Django
  async uploadProfileImage(file: File): Promise<APIResponse<any>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("profile_image", file);

      const xhr = new XMLHttpRequest();

      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              success: true,
              data: response,
            });
          } else {
            reject(
              new APIError(
                xhr.status,
                response.error_code || "UPLOAD_FAILED",
                response.message ||
                  response.detail ||
                  "Profile image upload failed",
              ),
            );
          }
        } catch (error) {
          reject(
            new APIError(
              xhr.status,
              "PARSE_ERROR",
              "Failed to parse Django response",
            ),
          );
        }
      });

      xhr.addEventListener("error", () => {
        reject(
          new APIError(0, "NETWORK_ERROR", "Network error during image upload"),
        );
      });

      xhr.open("PATCH", `${this.baseURL}/auth/me/`);

      // Add JWT auth header if available
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        xhr.setRequestHeader("Authorization", authHeader);
      }

      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Ensure the token is set on app startup
const token = localStorage.getItem("authToken");
if (token) {
  apiClient.setAuthToken(token);
}

/**
 * Main API interface
 */
const createAPIInterface = () => {
  console.log("🔗 API running in REAL MODE - connecting to Django backend");

  // Real Django API endpoints mapping
  return {
    // Authentication endpoints
    login: (email: string, password: string) =>
      apiClient.post<AuthResponse>("/auth/login/", { email, password }),

    register: (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      apiClient.post<AuthResponse>("/auth/register/", {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }),

    getUserProfile: () => apiClient.get<UserProfile>("/auth/me/"),

    updateUserProfile: (data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }) =>
      apiClient.patch("/auth/me/", {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
      }),

    updateProfileImage: (file: File) => apiClient.uploadProfileImage(file),

    // File Management endpoints
    uploadFile: (file: File, onProgress?: (progress: number) => void) =>
      apiClient.uploadFile("/api/myfiles/base/upload/", file, onProgress),

    getFiles: () => apiClient.get<FileItem[]>("/api/myfiles/base/"),

    deleteFile: (fileId: string) =>
      apiClient.delete(`/api/myfiles/base/${fileId}/`),

    downloadFile: async (fileId: string) => {
      const downloadUrl = `${API_CONFIG.BASE_URL}/api/myfiles/base/${fileId}/download/`;

      try {
        const headers: Record<string, string> = {};
        const authHeader = apiClient.getAuthHeader();
        if (authHeader) {
          headers["Authorization"] = authHeader;
        } else {
          throw new APIError(401, "UNAUTHORIZED", "User is not authenticated");
        }

        const response = await fetch(downloadUrl, { headers });

        if (!response.ok) {
          throw new APIError(
            response.status,
            "DOWNLOAD_FAILED",
            "Failed to download file from My Files backend",
          );
        }

        const blob = await response.blob();
        const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `download_${fileId}.pdf`;

        return {
          success: true,
          data: {
            blob,
            filename,
          },
          message: "File downloaded successfully",
        };
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }
        throw new APIError(0, "DOWNLOAD_ERROR", "Failed to download file");
      }
    },

    // PDF Creation endpoints
    createBasicPDF: (content: string, options?: any) =>
      apiClient.post("/create_pdf/free/basic/", {
        content,
        title: options?.title || "New Document",
        format: options?.format || "A4",
      }),

    signPDF: (pdfId: string, signature: any) =>
      apiClient.post("/create_pdf/pro/sign/", {
        file_id: pdfId,
        signature_data: signature,
      }),

    // Fill & Sign endpoints
    saveFillSignData: (pdfId: string, elements: any[]) =>
      apiClient.post(`/fill-sign/save/${pdfId}/`, { elements }),

    getFillSignData: (pdfId: string) =>
      apiClient.get(`/fill-sign/load/${pdfId}/`),

    // PDF Processing endpoints
    splitPDF: (fileId: string, pages: number[]) =>
      apiClient.post(`/pdf/split/${fileId}/`, { pages }),

    mergePDFs: (fileIds: string[], options?: any) =>
      apiClient.post("/pdf/merge/", { file_ids: fileIds, ...options }),

    compressPDF: (fileId: string, options?: any) =>
      apiClient.post(`/pdf/compress/${fileId}/`, options),

    deletePages: (fileId: string, pages: number[]) =>
      apiClient.post(`/pdf/delete-pages/${fileId}/`, { pages }),

    reorderPages: (fileId: string, pageOrder: number[]) =>
      apiClient.post(`/pdf/reorder/${fileId}/`, { page_order: pageOrder }),

    extractPages: (fileId: string, pages: number[]) =>
      apiClient.post(`/pdf/extract/${fileId}/`, { pages }),

    batchProcess: (operation: string, fileIds: string[], options?: any) =>
      apiClient.post("/pdf/batch/", {
        operation,
        file_ids: fileIds,
        ...options,
      }),
  };
};

// Export the API interface (switches automatically based on mock mode)
export const djangoAPI = createAPIInterface();

// Backward compatibility alias
export const pdfAPI = djangoAPI;

// Utility function for triggering file downloads
export const downloadFileFromUrl = async (
  url: string,
  filename: string,
): Promise<void> => {
  try {
    const headers: Record<string, string> = {};
    const authHeader = apiClient.getAuthHeader();
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new APIError(
        response.status,
        "DOWNLOAD_FAILED",
        "Failed to download file",
      );
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, "DOWNLOAD_ERROR", "Failed to download file");
  }
};

// Enhanced error handling for Django responses
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    switch (error.errorCode) {
      case "FILE_TOO_LARGE":
        return "File size exceeds the maximum allowed limit.";
      case "INVALID_FILE_TYPE":
        return "Invalid file type. Please upload a PDF file.";
      case "INSUFFICIENT_STORAGE":
        return "Insufficient storage space. Please delete some files.";
      case "NETWORK_ERROR":
        return isMockMode()
          ? "Mock network error simulated."
          : "Cannot connect to Django backend. Please check your connection.";
      case "TIMEOUT_ERROR":
        return "Request timed out. Backend may be slow.";
      case "UNAUTHORIZED":
        return "Authentication required. Please log in again.";
      case "FORBIDDEN":
        return "You do not have permission to perform this action.";
      case "NOT_FOUND":
        return "The requested resource was not found.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  return "An unexpected error occurred. Please try again.";
};

export { API_CONFIG };
