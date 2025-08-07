import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_CONFIG } from '@/config/constants';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

// Hierarchical Test System Interfaces
export interface ExamCategory {
  id: number;
  uuid: string;
  name: string;
  name_gujarati?: string;
  description?: string;
  description_gujarati?: string;
  hierarchy_level: number;
  parent_id?: number;
  display_order: number;
  color_code?: string;
  icon?: string;
  is_active: boolean;
  children?: ExamCategory[];
  testSeries?: TestSeriesHierarchy[];
  categories_count?: number;
  tests_count?: number;
}

export interface TestSeriesHierarchy {
  id: number;
  uuid: string;
  title: string;
  title_gujarati?: string;
  description?: string;
  description_gujarati?: string;
  category_id: number;
  exam_type_id?: number;
  price: number;
  currency: string;
  is_free: boolean;
  free_test_count: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  access_duration_days?: number;
  is_active: boolean;
  is_featured: boolean;
  supports_pause_resume: boolean;
  supports_multilanguage: boolean;
  has_negative_marking: boolean;
  negative_marks: number;
  instructions?: string;
  instructions_gujarati?: string;
  created_at: string;
  updated_at: string;
  category?: ExamCategory;
  actualTestsCount: number;
  actualFreeTestsCount: number;
  is_subscribed?: boolean;
  rating?: number;
  rating_count?: number;
  purchase_count?: number;
}

export interface TestHierarchy {
  id: number;
  uuid: string;
  title: string;
  title_gujarati?: string;
  description?: string;
  description_gujarati?: string;
  test_series_id: number;
  test_type: 'practice' | 'mock' | 'assessment' | 'sample' | 'full_length';
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  is_free: boolean;
  allows_pause: boolean;
  has_negative_marking: boolean;
  negative_marks: number;
  marks_per_question: number;
  show_results_immediately: boolean;
  instructions?: string;
  instructions_gujarati?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  questions_count: number;
  user_attempts?: number;
  best_score?: number;
  last_attempted?: string;
  is_locked?: boolean;
}

export interface TestQuestion {
  id: number;
  uuid: string;
  question: string;
  question_gujarati?: string;
  options: Array<{
    key: string;
    text: string;
  }>;
  options_gujarati?: Array<{
    key: string;
    text: string;
  }>;
  correct_option: string;
  explanation?: string;
  explanation_gujarati?: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  marks: number;
  display_order: number;
}

export interface TestSession {
  id: number;
  uuid: string;
  user_id: string;
  test_id: number;
  start_time: string;
  end_time?: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'timed_out' | 'abandoned' | 'terminated';
  time_remaining: number;
  total_time_spent: number;
  is_demo: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionAccess {
  has_access: boolean;
  subscription_type: 'free' | 'paid' | null;
  expires_at?: string;
  purchase_date?: string;
  can_access_demo: boolean;
  demo_tests_remaining: number;
  demo_tests_used?: number;
}

// API Response Types
export interface CategoriesResponse {
  success: boolean;
  data: ExamCategory[];
}

export interface TestSeriesListResponse {
  success: boolean;
  data: {
    testSeries: TestSeriesHierarchy[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface TestSeriesResponse {
  success: boolean;
  data: TestSeriesHierarchy;
}

export interface TestsListResponse {
  success: boolean;
  data: TestHierarchy[];
}

export interface TestResponse {
  success: boolean;
  data: TestHierarchy;
}

export interface QuestionsResponse {
  success: boolean;
  data: {
    questions: TestQuestion[];
    test_info: {
      id: number;
      uuid: string;
      title: string;
      duration_minutes: number;
      total_marks: number;
      is_demo: boolean;
    };
  };
}

export interface StartTestResponse {
  success: boolean;
  data: {
    session_id: string;
    status: string;
    started_at: string;
    time_remaining: number;
    is_demo: boolean;
    is_resuming?: boolean;
  };
}

export interface SubscriptionAccessResponse {
  success: boolean;
  data: SubscriptionAccess;
}

export interface TestSeriesParams {
  category_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  pricing_type?: 'free' | 'paid';
  is_featured?: boolean;
}

export interface CategoriesParams {
  level?: number;
  parent_id?: number;
  include_children?: boolean;
}

export const testManagementApi = createApi({
  reducerPath: 'testManagementApi',
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
  tagTypes: ['ExamCategory', 'TestSeries', 'Test', 'TestSession', 'Subscription'],
  endpoints: (builder) => ({
    // Get test series (current system)
    getExamCategories: builder.query<{ success: boolean; data: any[] }, CategoriesParams | void>({
      query: () => ({
        url: `/test-series`,
        method: 'GET',
      }),
      providesTags: ['ExamCategory'],
    }),

    // Get test series with hierarchy support
    getTestSeriesHierarchy: builder.query<TestSeriesListResponse, TestSeriesParams | void>({
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

    // Get single test series by UUID
    getTestSeriesByUuid: builder.query<TestSeriesResponse, string>({
      query: (uuid) => ({
        url: `/test-series/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'TestSeries', id: uuid }],
    }),

    // Get categories for a test series
    getTestSeriesCategories: builder.query<CategoriesResponse, string>({
      query: (uuid) => ({
        url: `/test-series/${uuid}/categories`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'TestSeries', id: uuid }],
    }),

    // Get sub-categories for a category
    getSubCategories: builder.query<CategoriesResponse, string>({
      query: (uuid) => ({
        url: `/categories/${uuid}/sub-categories`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'ExamCategory', id: uuid }],
    }),

    // Get tests for a sub-category
    getTestsForSubCategory: builder.query<TestsListResponse, string>({
      query: (uuid) => ({
        url: `/sub-categories/${uuid}/tests`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Test', id: uuid }],
    }),

    // Get single test by UUID
    getTestByUuid: builder.query<TestResponse, string>({
      query: (uuid) => ({
        url: `/tests/${uuid}`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Test', id: uuid }],
    }),

    // Get questions for a test (requires subscription)
    getTestQuestions: builder.query<QuestionsResponse, string>({
      query: (uuid) => ({
        url: `/tests/${uuid}/questions`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Test', id: uuid }],
    }),

    // Check subscription access for a test series
    checkSubscriptionAccess: builder.query<SubscriptionAccessResponse, string>({
      query: (uuid) => ({
        url: `/test-series/${uuid}/subscription-access`,
        method: 'GET',
      }),
      providesTags: (result, error, uuid) => [{ type: 'Subscription', id: uuid }],
    }),

    // Start a test session
    startTestSession: builder.mutation<StartTestResponse, { testUuid: string; language?: string }>({
      query: ({ testUuid, language = 'en' }) => ({
        url: `/tests/${testUuid}/start`,
        method: 'POST',
        body: { language },
      }),
      invalidatesTags: ['TestSession'],
    }),

    // Submit answer in test session
    submitAnswer: builder.mutation<{ success: boolean }, {
      sessionId: string;
      questionId: number;
      selectedOption: string;
      timeSpent: number;
      isFlagged?: boolean;
      confidenceLevel?: 'low' | 'medium' | 'high';
    }>({
      query: ({ sessionId, ...body }) => ({
        url: `/session/${sessionId}/answer`,
        method: 'POST',
        body,
      }),
    }),

    // Pause test session
    pauseTestSession: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}/pause`,
        method: 'POST',
      }),
    }),

    // Resume test session
    resumeTestSession: builder.mutation<{ success: boolean }, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}/resume`,
        method: 'POST',
      }),
    }),

    // Submit complete test
    submitTest: builder.mutation<{
      success: boolean;
      data: {
        sessionId: string;
        results: {
          totalScore: number;
          maxPossibleScore: number;
          percentage: number;
          correctAnswers: number;
          wrongAnswers: number;
          unanswered: number;
          negativeMarks: number;
          timeSpent: number;
          rank?: number;
          percentile?: number;
          isPassed: boolean;
          passingMarks: number;
        };
      };
    }, string>({
      query: (sessionId) => ({
        url: `/session/${sessionId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['TestSession'],
    }),
  }),
});

export const {
  useGetExamCategoriesQuery,
  useLazyGetExamCategoriesQuery,
  useGetTestSeriesHierarchyQuery,
  useLazyGetTestSeriesHierarchyQuery,
  useGetTestSeriesByUuidQuery,
  useGetTestSeriesCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetTestsForSubCategoryQuery,
  useGetTestByUuidQuery,
  useGetTestQuestionsQuery,
  useCheckSubscriptionAccessQuery,
  useStartTestSessionMutation,
  useSubmitAnswerMutation,
  usePauseTestSessionMutation,
  useResumeTestSessionMutation,
  useSubmitTestMutation,
} = testManagementApi;