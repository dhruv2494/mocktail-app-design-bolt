import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../../store/api/authApi';
import authSlice from '../../store/slices/authSlice';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });
};

describe('authApi', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    mockFetch.mockClear();
  });

  describe('register mutation', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        message: 'User registered successfully',
        token: 'test-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const registerMutation = store.dispatch(
        authApi.endpoints.register.initiate({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        })
      );

      const result = await registerMutation;

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/register'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            phone: '1234567890',
          }),
        })
      );
    });

    it('should handle registration failure', async () => {
      const mockError = {
        message: 'User Already Exists with this Email!',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      const registerMutation = store.dispatch(
        authApi.endpoints.register.initiate({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
      );

      const result = await registerMutation;

      expect(result.error).toBeDefined();
      expect(result.error).toMatchObject({
        status: 400,
        data: mockError,
      });
    });
  });

  describe('login mutation', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        message: 'Login successful',
        token: 'login-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const loginMutation = store.dispatch(
        authApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'password123',
        })
      );

      const result = await loginMutation;

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should handle login failure', async () => {
      const mockError = {
        message: 'Invalid email or password',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError,
      } as Response);

      const loginMutation = store.dispatch(
        authApi.endpoints.login.initiate({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      );

      const result = await loginMutation;

      expect(result.error).toBeDefined();
      expect(result.error).toMatchObject({
        status: 401,
        data: mockError,
      });
    });
  });

  describe('verifyOTP mutation', () => {
    it('should handle successful OTP verification', async () => {
      const mockResponse = {
        message: 'OTP verified successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const verifyOTPMutation = store.dispatch(
        authApi.endpoints.verifyOTP.initiate({
          email: 'test@example.com',
          otp: '1234',
        })
      );

      const result = await verifyOTPMutation;

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/otp-verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            otp: '1234',
          }),
        })
      );
    });

    it('should handle invalid OTP', async () => {
      const mockError = {
        message: 'Invalid OTP',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError,
      } as Response);

      const verifyOTPMutation = store.dispatch(
        authApi.endpoints.verifyOTP.initiate({
          email: 'test@example.com',
          otp: '0000',
        })
      );

      const result = await verifyOTPMutation;

      expect(result.error).toBeDefined();
      expect(result.error).toMatchObject({
        status: 401,
        data: mockError,
      });
    });
  });

  describe('forgotPassword mutation', () => {
    it('should handle successful forgot password request', async () => {
      const mockResponse = {
        message: 'OTP sent to your email for password reset',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const forgotPasswordMutation = store.dispatch(
        authApi.endpoints.forgotPassword.initiate({
          email: 'test@example.com',
        })
      );

      const result = await forgotPasswordMutation;

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/forgotPassword'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
          }),
        })
      );
    });
  });

  describe('resetPassword mutation', () => {
    it('should handle successful password reset', async () => {
      const mockResponse = {
        message: 'Password reset successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const resetPasswordMutation = store.dispatch(
        authApi.endpoints.resetPassword.initiate({
          email: 'test@example.com',
          newPassword: 'newpassword123',
        })
      );

      const result = await resetPasswordMutation;

      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/resetPassword'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            newPassword: 'newpassword123',
          }),
        })
      );
    });
  });
});