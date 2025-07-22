import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '../../hooks/useAuth';
import authSlice from '../../store/slices/authSlice';
import { authApi } from '../../store/api/authApi';

// Mock jwt-decode
jest.mock('jwt-decode');
const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={createTestStore()}>{children}</Provider>
);

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.removeItem.mockClear();
  });

  it('should initialize auth state with valid token', async () => {
    const mockToken = 'valid-token';
    const mockDecodedToken = {
      id: 'user-id',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
    mockJwtDecode.mockReturnValueOnce(mockDecodedToken);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.initializeAuthState();
    });

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('token');
    expect(mockJwtDecode).toHaveBeenCalledWith(mockToken);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should remove expired token', async () => {
    const mockToken = 'expired-token';
    const mockDecodedToken = {
      id: 'user-id',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
    };

    mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
    mockJwtDecode.mockReturnValueOnce(mockDecodedToken);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.initializeAuthState();
    });

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should handle invalid token', async () => {
    const mockToken = 'invalid-token';

    mockAsyncStorage.getItem.mockResolvedValueOnce(mockToken);
    mockJwtDecode.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.initializeAuthState();
    });

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should handle no token in storage', async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.initializeAuthState();
    });

    expect(mockJwtDecode).not.toHaveBeenCalled();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logoutUser();
    });

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.initializeAuthState();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error initializing auth state:',
      expect.any(Error)
    );
    expect(result.current.isLoggedIn).toBe(false);

    consoleSpy.mockRestore();
  });
});