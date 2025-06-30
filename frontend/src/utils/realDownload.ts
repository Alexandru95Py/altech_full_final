/**
 * Real File Download Utilities
 * Handles actual file downloads using real URLs and blob streams
 */

// Test URLs for real file downloads during development - CORS-friendly URLs
const TEST_PDF_URLS = {
  sample:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  compress:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  merge:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  split:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  extract:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  convert:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  rotate:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  delete:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  reorder:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  protect:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  sign: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  fillsign:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  create:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  batch:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
};

/**
 * Download a file from URL using real browser download
 */
export const downloadFileFromURL = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  try {
    console.log("🔽 Starting real file download:", { url, filename });

    // Try fetching with different approaches for better compatibility
    let response: Response;

    try {
      // First try with standard headers
      response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/pdf,application/octet-stream,*/*",
        },
      });
    } catch (corsError) {
      console.warn("CORS request failed, trying no-cors mode:", corsError);
      // Fallback to no-cors mode
      response = await fetch(url, {
        method: "GET",
        mode: "no-cors",
      });
    }

    if (!response.ok && response.status !== 0) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle the response based on mode
    let blob: Blob;

    if (response.type === "opaque") {
      // no-cors response - we can't read the body, so create a simple redirect
      console.log("Using direct download redirect for opaque response");
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      link.setAttribute("target", "_blank");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const contentLength = response.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // Try to read response with progress tracking
    try {
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loaded += value.length;

          // Report progress
          if (onProgress && total > 0) {
            const progress = (loaded / total) * 100;
            onProgress(Math.min(progress, 100));
          }
        }
        blob = new Blob(chunks, { type: "application/pdf" });
      } else {
        // Fallback to arrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        blob = new Blob([arrayBuffer], { type: "application/pdf" });
      }
    } catch (streamError) {
      console.warn("Stream reading failed, using arrayBuffer:", streamError);
      const arrayBuffer = await response.arrayBuffer();
      blob = new Blob([arrayBuffer], { type: "application/pdf" });
    }

    // Create download link and trigger download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", filename);
    link.style.display = "none";

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 1000);

    console.log("✅ File download completed:", filename);
  } catch (error) {
    console.error("❌ File download failed:", error);
    throw new Error(
      `Download failed: ${error instanceof Error ? error.message : "Network error occurred"}`,
    );
  }
};

/**
 * Download a test PDF file for a specific operation with fallback
 */
export const downloadTestPDF = async (
  operation: keyof typeof TEST_PDF_URLS,
  filename: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  const primaryUrl = TEST_PDF_URLS[operation] || TEST_PDF_URLS.sample;

  try {
    await downloadFileFromURL(primaryUrl, filename, onProgress);
  } catch (error) {
    console.warn("Primary download failed, trying fallback:", error);

    try {
      // Try the W3C dummy PDF as fallback
      await downloadFileFromURL(TEST_PDF_URLS.sample, filename, onProgress);
    } catch (fallbackError) {
      console.warn(
        "Fallback download failed, creating local PDF:",
        fallbackError,
      );

      // Ultimate fallback - create a simple PDF-like file locally
      await downloadLocalGeneratedPDF(filename, operation);
    }
  }
};

/**
 * Generate and download a simple PDF-like file locally when external URLs fail
 */
const downloadLocalGeneratedPDF = async (
  filename: string,
  operation: string,
): Promise<void> => {
  // Create a simple PDF-like content (actually a text file with PDF info)
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 150
>>
stream
BT
/F1 12 Tf
72 720 Td
(ALTech PDF Tools - ${operation.toUpperCase()} Operation) Tj
0 -20 Td
(Generated: ${new Date().toLocaleString()}) Tj
0 -20 Td
(Filename: ${filename}) Tj
0 -20 Td
(This is a mock PDF file for development testing.) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
408
%%EOF`;

  try {
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    console.log("✅ Local PDF generated and downloaded:", filename);
  } catch (error) {
    throw new Error("Failed to generate local PDF file");
  }
};

/**
 * Download multiple files as individual downloads
 */
export const downloadMultipleFiles = async (
  downloads: Array<{ url: string; filename: string }>,
  onProgress?: (fileIndex: number, progress: number) => void,
): Promise<void> => {
  for (let i = 0; i < downloads.length; i++) {
    const { url, filename } = downloads[i];

    await downloadFileFromURL(url, filename, (progress) => {
      onProgress?.(i, progress);
    });

    // Small delay between downloads to prevent browser blocking
    if (i < downloads.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

/**
 * Simulate API response for download endpoint
 */
export const simulateDownloadAPI = async (
  fileId: string,
  operation: string,
): Promise<{ downloadUrl: string; filename: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const operationKey = operation as keyof typeof TEST_PDF_URLS;
  const downloadUrl = TEST_PDF_URLS[operationKey] || TEST_PDF_URLS.sample;

  // Generate filename based on operation
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${operation}_${timestamp}_${fileId}.pdf`;

  return { downloadUrl, filename };
};

/**
 * Create a ZIP download for batch operations (using JSZip)
 */
export const downloadAsZip = async (
  files: Array<{ name: string; url: string }>,
  zipFilename: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  try {
    // For now, download files individually
    // In a real implementation, you would use JSZip to create a ZIP file
    console.log("📦 Downloading multiple files:", files.length);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await downloadFileFromURL(file.url, file.name, (fileProgress) => {
        const overallProgress =
          (i / files.length) * 100 + fileProgress / files.length;
        onProgress?.(Math.min(overallProgress, 100));
      });

      // Delay between downloads
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("✅ Batch download completed");
  } catch (error) {
    console.error("❌ Batch download failed:", error);
    throw error;
  }
};

/**
 * Download data as JSON file (for profile data, etc.)
 */
export const downloadDataAsJSON = (data: any, filename: string): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    console.log("✅ JSON data downloaded:", filename);
  } catch (error) {
    console.error("❌ JSON download failed:", error);
    throw error;
  }
};

/**
 * Fallback URLs if main test URLs fail
 */
const FALLBACK_URLS = [
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  "https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf",
];

/**
 * Download with automatic fallback to alternative URLs
 */
export const downloadWithFallback = async (
  filename: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  for (const url of FALLBACK_URLS) {
    try {
      await downloadFileFromURL(url, filename, onProgress);
      return; // Success, exit function
    } catch (error) {
      console.warn("⚠️ Fallback URL failed, trying next:", url);
      continue;
    }
  }

  throw new Error("All download URLs failed");
};
