# Authentication Testing Guide

## Issues Fixed

### 1. API Endpoint Issue ✅
- **Problem**: 404 error on `/users/register` endpoint
- **Solution**: Fixed BASE_URL configuration to include `/api` prefix
- **Result**: API calls now go to `https://23c17cae8e36.ngrok-free.app/api/users/register`

### 2. Router Layout Issue ✅
- **Problem**: "No route named 'test' exists" error
- **Solution**: Created `app/test/_layout.tsx` to properly configure nested routes
- **Result**: Test screens (quiz, leaderboard, results, solutions) now properly routed

### 3. Ngrok Headers ✅
- **Problem**: Ngrok browser warning blocking API calls
- **Solution**: Added `ngrok-skip-browser-warning: true` header for ngrok URLs
- **Result**: Ngrok tunnel requests bypass browser warning

## Testing Steps

### 1. Registration Flow
1. Navigate to signup screen
2. Fill in valid details:
   - Name: "Test User"
   - Email: "test@example.com" 
   - Password: "Test123456"
   - Confirm Password: "Test123456"
   - Phone: "1234567890" (optional)
3. Submit form
4. Should receive success toast and navigate to OTP verification
5. Check email for 4-digit OTP
6. Enter OTP and verify
7. Should redirect to home screen on success

### 2. Login Flow
1. Navigate to login screen
2. Enter registered credentials
3. Should receive success toast and redirect to home
4. Token should be stored in AsyncStorage

### 3. Forgot Password Flow
1. Navigate to forgot password screen
2. Enter registered email
3. Should receive success toast and redirect to OTP verification
4. Enter received OTP
5. Should redirect to password reset screen
6. Enter new password and confirm
7. Should redirect to login screen

### 4. Token Persistence
1. Close and restart the app
2. Should auto-login if token is valid
3. Should logout if token is expired

## Expected API Responses

### Registration Success
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login Success
```json
{
  "message": "Login successful", 
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### OTP Verification Success
```json
{
  "message": "OTP verified successfully"
}
```

## Troubleshooting

### Common Issues

1. **Network Error**: Check if backend server is running
2. **CORS Error**: Ensure backend has proper CORS configuration
3. **Token Issues**: Clear AsyncStorage and try again
4. **Navigation Issues**: Check router configuration

### Debug Commands

```bash
# Check app status
npm run dev

# Run linting
npm run lint

# Clear Expo cache
npx expo start --clear

# Reset simulator
npx expo run:ios --device=simulator --clear
```

## Backend Requirements

Ensure your backend server supports:
- CORS for ngrok domain
- Proper JSON responses
- JWT token generation
- Email OTP sending
- All authentication endpoints

## Success Indicators

✅ Registration creates user and sends OTP email
✅ OTP verification activates account  
✅ Login returns JWT token
✅ Token is stored and persisted
✅ Auto-login works on app restart
✅ Password reset flow works end-to-end
✅ Proper error handling with user-friendly messages