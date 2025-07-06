import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { djangoAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const MyFilesTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const testMyFilesAPI = async () => {
    setIsLoading(true);

    try {
      console.log("🧪 Testing My Files API...");
      console.log("🧪 API function:", djangoAPI.getFiles);

      const response = await djangoAPI.getFiles();

      console.log("🧪 Raw API Response:", response);
      console.log("🧪 Response type:", typeof response);
      console.log("🧪 Response keys:", Object.keys(response || {}));

      if (response && response.success) {
        console.log("🧪 Success! Data:", response.data);
        console.log("🧪 Data type:", typeof response.data);
        console.log("🧪 Data is array:", Array.isArray(response.data));

        if (Array.isArray(response.data)) {
          console.log("🧪 Number of files:", response.data.length);
          console.log("🧪 First file:", response.data[0]);
        }

        toast.success(
          `API Test Success! Found ${response.data?.length || 0} files`,
          {
            description: "Check console for detailed response data",
          },
        );
      } else {
        console.warn("🧪 API returned unsuccessful response:", response);
        toast.error("API Test Failed - Unsuccessful Response", {
          description: response?.message || "No success flag in response",
        });
      }
    } catch (error) {
      console.error("🧪 API Test Error:", error);
      toast.error("API Test Failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={testMyFilesAPI}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "🧪"}
      Test My Files API
    </Button>
  );
};

export default MyFilesTestButton;