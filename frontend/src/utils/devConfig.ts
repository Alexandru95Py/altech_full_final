/**
 * Development configuration helper
 * Shows current API configuration for Django backend connection
 */

export const logDevConfig = () => {
  if (!import.meta.env.DEV) return;

  console.group("🚀 ALTech PDF - Django Backend Configuration");
  console.log(
    "📡 API URL:",
    import.meta.env.VITE_API_URL || "http://localhost:8000 (default)",
  );
  console.log("🌍 Environment:", import.meta.env.MODE);

  console.log("\n📋 Django Backend Endpoints:");
  console.log("   • GET /file_manager/free/list/ - List files");
  console.log("   • POST /file_manager/free/upload/ - Upload files");
  console.log("   • GET /file_manager/free/download/<id>/ - Download files");
  console.log("   • DELETE /file_manager/free/delete/<id>/ - Delete files");
  console.log("   • GET /custom_auth/me/ - Get user profile");
  console.log("   • PATCH /custom_auth/me/ - Update user profile");

  console.log("\n⚠️  Note: All API calls connect to Django backend only");
  console.groupEnd();
};

export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:8000";
};
