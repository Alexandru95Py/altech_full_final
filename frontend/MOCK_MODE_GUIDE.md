# ALTech PDF - Mock Mode Guide

## 🎭 Overview

ALTech PDF frontend now supports **Mock Mode** - a comprehensive development environment that simulates all backend functionality without requiring a live Django server. This allows for complete frontend development, testing, and demonstration without backend dependencies.

## 🚀 Quick Start

### Enable Mock Mode

Mock mode is controlled by a simple flag in the configuration:

```typescript
// src/config/mockMode.ts
export const IS_MOCK_MODE = true; // Set to false for real backend
```

### Visual Indicators

When mock mode is active, you'll see:

- **🎭 MOCK MODE ACTIVE** banner at the top of the application
- Console logs for all API calls with timing and data
- Realistic delays and progress simulation

## 📋 Features Included in Mock Mode

### ✅ Complete API Coverage

All frontend features work in mock mode:

**Authentication & User Management**

- ✅ Login with email validation
- ✅ User registration
- ✅ Profile management
- ✅ Profile image upload
- ✅ JWT token simulation

**File Management**

- ✅ File upload with progress tracking
- ✅ File listing with metadata
- ✅ File download (creates mock files)
- ✅ File deletion
- ✅ Storage usage calculation

**PDF Creation & Editing**

- ✅ Document creation with rich text editor
- ✅ Fill & Sign with interactive elements
- ✅ PDF processing (split, merge, compress)
- ✅ Page manipulation (extract, delete, reorder)
- ✅ Batch processing operations

**Advanced Features**

- ✅ Error simulation (5% error rate)
- ✅ Network delay simulation
- ✅ Progress tracking for uploads
- ✅ Realistic file sizes and metadata
- ✅ Session-based data persistence

## 🔧 Configuration Options

### Mock Settings

```typescript
// src/config/mockMode.ts
export const MOCK_CONFIG = {
  delays: {
    fast: 200, // Quick operations
    medium: 500, // Standard API calls
    slow: 1000, // File operations
    upload: 100, // Progress intervals
  },

  data: {
    upload: {
      successRate: 0.95, // 95% success rate
      progressSteps: 20, // Progress granularity
    },

    storage: {
      used: 45 * 1024 * 1024, // 45MB used
      total: 100 * 1024 * 1024, // 100MB total
    },
  },

  logging: {
    enabled: true, // Console logging
    includeTimestamp: true, // Add timestamps
    includeRequestDetails: true,
    includeResponsePreview: true,
  },
};
```

### Sample Data

Mock mode includes realistic sample data:

```typescript
// Pre-loaded sample files
- Sample_Document.pdf (2.4MB, 12 pages)
- Project_Report.pdf (1.8MB, 8 pages)
- Invoice_2024_001.pdf (512KB, 3 pages)

// Default user profile
- Email: demo@altech.com
- Name: Demo User
- Storage: 45MB used / 100MB total
```

## 🛠️ Development Workflow

### 1. Start Development

```bash
npm run dev
```

The application will automatically detect mock mode and display the banner.

### 2. Test All Features

Mock mode allows you to test:

- **Upload files**: Simulates real upload progress
- **Create documents**: Full document editor functionality
- **Fill & Sign**: Interactive PDF elements
- **File management**: Download, delete, organize files
- **User authentication**: Login/register flows
- **Error handling**: Simulated network errors

### 3. Console Monitoring

All mock API calls are logged with details:

```
🎭 MOCK API CALL
⏰ Time: 2024-01-15T10:30:00Z
🔧 Method: POST
🛣️ Route: /file_manager/free/upload/
📤 Request Data: { fileName: "document.pdf", fileSize: 2457600 }
📥 Response Preview: ["id", "name", "size", "url"]
```

### 4. Switch to Real Backend

To connect to real Django backend:

```typescript
// src/config/mockMode.ts
export const IS_MOCK_MODE = false;
```

Set your backend URL:

```bash
# .env.local
VITE_API_URL=http://localhost:8000
```

## 📊 Mock Data Management

### File Persistence

Mock data persists during the browser session:

- Files uploaded are stored in memory
- User profile changes are maintained
- Fill & Sign data is preserved
- Data resets on page refresh

### Storage Simulation

Mock mode simulates realistic storage constraints:

- Tracks total storage usage
- Updates available space
- Shows percentage used
- Prevents uploads when full

### Error Simulation

Configurable error rates for testing:

- Network timeouts (configurable %)
- Authentication failures
- File validation errors
- Server errors

## 🎯 Use Cases

### Frontend Development

- Develop UI components without backend
- Test user interactions and flows
- Validate error handling
- Performance testing with delays

### Demonstrations

- Show complete functionality to stakeholders
- Demo without server setup
- Present features in any environment
- Offline capability demonstration

### Testing

- Automated frontend testing
- User acceptance testing
- Integration testing preparation
- Error scenario validation

## 🔄 API Mapping

Mock API exactly mirrors the real Django endpoints:

| Feature     | Mock Endpoint                | Real Django Endpoint                    |
| ----------- | ---------------------------- | --------------------------------------- |
| Login       | `mockAPI.login()`            | `POST /custom_auth/login/`              |
| Upload      | `mockAPI.uploadFile()`       | `POST /file_manager/free/upload/`       |
| List Files  | `mockAPI.getFiles()`         | `GET /file_manager/free/list/`          |
| Download    | `mockAPI.downloadFile()`     | `GET /file_manager/free/download/<id>/` |
| Create PDF  | `mockAPI.createBasicPDF()`   | `POST /create_pdf/free/basic/`          |
| Fill & Sign | `mockAPI.saveFillSignData()` | `POST /fill-sign/save/<id>/`            |

## 🎨 UI Components

### MockModeBanner

Displays prominent notification when in mock mode:

```typescript
// Automatic display (included in App.tsx)
<MockModeBanner />

// With custom options
<MockModeBanner
  showDetails={true}
  onDismiss={() => console.log('Dismissed')}
/>
```

### Features:

- **Always visible** when mock mode is active
- **Detailed view** showing mock configuration
- **Dismissible** option for clean screenshots
- **Configuration display** with current settings

## 🚦 Status Indicators

Mock mode provides clear visual feedback:

- **🎭 Banner**: Always visible when active
- **📊 Console Logs**: Detailed API call tracking
- **⏱️ Delays**: Realistic timing simulation
- **📈 Progress**: Upload progress simulation
- **❌ Errors**: Configurable error scenarios

## 🔧 Troubleshooting

### Common Issues

**Mock mode not working?**

- Check `IS_MOCK_MODE = true` in `src/config/mockMode.ts`
- Verify import paths are correct
- Check browser console for errors

**API calls going to real backend?**

- Confirm mock mode flag is enabled
- Check that banner is displayed
- Verify console shows mock logs

**Missing mock data?**

- Check sample data in `src/lib/mockData.ts`
- Verify mock storage is working
- Reset data by refreshing page

### Debug Mode

Enable detailed logging:

```typescript
// src/config/mockMode.ts
logging: {
  enabled: true,
  includeTimestamp: true,
  includeRequestDetails: true,
  includeResponsePreview: true,
}
```

## 🚀 Production Deployment

### Switch to Real Backend

1. **Disable mock mode**:

   ```typescript
   export const IS_MOCK_MODE = false;
   ```

2. **Set backend URL**:

   ```bash
   VITE_API_URL=https://your-django-backend.com
   ```

3. **Build and deploy**:
   ```bash
   npm run build
   ```

### Environment Variables

```bash
# Development (.env.local)
VITE_API_URL=http://localhost:8000
IS_MOCK_MODE=true

# Production (.env.production)
VITE_API_URL=https://api.altech.com
IS_MOCK_MODE=false
```

## 📈 Performance

Mock mode is optimized for development:

- **Memory efficient**: Minimal data storage
- **Fast responses**: Configurable delays
- **Clean logging**: Organized console output
- **No network calls**: All responses local

## 🎯 Next Steps

With mock mode active, you can:

1. **Develop new features** without backend dependency
2. **Test edge cases** with error simulation
3. **Demo to stakeholders** in any environment
4. **Validate UI/UX** with realistic data
5. **Prepare for integration** with exact API structure

Mock mode provides the complete ALTech PDF experience without any external dependencies! 🎉
