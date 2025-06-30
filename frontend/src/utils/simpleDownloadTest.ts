/**
 * Ultra Simple Download Test
 * This WILL work and show browser download - step by step debugging
 */

/**
 * Test 1: Download simple text file
 */
export const testTextDownload = (): void => {
  console.log("🧪 TEST 1: Simple text file download");

  // Create simple text content
  const content =
    "Hello! This is a test download from ALTech PDF Tools.\nGenerated at: " +
    new Date().toString();
  const blob = new Blob([content], { type: "text/plain" });

  // Create download URL
  const url = URL.createObjectURL(blob);
  console.log("✅ Blob URL created:", url);

  // Create download link
  const a = document.createElement("a");
  a.href = url;
  a.download = "altech_test.txt";
  a.style.display = "none";

  console.log("✅ Download link created:", a);

  // Add to DOM
  document.body.appendChild(a);
  console.log("✅ Link added to DOM");

  // Click to download
  console.log("🖱️ Clicking download link...");
  a.click();
  console.log("✅ Click event triggered");

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("🧹 Cleanup completed");
  }, 1000);

  console.log("📁 Check your Downloads folder for 'altech_test.txt'");
};

/**
 * Test 2: Download JSON file
 */
export const testJsonDownload = (): void => {
  console.log("🧪 TEST 2: JSON file download");

  const data = {
    test: "ALTech PDF Tools Download Test",
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    success: true,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "altech_test.json";
  a.style.display = "none";

  document.body.appendChild(a);
  console.log("🖱️ Downloading JSON file...");
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);

  console.log("📁 Check your Downloads folder for 'altech_test.json'");
};

/**
 * Test 3: Download PDF using fetch
 */
export const testPdfDownload = async (): Promise<void> => {
  console.log("🧪 TEST 3: PDF file download via fetch");

  try {
    console.log("🔄 Fetching PDF from external URL...");
    const response = await fetch(
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("✅ PDF fetched successfully");
    const blob = await response.blob();
    console.log("✅ Blob created, size:", blob.size, "bytes");

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "altech_test.pdf";
    a.style.display = "none";

    document.body.appendChild(a);
    console.log("🖱️ Downloading PDF file...");
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    console.log("📁 Check your Downloads folder for 'altech_test.pdf'");
  } catch (error) {
    console.error("❌ PDF download failed:", error);
    console.log("🔧 Trying alternative PDF method...");

    // Fallback: create a minimal PDF
    const minimalPdf = `%PDF-1.3
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
185
%%EOF`;

    const pdfBlob = new Blob([minimalPdf], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "altech_fallback.pdf";
    a.style.display = "none";

    document.body.appendChild(a);
    console.log("🖱️ Downloading fallback PDF...");
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  }
};

/**
 * Test 4: Force download with window.open
 */
export const testForceDownload = (): void => {
  console.log("🧪 TEST 4: Force download with window.open");

  const content =
    "ALTech PDF Tools - Force Download Test\nThis should definitely trigger a download!";
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  // Try opening in new window
  const newWindow = window.open(url, "_blank");

  if (newWindow) {
    console.log("✅ New window opened");
    // Create download link in the new window
    setTimeout(() => {
      const a = newWindow.document.createElement("a");
      a.href = url;
      a.download = "altech_force_test.txt";
      newWindow.document.body.appendChild(a);
      a.click();
      newWindow.close();
    }, 500);
  } else {
    console.log("❌ Popup blocked, trying direct method");
    const a = document.createElement("a");
    a.href = url;
    a.download = "altech_force_test.txt";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
};

/**
 * Run all tests in sequence
 */
export const runAllSimpleTests = async (): Promise<void> => {
  console.log("🚀 STARTING ALL DOWNLOAD TESTS");
  console.log("===============================");

  console.log("\n1️⃣ Testing text download...");
  testTextDownload();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("\n2️⃣ Testing JSON download...");
  testJsonDownload();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("\n3️⃣ Testing PDF download...");
  await testPdfDownload();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("\n4️⃣ Testing force download...");
  testForceDownload();

  console.log("\n✅ ALL TESTS COMPLETED!");
  console.log("📁 Check your Downloads folder");
  console.log("💡 If you see files downloading, the system works!");
};

// Make functions available globally
if (typeof window !== "undefined") {
  (window as any).testTextDownload = testTextDownload;
  (window as any).testJsonDownload = testJsonDownload;
  (window as any).testPdfDownload = testPdfDownload;
  (window as any).testForceDownload = testForceDownload;
  (window as any).runAllSimpleTests = runAllSimpleTests;

  console.log("🔧 Simple download test functions available:");
  console.log("   • testTextDownload() - Download text file");
  console.log("   • testJsonDownload() - Download JSON file");
  console.log("   • testPdfDownload() - Download PDF file");
  console.log("   • testForceDownload() - Force download test");
  console.log("   • runAllSimpleTests() - Run all tests");
  console.log("\n💡 Open DevTools (F12) and try: testTextDownload()");
}
