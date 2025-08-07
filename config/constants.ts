// API Configuration
export const API_CONFIG = {
  BASE_URL:  'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/users/register',
      LOGIN: '/api/users/login',
      OTP_VERIFY: '/api/users/otp-verify',
      FORGOT_PASSWORD: '/api/users/forgotPassword',
      RESET_PASSWORD: '/api/users/resetPassword',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

// Auth Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  TOKEN_EXPIRY_BUFFER: 60, // 1 minute buffer before actual expiry
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'MockTale',
  VERSION: '1.0.0',
  IS_DEVELOPMENT: __DEV__,
  ENABLE_NOTIFICATIONS: true, // Can be set to false during development
};