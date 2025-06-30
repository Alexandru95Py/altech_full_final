export const savePDFToMyFiles = async (file: File, token: string): Promise<Response> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name); // 👈 adăugat explicit

  const response = await fetch("http://localhost:8000/api/myfiles/base/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response;
};
