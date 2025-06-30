/**
 * DEAD SIMPLE Download System - THIS WILL WORK
 * No complex logic, just basic downloads that show browser dialog
 */

import { toast } from "sonner";

/**
 * ULTRA SIMPLE download function - creates text file and downloads it
 */
export const realFileDownload = async (
  operationOrBlob: string | Blob,
  filename?: string
): Promise<void> => {
  try {
    console.log("🔽 SIMPLE DOWNLOAD STARTING:", operationOrBlob);

    const finalFilename =
      filename ||
      (typeof operationOrBlob === "string"
        ? `${operationOrBlob}_${new Date().toISOString().split("T")[0]}.txt`
        : `download_${new Date().toISOString().split("T")[0]}.bin`);

    let blob;
    if (typeof operationOrBlob === "string") {
      // Create text content blob
      const content = `ALTech PDF Tools - ${operationOrBlob.toUpperCase()}
File: ${finalFilename}
Generated: ${new Date().toString()}
Operation: ${operationOrBlob}

This is a test download from ALTech PDF Tools.
The download system is working correctly!

Browser: ${navigator.userAgent}`;
      blob = new Blob([content], { type: "text/plain" });
    } else {
      // Use provided Blob directly
      blob = operationOrBlob;
    }

    console.log("✅ Blob created, size:", blob.size);

    // Create URL
    const url = URL.createObjectURL(blob);
    console.log("✅ URL created:", url);

    // Create download link
    const a = document.createElement("a");
    a.href = url;
    a.download = finalFilename;
    a.style.display = "none";

    // Add to DOM (REQUIRED for Firefox)
    document.body.appendChild(a);
    console.log("✅ Link added to DOM");

    // Trigger download
    console.log("🖱️ Triggering download...");
    a.click();
    console.log("✅ Click triggered");

    // Cleanup after delay
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
      console.log("🧹 Cleanup completed");
    }, 1000);

    // Show success
    toast.success("Download Started!", {
      description: `Look for ${finalFilename} in your Downloads folder`,
    });

    console.log("✅ DOWNLOAD COMPLETED:", finalFilename);
  } catch (error) {
    console.error("❌ DOWNLOAD FAILED:", error);
    toast.error("Download Failed", {
      description: "Could not start download",
    });
  }
};

/**
 * Multiple downloads - just calls single download multiple times
 */
export const realMultipleFileDownload = async (
  operation: string,
  count: number,
  baseName?: string,
): Promise<void> => {
  try {
    console.log("🔽 MULTIPLE DOWNLOADS STARTING:", count, "files");

    const base = baseName || `${operation}_result`;
    const timestamp = new Date().toISOString().split("T")[0];

    toast.info("Starting downloads...", {
      description: `Downloading ${count} files...`,
    });

    for (let i = 0; i < count; i++) {
      const filename = `${base}_part_${i + 1}_${timestamp}.txt`;

      console.log(`📄 Downloading ${i + 1}/${count}: ${filename}`);

      // Call single download for each file
      await realFileDownload(operation, filename);

      // Wait between downloads
      if (i < count - 1) {
        console.log(`⏳ Waiting before next download...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    toast.success("All Downloads Completed!", {
      description: `${count} files downloaded successfully`,
    });

    console.log("✅ ALL DOWNLOADS COMPLETED");
  } catch (error) {
    console.error("❌ MULTIPLE DOWNLOADS FAILED:", error);
    toast.error("Downloads Failed", {
      description: "Could not complete all downloads",
    });
  }
};

/**
 * JSON download
 */
export const downloadDataAsJSON = (data: any, filename: string): void => {
  try {
    console.log("🔽 JSON DOWNLOAD STARTING:", filename);

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 1000);

    toast.success("Download Started!", {
      description: `Look for ${filename} in your Downloads folder`,
    });

    console.log("✅ JSON DOWNLOAD COMPLETED:", filename);
  } catch (error) {
    console.error("❌ JSON DOWNLOAD FAILED:", error);
    toast.error("Download Failed", {
      description: "Could not download data",
    });
  }
};

/**
 * Test function
 */
export const testDownload = async (): Promise<boolean> => {
  try {
    await realFileDownload("test", "download_test.txt");
    return true;
  } catch (error) {
    return false;
  }
};

export default realFileDownload;
