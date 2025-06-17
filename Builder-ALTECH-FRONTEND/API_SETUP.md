# Django Backend Connection Guide

## Backend API Integration

The ALTech PDF frontend is configured to connect directly to a Django backend API. All functionality requires a working Django backend server.

### 1. Environment Variables

Create or update the `.env.local` file in the root directory:

```bash
# Django Backend API URL - update this to match your Django server
VITE_API_URL=http://localhost:8000

# For production, use your production Django API URL:
# VITE_API_URL=https://your-django-api-domain.com
```

### 2. Django Backend Requirements

The frontend connects to these Django API endpoints:

#### File Management

- `POST /file_manager/free/upload/` - File upload (multipart/form-data)
- `GET /file_manager/free/list/` - List user files
- `GET /file_manager/free/download/<id>/` - Download file
- `DELETE /file_manager/free/delete/<id>/` - Delete file

#### User Management

- `GET /custom_auth/me/` - Get user profile
- `PATCH /custom_auth/me/` - Update user profile
- `PATCH /custom_auth/me/` - Update profile image (multipart/form-data with `profile_image` field)

#### Authentication

- `POST /custom_auth/login/` - User login
- `POST /custom_auth/register/` - User registration
- `POST /custom_auth/logout/` - User logout

### 3. Expected Response Formats

#### File Upload Response

```json
{
  "id": "file_id",
  "filename": "example.pdf",
  "size": 1024000,
  "created_at": "2024-01-01T12:00:00Z",
  "status": "Original"
}
```

#### File List Response

```json
[
  {
    "id": "1",
    "name": "document.pdf",
    "size": 1024000,
    "created_at": "2024-01-01T12:00:00Z",
    "status": "Original"
  }
]
```

#### User Profile Response

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile_image": "/media/profile_images/user.jpg"
}
```

### 4. Authentication

All protected endpoints require JWT token authentication:

- Token should be included in `Authorization: Bearer <token>` header
- Login endpoint returns token for subsequent requests
- Frontend automatically includes auth headers for all API calls

### 5. Error Handling

When Django backend is unavailable or returns errors:

- **Connection Errors**: Shows "Cannot connect to backend" message
- **HTTP Errors**: Displays specific error messages from Django response
- **Timeout Errors**: Shows timeout message with backend URL
- **No Mock Data**: All errors are real - no fallback responses

### 6. Troubleshooting

#### Common Issues:

**"Cannot connect to backend at http://localhost:8000"**

- Ensure Django server is running on the configured URL
- Check that Django server is accessible from frontend domain
- Verify `VITE_API_URL` in your `.env.local` file

**"CORS errors"**

- Configure Django CORS settings to allow frontend domain
- Install and configure `django-cors-headers` package
- Add frontend URL to `CORS_ALLOWED_ORIGINS`

**"401 Unauthorized"**

- Verify JWT token authentication is properly implemented in Django
- Check that user is logged in and token is valid
- Ensure `Authorization` header is properly sent

**"File upload fails"**

- Check Django file upload settings (`FILE_UPLOAD_MAX_MEMORY_SIZE`, `DATA_UPLOAD_MAX_MEMORY_SIZE`)
- Verify multipart/form-data is properly handled in Django views
- Check that file field name matches Django endpoint expectation

### 7. Production Deployment

For production:

1. Set `VITE_API_URL` to your production Django API URL
2. Configure Django CORS for your frontend domain
3. Ensure Django static/media files are properly served
4. Configure proper authentication token handling
5. Test all endpoints are accessible from production frontend domain

### 8. Development Workflow

1. Start Django backend server
2. Update `.env.local` with correct Django URL if different from localhost:8000
3. Start frontend development server
4. All API calls will connect to Django backend
5. Real errors will be shown if backend is unavailable
