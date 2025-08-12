import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_CONFIG } from '@/config/constants';
import { Platform } from 'react-native';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export interface UserProfile {
  id: number;
  uuid: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  schoolName?: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  created_at: string;
  updated_at: string;
  stats?: UserStats;
}

export interface UserStats {
  testsCompleted: number;
  totalScore: number;
  averageScore: number;
  rank: number;
  studyHours: number;
  streak: number;
}

export interface TestHistoryItem {
  id: number;
  uuid: string;
  test: {
    id: number;
    uuid: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
  };
  start_time: string;
  completed_at: string;
  time_taken: number;
  score: number;
  total_marks: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
}

export interface Subscription {
  id: number;
  test_series: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    price: number;
  };
  start_date: string;
  expiry_date: string | null;
  is_active: boolean;
  transaction_id: string;
  amount: number;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers, { getState }) => {
      const authState = (getState() as RootState).auth;
      let token = authState.token;
      
      // If no token in Redux, try to get it from AsyncStorage as fallback
      if (!token) {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const { AUTH_CONFIG } = require('@/config/constants');
          token = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        } catch (error) {
          console.log('Error getting token from AsyncStorage:', error);
        }
      }
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Profile', 'TestHistory', 'Subscriptions'],
  endpoints: (builder) => ({
    // Get user profile
    getProfile: builder.query<{ success: boolean; data: UserProfile }, void>({
      query: () => '/profile/profile',
      providesTags: ['Profile'],
    }),

    // Update user profile
    updateProfile: builder.mutation<
      { success: boolean; message: string; data: UserProfile },
      Partial<UserProfile> & { avatar?: string | Blob }
    >({
      query: (profileData) => {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(profileData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'avatar') {
            formData.append(key, value.toString());
          }
        });
        
        // Add avatar if provided
        if (profileData.avatar) {
          if (profileData.avatar instanceof Blob) {
            // For web when we pass a blob
            formData.append('avatar', profileData.avatar, 'avatar.jpg');
          } else {
            // For mobile, send as file
            formData.append('avatar', {
              uri: profileData.avatar,
              type: 'image/jpeg',
              name: 'avatar.jpg',
            } as any);
          }
        }
        
        return {
          url: '/profile/profile',
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),

    // Get test history
    getTestHistory: builder.query<
      {
        success: boolean;
        data: {
          sessions: TestHistoryItem[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/profile/profile/test-history',
        params: { page, limit },
      }),
      providesTags: ['TestHistory'],
    }),

    // Get user subscriptions
    getSubscriptions: builder.query<
      { success: boolean; data: Subscription[] },
      void
    >({
      query: () => '/profile/profile/subscriptions',
      providesTags: ['Subscriptions'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetTestHistoryQuery,
  useGetSubscriptionsQuery,
} = userApi;