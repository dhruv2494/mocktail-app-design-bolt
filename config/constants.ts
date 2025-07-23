// API Configuration
export const API_CONFIG = {
  BASE_URL:  'https://9c09d6c6c6e2.ngrok-free.app',
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
  TOKEN_KEY: 'auth_token',
  TOKEN_EXPIRY_BUFFER: 300, // 5 minutes buffer before actual expiry
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'MockTale',
  VERSION: '1.0.0',
};