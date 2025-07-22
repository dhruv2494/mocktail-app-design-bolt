import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  uuid: string;
  email: string;
  username: string;
  phone?: string;
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingVerification: {
    email: string | null;
    isOTPSent: boolean;
  };
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingVerification: {
    email: null,
    isOTPSent: false,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; token: string }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user || state.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPendingVerification: (
      state,
      action: PayloadAction<{ email: string; isOTPSent: boolean }>
    ) => {
      state.pendingVerification = action.payload;
    },
    clearPendingVerification: (state) => {
      state.pendingVerification = {
        email: null,
        isOTPSent: false,
      };
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.pendingVerification = {
        email: null,
        isOTPSent: false,
      };
      AsyncStorage.removeItem('token');
    },
    initializeAuth: (
      state,
      action: PayloadAction<{ token?: string; user?: User }>
    ) => {
      if (action.payload.token) {
        state.token = action.payload.token;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  setCredentials,
  setLoading,
  setError,
  clearError,
  setPendingVerification,
  clearPendingVerification,
  logout,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;