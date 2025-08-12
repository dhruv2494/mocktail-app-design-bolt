import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: 'quiz_reminder' | 'test_result' | 'new_content' | 'subscription' | 'general';
  data?: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  read_at?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RegisterPushTokenRequest {
  pushToken: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    deviceName?: string;
    osName?: string;
    osVersion?: string;
  };
}

export interface RegisterPushTokenResponse {
  success: boolean;
  message: string;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  message: string;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notification', 'PushToken'],
  endpoints: (builder) => ({
    // Register push token for current user
    registerPushToken: builder.mutation<RegisterPushTokenResponse, RegisterPushTokenRequest>({
      query: (body) => ({
        url: '/users/register-push-token',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PushToken'],
    }),

    // Get user's notifications
    getUserNotifications: builder.query<NotificationsResponse, {
      page?: number;
      limit?: number;
      type?: string;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });

        return {
          url: `/notifications/my-notifications?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<MarkNotificationReadResponse, number>({
      query: (notificationId) => ({
        url: `/notifications/mark-read/${notificationId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: 'Notification', id: notificationId },
        { type: 'Notification', id: 'LIST' },
      ],
    }),

    // Get notification statistics (useful for badge counts)
    getNotificationStats: builder.query<{
      success: boolean;
      data: {
        total_unread: number;
        unread_by_type: {
          quiz_reminder: number;
          test_result: number;
          new_content: number;
          subscription: number;
          general: number;
        };
      };
    }, void>({
      query: () => ({
        url: '/notifications/stats',
        method: 'GET',
      }),
      providesTags: [{ type: 'Notification', id: 'STATS' }],
    }),
  }),
});

export const {
  useRegisterPushTokenMutation,
  useGetUserNotificationsQuery,
  useLazyGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;