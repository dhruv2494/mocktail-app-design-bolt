import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store';
import { logout } from '../slices/authSlice';
import { API_CONFIG, AUTH_CONFIG } from '@/config/constants';
import { router } from 'expo-router';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_CONFIG.BASE_URL}/api`,
  prepareHeaders: async (headers, { getState }) => {
    let token = (getState() as RootState).auth.token;
    
    // If no token in Redux, try to get it from AsyncStorage as fallback
    if (!token) {
      try {
        token = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      } catch (error) {
        console.error('Error getting token from AsyncStorage:', error);
      }
    }
    
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
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Check if the response is 401 Unauthorized
  if (result.error && result.error.status === 401) {
    console.log('401 Unauthorized detected, logging out user...');
    
    // Clear token from AsyncStorage
    await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    
    // Dispatch logout action
    api.dispatch(logout());
    
    // Navigate to login screen
    // Using setTimeout to ensure state updates are processed
    setTimeout(() => {
      router.replace('/(auth)/login');
    }, 100);
  }
  
  return result;
};