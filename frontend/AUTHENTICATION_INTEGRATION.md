# Authentication Integration Guide

## JWT Token Management with Django Backend

The frontend is fully integrated with Django authentication using JWT tokens. Here's how the authentication flow works:

### 🔐 **Authentication Flow**

#### **1. User Login**

```typescript
// User submits login form
const response = await djangoAPI.login({
  email: "user@example.com",
  password: "userpassword"
});

// Django returns JWT token
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### **2. Token Storage & Auto-Setup**

```typescript
// Automatically stored in localStorage
localStorage.setItem("authToken", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));

// Automatically configures API client
apiClient.setAuthToken(response.data.token);
```

#### **3. Authenticated Requests**

All subsequent API calls automatically include the JWT token:

```typescript
// Every API call includes: Authorization: Bearer <token>
await djangoAPI.getFiles(); // ✅ Authenticated
await djangoAPI.uploadFile(file); // ✅ Authenticated
await djangoAPI.getUserProfile(); // ✅ Authenticated
```

### 🔄 **Session Persistence**

#### **App Initialization**

```typescript
// On app startup, check for existing token
const token = localStorage.getItem("authToken");
if (token) {
  apiClient.setAuthToken(token);
  // User stays logged in across browser sessions
}
```

#### **Automatic Logout**

```typescript
// On 401 responses, automatically clear auth
if (error.statusCode === 401) {
  apiClient.clearAuthToken();
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  // Redirect to login page
}
```

### 🔧 **Django Backend Requirements**

#### **JWT Token Endpoint**

```python
# Django endpoint: POST /custom_auth/login/
{
  "email": "user@example.com",
  "password": "userpassword"
}

# Expected response:
{
  "token": "jwt_token_string",
  "user": {
    "id": user_id,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_image": "/media/profiles/image.jpg"
  }
}
```

#### **Protected Endpoints**

All file management and profile endpoints expect:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

#### **Token Validation**

Django should validate JWT tokens on all protected routes:

- `/file_manager/free/*` - File operations
- `/custom_auth/me/` - Profile management
- `/create_pdf/*` - PDF creation (if protected)

### 🚫 **No Placeholder Auth**

#### **Removed Fake Authentication**

- ❌ No simulated login with setTimeout()
- ❌ No fake token generation
- ❌ No mock user data
- ❌ No hardcoded authentication responses

#### **Real Error Handling**

- ✅ Real Django authentication errors
- ✅ Real token expiration handling
- ✅ Real network authentication failures
- ✅ Real validation error messages

### 🛡️ **Security Features**

#### **Token Security**

- JWT tokens stored in localStorage (not cookies for CSR protection)
- Automatic token cleanup on logout
- Automatic token validation on app startup
- Token timeout handling with automatic logout

#### **Route Protection**

- Unauthenticated users redirected to login
- Protected routes require valid tokens
- Automatic logout on token expiration
- Clear authentication state management

### 🔄 **User Registration**

#### **Registration Flow**

```typescript
// User submits registration form
const response = await djangoAPI.register({
  email: "newuser@example.com",
  password: "newpassword",
  first_name: "Jane",
  last_name: "Smith",
});

// Django creates account and returns token immediately
// User is automatically logged in after registration
```

#### **Registration Validation**

- Real-time password strength validation
- Email format validation
- Real Django validation error display
- Automatic login after successful registration

### 📱 **Frontend Auth Components**

#### **Auth.tsx - Complete Integration**

- Real Django login API integration
- Real Django registration API integration
- JWT token automatic management
- Real error handling and display
- Automatic navigation after auth success

#### **Profile.tsx - Authenticated Profile Management**

- Loads real user data on mount
- Real profile updates via Django API
- Real profile image upload
- Authenticated API calls with automatic token inclusion

#### **Protected Routes**

All file management and tool pages automatically require authentication:

- MyFiles page - loads user's real files
- Upload functionality - authenticated file uploads
- Download functionality - authenticated downloads
- Profile management - authenticated profile operations

### 🔧 **Development & Production**

#### **Development Setup**

```bash
# .env.local
VITE_API_URL=http://localhost:8000
```

#### **Production Setup**

```bash
# .env.production
VITE_API_URL=https://your-django-api.com
```

#### **CORS Configuration**

Django backend must allow requests from frontend domain:

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://your-frontend-domain.com",  # Production
]
```

## ✅ **Ready for Django Backend**

The authentication system is completely integrated and ready for Django backend connection with:

- Real JWT token management
- Automatic auth header inclusion
- Proper session persistence
- Real error handling
- Complete logout functionality
- Protected route enforcement

No additional frontend changes needed for authentication!
