/**
 * Simple Test Download Function
 * For immediate testing in browser console
 */

export const testDownloadNow = async () => {
  try {
    console.log("🧪 Testing download system...");

    // Create simple text content for testing
    const content = `TEST DOWNLOAD - ALTech PDF Tools

If you can see this file, downloads are working!

Generated: ${new Date().toLocaleString()}
Test ID: ${Math.random().toString(36).substr(2, 9)}

This is a simple text file to test the download functionality
without requiring any external dependencies.

The download system is working correctly if you can save this file.
`;

    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "test-download.txt";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    console.log("✅ Test download triggered successfully!");
    return true;
  } catch (error) {
    console.error("❌ Test download failed:", error);
    return false;
  }
};

// Add to window for easy console access
if (typeof window !== "undefined") {
  (window as any).testDownload = testDownloadNow;
}
