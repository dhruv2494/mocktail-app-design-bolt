# MockTale App - Authentication Integration

## Overview
This is the client-side React Native application for MockTale, integrated with Redux Toolkit for state management and authentication.

## Features Implemented

### Authentication System
- **User Registration** with email verification
- **User Login** with JWT token storage
- **OTP Verification** for email confirmation
- **Forgot Password** functionality
- **Password Reset** with OTP verification
- **Secure Token Management** with AsyncStorage
- **Automatic Token Validation** and refresh

### State Management
- **Redux Toolkit** for centralized state management
- **RTK Query** for efficient API calls and caching
- **Persistent Auth State** across app sessions
- **Error Handling** with user-friendly messages

### Security Features
- JWT token validation with expiry checks
- Secure token storage using AsyncStorage
- Form validation with proper error messages
- Password strength requirements (minimum 6 characters)

## Architecture

### Store Structure
```
store/
├── store.ts          # Main store configuration
├── slices/
│   └── authSlice.ts  # Authentication state management
└── api/
    └── authApi.ts    # API endpoints with RTK Query
```

### Authentication Flow
1. User registers → JWT token stored → Email verification required
2. User verifies OTP → Account activated → Redirect to home
3. User logs in → JWT token stored → Redirect to home
4. Token validation on app startup → Auto-login if valid

### Components Integration
- All auth screens integrated with Redux state
- Form validation with Toast notifications
- Loading states during API calls
- Navigation based on auth status

## API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/otp-verify` - OTP verification
- `POST /api/users/forgotPassword` - Forgot password request
- `POST /api/users/resetPassword` - Password reset

## Configuration

### Environment Setup
Base URL configured in `config/constants.ts`:
- Development: `http://localhost:3000`
- Production: Configure your production API URL

### Backend Requirements
Ensure your backend server is running on port 3000 with the following endpoints implemented:
- User registration with email OTP
- Login with JWT tokens
- OTP verification
- Password reset functionality

## Testing

### Manual Testing Steps

1. **Registration Flow**:
   - Fill out signup form with valid data
   - Check for validation errors with invalid inputs
   - Verify OTP email is sent
   - Complete OTP verification

2. **Login Flow**:
   - Login with valid credentials
   - Test invalid credentials handling
   - Verify token storage and persistence

3. **Password Reset Flow**:
   - Request password reset with email
   - Verify OTP email for reset
   - Complete password update

4. **Token Management**:
   - App restart with valid token (auto-login)
   - App restart with expired token (logout)

### Automated Tests
Test suites created for:
- Auth slice reducers
- API endpoints
- useAuth hook
- Component integration

Run tests with:
```bash
npm test
```

## Development Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Backend Connection Issues**:
   - Ensure backend server is running on port 3000
   - Check CORS configuration on backend
   - Verify API endpoints are accessible

2. **Token Storage Issues**:
   - Clear AsyncStorage if tokens are corrupted
   - Check device storage permissions

3. **Navigation Issues**:
   - Verify Expo Router setup
   - Check screen imports and exports

### Debug Features

The app includes comprehensive error handling:
- Network errors are caught and displayed
- Form validation with clear error messages
- Token expiry handling with auto-logout
- Development logs for debugging

## Production Deployment

Before deploying:
1. Update `API_CONFIG.BASE_URL` in `config/constants.ts`
2. Test all authentication flows
3. Verify secure token storage
4. Test error handling scenarios
5. Run full test suite

## Security Considerations

- JWT tokens are stored securely using AsyncStorage
- Passwords are validated before submission
- API responses are properly error-handled
- No sensitive data is logged in production
- Token expiry is properly managed