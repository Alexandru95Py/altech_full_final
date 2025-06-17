/**
 * Immediate Test for Download Fix
 * Run this in console to test if downloads work
 */

export const testDownloadNow = async () => {
  try {
    console.log("🧪 Testing reliable download system...");

    // Import the reliable download system
    const { default: reliableDownload } = await import("./reliableDownload");

    // Test download
    await reliableDownload("test", "test-download-fix.pdf");

    console.log("✅ Test completed! Check your downloads folder.");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
};

// Add to window for console access
if (typeof window !== "undefined") {
  (window as any).testDownloadFix = testDownloadNow;
  console.log("💡 Run testDownloadFix() in console to test downloads");
}
