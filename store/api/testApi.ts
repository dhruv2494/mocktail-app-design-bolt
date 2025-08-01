import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for the test management system
export interface TestSeries {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  title_gujarati?: string;
  description_gujarati?: string;
  is_active: boolean;
  pricing_type: 'free' | 'paid';
  price?: number;
  currency?: string;
  demo_tests_count?: number;
  subscription_duration_days?: number;
  discount_percentage?: number;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  categories_count?: number;
  tests_count?: number;
  is_subscribed?: boolean;
}

export interface Category {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  title_gujarati?: string;
  description_gujarati?: string;
  is_active: boolean;
  test_series_id: number;
  created_at: string;
  updated_at: string;
  sub_categories_count?: number;
  tests_count?: number;
}

export interface SubCategory {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  title_gujarati?: string;
  description_gujarati?: string;
  is_active: boolean;
  category_id: number;
  created_at: string;
  updated_at: string;
  tests_count?: number;
}

export interface Test {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  title_gujarati?: string;
  description_gujarati?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks?: number;
  negative_marking: boolean;
  negative_marks_per_question?: number;
  max_attempts?: number;
  is_active: boolean;
  is_demo: boolean;
  difficulty_level: 'easy' | 'medium' | 'hard';
  auto_submit_on_expiry: boolean;
  show_result_immediately: boolean;
  sub_category_id: number;
  created_at: string;
  updated_at: string;
  questions_count?: number;
  user_attempts?: number;
}

export interface Question {
  id: number;
  uuid: string;
  question_text: string;
  question_text_gujarati?: string;
  question_type: 'single_choice' | 'multiple_choice';
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_gujarati?: string;
  option_b_gujarati?: string;
  option_c_gujarati?: string;
  option_d_gujarati?: string;  
  correct_answer: string;
  explanation?: string;
  explanation_gujarati?: string;
  marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  test_id: number;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: number;
  uuid: string;
  user_id: number;
  test_id: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  start_time: string;
  end_time?: string;
  pause_time?: string;
  remaining_time_minutes?: number;
  total_questions: number;
  answered_questions: number;
  score?: number;
  percentage?: number;
  is_passed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAnswer {
  id: number;
  uuid: string;
  test_session_id: number;
  question_id: number;
  selected_answer?: string;
  is_correct?: boolean;
  marks_obtained: number;
  time_taken_seconds?: number;
  created_at: string;
  updated_at: string;
}

// API slice
export const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/api`,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['TestSeries', 'Category', 'SubCategory', 'Test', 'Question', 'TestSession', 'UserAnswer'],
  endpoints: (builder) => ({
    // Test Series endpoints
    getTestSeries: builder.query<{
      success: boolean;
      data: TestSeries[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }, { page?: number; limit?: number; search?: string; pricing_type?: string; is_featured?: boolean }>({
      query: (params) => ({
        url: '/test-series',
        params,
      }),
      providesTags: ['TestSeries'],
    }),

    getTestSeriesById: builder.query<{
      success: boolean;
      data: TestSeries;
    }, string>({
      query: (uuid) => `/test-series/${uuid}`,
      providesTags: ['TestSeries'],
    }),

    // Categories endpoints
    getCategoriesByTestSeries: builder.query<{
      success: boolean;
      data: {
        categories: Category[];
        statistics?: any;
      };
    }, string>({
      query: (testSeriesUuid) => `/test-series/${testSeriesUuid}/categories`,
      providesTags: ['Category'],
      transformResponse: (response: { success: boolean; data: Category[] }) => ({
        success: response.success,
        data: {
          categories: response.data,
          statistics: {}
        }
      }),
    }),

    getCategoryById: builder.query<{
      success: boolean;
      data: Category;
    }, string>({
      query: (uuid) => `/categories/${uuid}`,
      providesTags: ['Category'],
    }),

    // Sub-categories endpoints
    getSubCategoriesByCategory: builder.query<{
      success: boolean;
      data: {
        subCategories: SubCategory[];
        statistics?: any;
      };
    }, string>({
      query: (categoryUuid) => `/categories/${categoryUuid}/sub-categories`,
      providesTags: ['SubCategory'],
      transformResponse: (response: { success: boolean; data: SubCategory[] }) => ({
        success: response.success,
        data: {
          subCategories: response.data,
          statistics: {}
        }
      }),
    }),

    getSubCategoryById: builder.query<{
      success: boolean;
      data: SubCategory;
    }, string>({
      query: (uuid) => `/sub-categories/${uuid}`,
      providesTags: ['SubCategory'],
    }),

    // Tests endpoints
    getTestsBySubCategory: builder.query<{
      success: boolean;
      data: {
        tests: Test[];
        statistics?: any;
      };
    }, string>({
      query: (subCategoryUuid) => `/sub-categories/${subCategoryUuid}/tests`,
      providesTags: ['Test'],
      transformResponse: (response: { success: boolean; data: Test[] }) => ({
        success: response.success,
        data: {
          tests: response.data,
          statistics: {}
        }
      }),
    }),

    getTestById: builder.query<{
      success: boolean;
      data: Test;
    }, string>({
      query: (uuid) => `/tests/${uuid}`,
      providesTags: ['Test'],
    }),

    // Questions endpoints
    getQuestionsByTest: builder.query<{
      success: boolean;
      data: {
        questions: Question[];
        statistics?: any;
      };
    }, string>({
      query: (testUuid) => `/tests/${testUuid}/questions`,
      providesTags: ['Question'],
      transformResponse: (response: { success: boolean; data: Question[] }) => ({
        success: response.success,
        data: {
          questions: response.data,
          statistics: {}
        }
      }),
    }),

    // Test Session endpoints
    startTestSession: builder.mutation<{
      success: boolean;
      data: TestSession;
    }, { testUuid: string }>({
      query: ({ testUuid }) => ({
        url: `/tests/${testUuid}/start-session`,
        method: 'POST',
      }),
      invalidatesTags: ['TestSession'],
    }),

    pauseTestSession: builder.mutation<{
      success: boolean;
      data: TestSession;
    }, { sessionUuid: string }>({
      query: ({ sessionUuid }) => ({
        url: `/test-sessions/${sessionUuid}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['TestSession'],
    }),

    resumeTestSession: builder.mutation<{
      success: boolean;
      data: TestSession;
    }, { sessionUuid: string }>({
      query: ({ sessionUuid }) => ({
        url: `/test-sessions/${sessionUuid}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['TestSession'],
    }),

    submitTestSession: builder.mutation<{
      success: boolean;
      data: TestSession;
    }, { sessionUuid: string }>({
      query: ({ sessionUuid }) => ({
        url: `/test-sessions/${sessionUuid}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['TestSession'],
    }),

    getCurrentTestSession: builder.query<{
      success: boolean;
      data: TestSession | null;
    }, string>({
      query: (testUuid) => `/tests/${testUuid}/current-session`,
      providesTags: ['TestSession'],
    }),

    // User Answer endpoints
    submitAnswer: builder.mutation<{
      success: boolean;
      data: UserAnswer;
    }, {
      sessionUuid: string;
      questionUuid: string;
      selectedAnswer: string;
      timeTaken?: number;
    }>({
      query: ({ sessionUuid, questionUuid, selectedAnswer, timeTaken }) => ({
        url: `/test-sessions/${sessionUuid}/answers`,
        method: 'POST',
        body: {
          question_uuid: questionUuid,
          selected_answer: selectedAnswer,
          time_taken_seconds: timeTaken,
        },
      }),
      invalidatesTags: ['UserAnswer', 'TestSession'],
    }),

    getSessionAnswers: builder.query<{
      success: boolean;
      data: UserAnswer[];
    }, string>({
      query: (sessionUuid) => `/test-sessions/${sessionUuid}/answers`,
      providesTags: ['UserAnswer'],
    }),

    // Results endpoints
    getTestResults: builder.query<{
      success: boolean;
      data: {
        session: TestSession;
        answers: (UserAnswer & { question: Question })[];
        summary: {
          total_questions: number;
          answered_questions: number;
          correct_answers: number;
          wrong_answers: number;
          unanswered_questions: number;
          total_marks: number;
          obtained_marks: number;
          percentage: number;
          is_passed: boolean;
          time_taken_minutes: number;
        };
      };
    }, string>({
      query: (sessionUuid) => `/test-sessions/${sessionUuid}/results`,
      providesTags: ['TestSession', 'UserAnswer'],
    }),

    // User subscription status
    checkSubscriptionAccess: builder.query<{
      success: boolean;
      data: {
        has_access: boolean;
        subscription_type?: string;
        expires_at?: string;
        can_access_demo: boolean;
        demo_tests_remaining?: number;
      };
    }, string>({
      query: (testSeriesUuid) => `/test-series/${testSeriesUuid}/subscription-access`,
    }),

    // Leaderboard endpoints
    getLeaderboard: builder.query<{
      success: boolean;
      data: {
        id: number;
        uuid: string;
        name: string;
        email: string;
        avatar?: string;
        score: number;
        percentage: number;
        total_tests: number;
        rank: number;
        is_current_user: boolean;
        badges?: string[];
        time_taken_minutes?: number;
      }[];
      stats?: {
        total_participants: number;
        average_score: number;
        total_tests: number;
      };
    }, {
      period?: 'today' | 'week' | 'month' | 'all_time';
      category?: string;
      test_series?: string;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/leaderboard',
        params,
      }),
      providesTags: ['TestSession'],
    }),

    getUserRanking: builder.query<{
      success: boolean;
      data: {
        current_rank: number;
        total_participants: number;
        percentile: number;
        score: number;
        percentage: number;
        improvement_from_last: number;
      };
    }, {
      period?: 'today' | 'week' | 'month' | 'all_time';
      category?: string;
      test_series?: string;
    }>({
      query: (params) => ({
        url: '/leaderboard/my-ranking',
        params,
      }),
      providesTags: ['TestSession'],
    }),

    // Free Tests endpoints
    getFreeTests: builder.query<{
      success: boolean;
      data: Test[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      difficulty?: string;
    }>({
      query: (params) => ({
        url: '/free-tests',
        params,
      }),
      providesTags: ['Test'],
    }),

    // PYQs (Previous Year Questions) endpoints
    getPYQs: builder.query<{
      success: boolean;
      data: {
        id: number;
        uuid: string;
        title: string;
        description?: string;
        title_gujarati?: string;
        description_gujarati?: string;
        year: number;
        exam_type: string;
        questions_count: number;
        duration_minutes: number;
        total_marks: number;
        difficulty_level: 'easy' | 'medium' | 'hard';
        is_active: boolean;
        created_at: string;
        updated_at: string;
        attempts_count?: number;
        user_attempts?: number;
      }[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }, {
      page?: number;
      limit?: number;
      search?: string;
      year?: number;
      exam_type?: string;
      difficulty?: string;
    }>({
      query: (params) => ({
        url: '/pyqs',
        params,
      }),
      providesTags: ['Test'],
    }),
  }),
});

export const {
  useGetTestSeriesQuery,
  useGetTestSeriesByIdQuery,
  useGetCategoriesByTestSeriesQuery,
  useGetCategoryByIdQuery,
  useGetSubCategoriesByCategoryQuery,
  useGetSubCategoryByIdQuery,
  useGetTestsBySubCategoryQuery,
  useGetTestByIdQuery,
  useGetQuestionsByTestQuery,
  useStartTestSessionMutation,
  usePauseTestSessionMutation,
  useResumeTestSessionMutation,
  useSubmitTestSessionMutation,
  useGetCurrentTestSessionQuery,
  useSubmitAnswerMutation,
  useGetSessionAnswersQuery,
  useGetTestResultsQuery,
  useCheckSubscriptionAccessQuery,
  useGetLeaderboardQuery,
  useGetUserRankingQuery,
  useGetFreeTestsQuery,
  useGetPYQsQuery,
} = testApi;