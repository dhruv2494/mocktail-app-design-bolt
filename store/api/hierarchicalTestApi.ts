import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_CONFIG } from '@/config/constants';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

// Interface definitions for the hierarchical structure
export interface TestSeries {
  id: string;
  uuid: string;
  name: string;
  name_gujarati: string;
  description?: string;
  description_gujarati?: string;
  is_active: boolean;
  pricing_type: 'free' | 'paid';
  price?: number;
  currency?: string;
  demo_tests_count: number;
  subscription_duration_days?: number;
  discount_percentage?: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  categories_count?: number;
  tests_count?: number;
  is_subscribed?: boolean;
}

export interface Category {
  id: string;
  uuid: string;
  name: string;
  name_gujarati: string;
  description?: string;
  description_gujarati?: string;
  is_active: boolean;
  created_at: string;
  sub_categories_count: number;
  tests_count: number;
}

export interface SubCategory {
  id: string;
  uuid: string;
  name: string;
  name_gujarati: string;
  description?: string;
  description_gujarati?: string;
  is_active: boolean;
  created_at: string;
  tests_count: number;
}

export interface Test {
  id: string;
  uuid: string;
  name: string;
  name_gujarati: string;
  description?: string;
  description_gujarati?: string;
  duration_minutes: number;
  total_marks: number;
  pass_percentage: number;
  negative_marking: boolean;
  negative_marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  questions_count: number;
  user_attempts: number;
  max_attempts?: number;
}

export interface Question {
  id: string;
  uuid: string;
  question_text: string;
  question_text_gujarati: string;
  question_type: 'single_choice' | 'multiple_choice';
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_gujarati: string;
  option_b_gujarati: string;
  option_c_gujarati: string;
  option_d_gujarati: string;
  marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  created_at: string;
  // Note: correct_answer and explanation are excluded for security in student API
}

export interface SubscriptionAccess {
  has_access: boolean;
  subscription_type: 'free' | 'premium' | null;
  expires_at?: string;
  can_access_demo: boolean;
  demo_tests_remaining: number;
}

// Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const hierarchicalTestApi = createApi({
  reducerPath: 'hierarchicalTestApi',
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
  tagTypes: ['TestSeries', 'Category', 'SubCategory', 'Test', 'Question', 'SubscriptionAccess'],
  endpoints: (builder) => ({
    // Test Series endpoints
    getTestSeries: builder.query<ListResponse<TestSeries>, {
      page?: number;
      limit?: number;
      search?: string;
      pricing_type?: 'free' | 'paid';
      is_featured?: boolean;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return {
          url: `/test-series?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['TestSeries'],
    }),

    getTestSeriesById: builder.query<ApiResponse<TestSeries>, string>({
      query: (uuid) => ({
        url: `/test-series/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'TestSeries', id: uuid }],
    }),

    // Categories endpoints
    getCategories: builder.query<ApiResponse<Category[]>, string>({
      query: (seriesUuid) => ({
        url: `/test-series/${seriesUuid}/categories`,
        method: 'GET',
      }),
      providesTags: (result, error, seriesUuid) => [
        { type: 'Category', id: seriesUuid },
        'Category',
      ],
    }),

    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (uuid) => ({
        url: `/categories/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Category', id: uuid }],
    }),

    // Sub-categories endpoints
    getSubCategories: builder.query<ApiResponse<SubCategory[]>, string>({
      query: (categoryUuid) => ({
        url: `/categories/${categoryUuid}/sub-categories`,
        method: 'GET',
      }),
      providesTags: (result, error, categoryUuid) => [
        { type: 'SubCategory', id: categoryUuid },
        'SubCategory',
      ],
    }),

    getSubCategoryById: builder.query<ApiResponse<SubCategory>, string>({
      query: (uuid) => ({
        url: `/sub-categories/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'SubCategory', id: uuid }],
    }),

    // Tests endpoints
    getTests: builder.query<ApiResponse<Test[]>, string>({
      query: (subCategoryUuid) => ({
        url: `/sub-categories/${subCategoryUuid}/tests`,
        method: 'GET',
      }),
      providesTags: (result, error, subCategoryUuid) => [
        { type: 'Test', id: subCategoryUuid },
        'Test',
      ],
    }),

    getTestById: builder.query<ApiResponse<Test>, string>({
      query: (uuid) => ({
        url: `/tests/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Test', id: uuid }],
    }),

    // Questions endpoints
    getQuestions: builder.query<ApiResponse<Question[]>, string>({
      query: (testUuid) => ({
        url: `/tests/${testUuid}/questions`,
        method: 'GET',
      }),
      providesTags: (result, error, testUuid) => [
        { type: 'Question', id: testUuid },
        'Question',
      ],
    }),

    // Subscription access endpoint
    getSubscriptionAccess: builder.query<ApiResponse<SubscriptionAccess>, string>({
      query: (seriesUuid) => ({
        url: `/test-series/${seriesUuid}/subscription-access`,
        method: 'GET',
      }),
      providesTags: (result, error, seriesUuid) => [
        { type: 'SubscriptionAccess', id: seriesUuid },
      ],
    }),
  }),
});

export const {
  useGetTestSeriesQuery,
  useLazyGetTestSeriesQuery,
  useGetTestSeriesByIdQuery,
  useLazyGetTestSeriesByIdQuery,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useLazyGetCategoryByIdQuery,
  useGetSubCategoriesQuery,
  useLazyGetSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useLazyGetSubCategoryByIdQuery,
  useGetTestsQuery,
  useLazyGetTestsQuery,
  useGetTestByIdQuery,
  useLazyGetTestByIdQuery,
  useGetQuestionsQuery,
  useLazyGetQuestionsQuery,
  useGetSubscriptionAccessQuery,
  useLazyGetSubscriptionAccessQuery,
} = hierarchicalTestApi;