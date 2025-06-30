import axios from "axios";

// Fetch files from the backend
export async function fetchMyFiles() {
  try {
    const response = await axios.get("/api/myfiles/base/");

    // Validate that the response data is an array
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Unexpected response format:", response.data);
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    throw new Error("Failed to fetch files from the server");
  }
}