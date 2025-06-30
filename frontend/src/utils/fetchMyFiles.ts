

export interface MyFileData {
  id: number;
  name: string;
  url: string;
  size: string;
  pages: number;
}

export const fetchMyFiles = async (token: string): Promise<MyFileData[]> => {
  const url = "http://localhost:8000/myfiles/base/"; // sau api/myfiles/base/

  try {
    console.log("📡 Fetching from:", url);
    console.log("🪪 Token exists?", !!token);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📬 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text(); // poate conține HTML sau mesaj util
      console.warn("⚠️ Fetch failed:", response.status, errorText);
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ My Files response:", data);
    return data;
  } catch (error: any) {
    console.error("❌ Error fetching My Files:", error.message || error);
    return [];
  }
};


