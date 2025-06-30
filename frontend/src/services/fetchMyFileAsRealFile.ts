export async function fetchMyFileAsRealFile(fileId: string, fileName: string, token: string) {
  try {
    // determinăm planul corect în funcție de cum ai organizat sistemul (Free vs Pro)
    const isProUser = false; // poți adăuga logică din profil dacă e nevoie

    const url = isProUser
      ? `http://localhost:8000/api/myfiles/pro/${fileId}/download/`
      : `http://localhost:8000/api/myfiles/base/${fileId}/download/`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file. Status: ${response.status}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: "application/pdf" });
    return file;
  } catch (error) {
    console.error("❌ Eroare în fetchMyFileAsRealFile:", error);
    throw error;
  }
}