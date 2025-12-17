# Login Flow Documentation

## Overview
The Lenat Admin application uses a **two-step OTP (One-Time Password) authentication** system with JWT tokens for secure access.

---

## 🔄 Complete Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS /login                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Login.jsx Component Renders                                     │
│  - Email input field                                             │
│  - "Send Verification Code" button                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Enters Email & Submits Form                                │
│  handleSubmit() is called                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  useAuth Hook: requestOTP(email)                                │
│  - Sets loading state                                            │
│  - Calls GraphQL mutation: AUTH_OTP                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  GraphQL API Request                                             │
│  POST /v1/graphql                                                │
│  Mutation: auth_otp(value: $email)                               │
│  Returns: { message: "OTP sent successfully" }                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Success Response Received                                       │
│  - showOTP state set to true                                     │
│  - Success message displayed                                     │
│  - OTPVerification component rendered                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  OTPVerification Component                                       │
│  - 6-digit code input field                                      │
│  - 60-second countdown timer                                     │
│  - "Resend Code" button (after timer expires)                    │
│  - "Back to Login" button                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  User Enters 6-Digit OTP Code                                    │
│  handleSubmit() is called                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  useAuth Hook: verifyOTP(code, email)                            │
│  - Sets loading state                                            │
│  - Calls GraphQL mutation: AUTH_OTP_CALLBACK                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  GraphQL API Request                                             │
│  POST /v1/graphql                                                │
│  Mutation: auth_otp_callback(code: $code, value: $email)        │
│  Returns: {                                                      │
│    access_token: "jwt_token",                                   │
│    refresh_token: "refresh_jwt_token",                          │
│    id: "user_id",                                               │
│    email: "user@example.com",                                   │
│    phone_number: "...",                                          │
│    role: "admin",                                               │
│    new_user: false                                               │
│  }                                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  AuthContext: login(authData)                                    │
│  - Extracts tokens and user data                                 │
│  - Calls tokenManager.saveTokens()                               │
│  - Updates AuthContext state (user, isAuth)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Token Storage (localStorage)                                    │
│  - access_token: JWT token                                       │
│  - refresh_token: Refresh JWT token                              │
│  - user_data: JSON stringified user object                       │
│  - user_id: User ID string                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Router Redirect                                                 │
│  router.push('/home')                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ProtectedRoute Component Check                                  │
│  - Reads isAuth from AuthContext                                 │
│  - If authenticated: renders dashboard                          │
│  - If not authenticated: redirects to /login                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Renders Successfully                                  │
│  User is now logged in and can access protected routes           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### 1. **Entry Point**
- **`src/app/(blank-layout-pages)/login/page.jsx`**
  - Server component that renders the Login view
  - Passes mode (theme) to Login component

### 2. **Login UI Component**
- **`src/views/Login.jsx`**
  - Main login form component
  - Manages email input state
  - Handles form submission
  - Toggles between email form and OTP verification
  - Displays success/error messages

### 3. **OTP Verification Component**
- **`src/components/auth/OTPVerification.jsx`**
  - 6-digit OTP input field
  - 60-second countdown timer
  - Resend OTP functionality
  - Handles OTP verification submission
  - Redirects to dashboard on success

### 4. **Authentication Hook**
- **`src/hooks/useAuth.js`**
  - Wraps Apollo Client mutations
  - Provides `requestOTP()` function
  - Provides `verifyOTP()` function
  - Manages loading and error states
  - Calls AuthContext.login() on successful verification

### 5. **Authentication Context**
- **`src/contexts/AuthContext.jsx`**
  - Global authentication state management
  - Provides `user`, `isAuth`, `loading` states
  - Provides `login()`, `logout()`, `updateUser()` functions
  - Initializes auth state from localStorage on mount
  - Validates tokens on initialization

### 6. **Token Manager**
- **`src/utils/tokenManager.js`**
  - Handles localStorage operations
  - `saveTokens()` - Saves tokens and user data
  - `getAccessToken()` - Retrieves access token
  - `getUserData()` - Retrieves user data
  - `isAuthenticated()` - Validates token expiration
  - `clearTokens()` - Removes all auth data

### 7. **Protected Route Component**
- **`src/components/auth/ProtectedRoute.jsx`**
  - Wraps dashboard routes
  - Checks authentication status
  - Shows loading spinner during auth check
  - Redirects to login if not authenticated
  - Renders children if authenticated

### 8. **GraphQL Mutations**
- **`src/lib/graphql/mutations.js`**
  - `AUTH_OTP` - Request OTP mutation
  - `AUTH_OTP_CALLBACK` - Verify OTP mutation
  - `REFRESH_TOKEN` - Refresh access token mutation

### 9. **Dashboard Layout**
- **`src/app/(dashboard)/layout.jsx`**
  - Wraps all dashboard routes with ProtectedRoute
  - Ensures only authenticated users can access

---

## 🔐 Authentication State Flow

### Initial Load
```
1. App loads → AuthProvider initializes
2. AuthContext checks localStorage for tokens
3. If tokens exist and valid:
   - Sets user state
   - Sets isAuth = true
4. If tokens missing or invalid:
   - Clears tokens
   - Sets isAuth = false
```

### Login Process
```
1. User submits email → requestOTP()
2. OTP sent → User enters code → verifyOTP()
3. Tokens received → login() called
4. Tokens saved → State updated → Redirect to /home
```

### Protected Route Access
```
1. User navigates to protected route
2. ProtectedRoute checks isAuth
3. If authenticated: Render content
4. If not authenticated: Redirect to /login
```

### Logout Process
```
1. User clicks logout
2. logout() called in AuthContext
3. clearTokens() removes all localStorage data
4. State reset (user = null, isAuth = false)
5. Redirect to /login
```

---

## 🔄 Token Management

### Token Storage
- **Access Token**: Stored in `localStorage.access_token`
- **Refresh Token**: Stored in `localStorage.refresh_token`
- **User Data**: Stored in `localStorage.user_data` (JSON string)
- **User ID**: Stored in `localStorage.user_id`

### Token Validation
- Tokens are JWT format
- `isAuthenticated()` decodes JWT and checks expiration
- Expiration checked on app initialization
- Expired tokens automatically cleared

### Token Refresh (Available)
- `REFRESH_TOKEN` mutation available
- Can be implemented for automatic token refresh
- Uses refresh_token to get new access_token

---

## 🎨 User Experience Flow

### Step 1: Email Entry
- User sees login form with email input
- Types email address
- Clicks "Send Verification Code"
- Loading spinner shows during request
- Success message: "Verification code sent to your email"

### Step 2: OTP Verification
- Form switches to OTP input screen
- Large 6-digit input field (centered, spaced)
- 60-second countdown timer
- "Resend Code" button appears after timer
- User enters 6-digit code
- Clicks "Verify Code"
- Loading spinner shows during verification

### Step 3: Success & Redirect
- On successful verification:
  - Tokens saved
  - User redirected to `/home`
  - Dashboard loads with user data

### Error Handling
- Network errors displayed in Alert component
- Invalid OTP shows error message
- User can retry or go back to email entry
- Error messages can be dismissed

---

## 🔧 Key Functions

### `requestOTP(email)`
```javascript
// In useAuth hook
- Validates email input
- Calls AUTH_OTP GraphQL mutation
- Returns { success: true, message: "..." } on success
- Returns { success: false, error: "..." } on failure
```

### `verifyOTP(code, email)`
```javascript
// In useAuth hook
- Validates 6-digit code
- Calls AUTH_OTP_CALLBACK GraphQL mutation
- On success: Calls AuthContext.login() with response data
- Returns { success: true, data: {...} } on success
- Returns { success: false, error: "..." } on failure
```

### `login(authData)`
```javascript
// In AuthContext
- Extracts access_token, refresh_token, userData
- Saves tokens via tokenManager.saveTokens()
- Updates context state (user, isAuth)
- Triggers re-render of protected components
```

### `logout()`
```javascript
// In AuthContext
- Clears all tokens via tokenManager.clearTokens()
- Resets context state (user = null, isAuth = false)
- Redirects to /login
```

---

## 🛡️ Security Features

1. **JWT Token Validation**: Tokens are validated on app load
2. **Token Expiration Check**: Automatic expiration validation
3. **Protected Routes**: All dashboard routes require authentication
4. **Automatic Redirect**: Unauthenticated users redirected to login
5. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

---

## 📝 GraphQL API Endpoints

### Request OTP
```graphql
mutation AuthOtp($value: String!) {
  auth_otp(value: $value) {
    message
  }
}
```

### Verify OTP
```graphql
mutation AuthOtpCallback($code: String!, $value: String!) {
  auth_otp_callback(code: $code, value: $value) {
    access_token
    refresh_token
    id
    email
    phone_number
    role
    new_user
  }
}
```

---

## 🚀 Next Steps / Improvements

1. **Token Refresh**: Implement automatic token refresh before expiration
2. **Remember Me**: Option to persist session longer
3. **Multi-Factor Auth**: Additional security layers
4. **Session Management**: Track active sessions
5. **Error Recovery**: Better error messages and recovery flows
6. **Loading States**: Enhanced loading indicators
7. **Accessibility**: ARIA labels and keyboard navigation

---

## 📊 State Management Summary

```
AuthContext (Global State)
├── user: User object or null
├── isAuth: boolean
├── loading: boolean
└── Functions:
    ├── login(authData)
    ├── logout()
    └── updateUser(newUserData)

useAuth Hook (Local State)
├── loading: boolean
├── error: string | null
└── Functions:
    ├── requestOTP(email)
    ├── verifyOTP(code, email)
    └── clearError()
```

---

This login flow provides a secure, user-friendly authentication experience with proper error handling, loading states, and token management.


