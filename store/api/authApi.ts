import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store';

import { API_CONFIG } from '@/config/constants';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface MessageResponse {
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      // Add ngrok bypass header if using ngrok
      if (API_CONFIG.BASE_URL.includes('ngrok')) {
        headers.set('ngrok-skip-browser-warning', 'true');
      }
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/users/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store token in AsyncStorage
          await AsyncStorage.setItem('token', data.token);
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store token in AsyncStorage
          await AsyncStorage.setItem('token', data.token);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    verifyOTP: builder.mutation<MessageResponse, OTPVerifyRequest>({
      query: (credentials) => ({
        url: '/users/otp-verify',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (credentials) => ({
        url: '/users/forgotPassword',
        method: 'POST',
        body: credentials,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (credentials) => ({
        url: '/users/resetPassword',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;