/**
 * Download System Test Utility
 * Tests if our real download system shows browser Save As dialog
 */

import { realFileDownload, realMultipleFileDownload } from "./realFileDownload";

/**
 * Test single download - should show browser Save As dialog
 */
export const testSingleDownload = async (): Promise<void> => {
  console.log("🧪 Testing single download - should show Save As dialog...");
  try {
    await realFileDownload("test", "test_single_download.pdf");
    console.log("✅ Single download test completed - check your downloads!");
  } catch (error) {
    console.error("❌ Single download test failed:", error);
  }
};

/**
 * Test multiple downloads - should show multiple Save As dialogs
 */
export const testMultipleDownload = async (): Promise<void> => {
  console.log(
    "🧪 Testing multiple downloads - should show multiple Save As dialogs...",
  );
  try {
    await realMultipleFileDownload("test", 3, "test_multiple");
    console.log("✅ Multiple download test completed - check your downloads!");
  } catch (error) {
    console.error("❌ Multiple download test failed:", error);
  }
};

/**
 * Run comprehensive download tests
 */
export const runAllDownloadTests = async (): Promise<void> => {
  console.log("🧪 Starting comprehensive download tests...");

  // Test 1: Single download
  console.log("\n📋 Test 1: Single Download (should show Save As dialog)");
  await testSingleDownload();

  // Wait a moment between tests
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Multiple downloads
  console.log(
    "\n📋 Test 2: Multiple Downloads (should show multiple Save As dialogs)",
  );
  await testMultipleDownload();

  console.log("\n🎉 All download tests completed!");
  console.log("📁 Check your browser's Downloads folder or download area");
  console.log(
    "💡 You should have seen browser Save As dialogs for each download",
  );
};

/**
 * Quick test function that can be called from browser console
 */
export const quickTest = async (): Promise<void> => {
  console.log("⚡ Quick download test - should show Save As dialog...");
  try {
    await realFileDownload("quicktest", "quick_test.pdf");
    console.log("✅ Quick test done - did you see the Save As dialog?");
  } catch (error) {
    console.error("❌ Quick test failed:", error);
  }
};

// Make test functions available globally for easy browser console testing
if (typeof window !== "undefined") {
  (window as any).testSingleDownload = testSingleDownload;
  (window as any).testMultipleDownload = testMultipleDownload;
  (window as any).runAllDownloadTests = runAllDownloadTests;
  (window as any).quickTest = quickTest;

  console.log("🔧 Download test functions available in browser console:");
  console.log("   • quickTest() - Test single download");
  console.log("   • testSingleDownload() - Test single download");
  console.log("   • testMultipleDownload() - Test multiple downloads");
  console.log("   • runAllDownloadTests() - Run all tests");
}
