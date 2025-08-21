import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface FreeTest {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  duration: number; // in minutes
  total_questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  marks_per_question: number;
  negative_marks: number;
  language: string;
  instructions?: string;
  is_active: boolean;
  is_featured: boolean;
  attempts_allowed: number;
  created_at: string;
  updated_at: string;
  user_attempts?: number;
  best_score?: number;
  last_attempted?: string;
}

export interface FreeTestCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  test_count: number;
}

export interface FreeTestListResponse {
  success: boolean;
  data: FreeTest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FreeTestResponse {
  success: boolean;
  data: FreeTest;
}

export interface FreeTestCategoriesResponse {
  success: boolean;
  data: FreeTestCategory[];
}

export interface FreeTestStatsResponse {
  success: boolean;
  data: {
    total_tests: number;
    featured_tests: number;
    completed_tests: number;
    average_score: number;
    total_attempts: number;
    category_stats: Array<{
      category: string;
      count: number;
      attempts: number;
    }>;
    difficulty_stats: Array<{
      difficulty: string;
      count: number;
      average_score: number;
    }>;
  };
}

export interface FreeTestListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  language?: string;
  sortBy?: 'created_at' | 'title' | 'difficulty' | 'duration';
  sortOrder?: 'ASC' | 'DESC';
  is_featured?: boolean;
}

export interface StartTestRequest {
  test_id: string;
  language?: string;
}

export interface StartTestResponse {
  success: boolean;
  data: {
    session_id: string;
    test: FreeTest;
    questions: Array<{
      id: string;
      question_text: string;
      options: {
        A: string;
        B: string;
        C: string;
        D: string;
      };
      marks: number;
      negative_marks: number;
      subject: string;
      topic?: string;
    }>;
    started_at: string;
    expires_at: string;
  };
}

export interface SubmitTestRequest {
  session_id: string;
  answers: Array<{
    question_id: string;
    selected_option: 'A' | 'B' | 'C' | 'D' | null;
    time_spent: number;
    is_flagged?: boolean;
  }>;
  completed_at: string;
}

export interface SubmitTestResponse {
  success: boolean;
  data: {
    result_id: string;
    total_score: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    percentage: number;
    rank?: number;
    time_taken: number;
  };
}

export const freeTestsApi = createApi({
  reducerPath: 'freeTestsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['FreeTest', 'FreeTestCategory', 'FreeTestStats', 'TestSession'],
  endpoints: (builder) => ({
    // Get free tests with pagination and filters
    getFreeTests: builder.query<FreeTestListResponse, FreeTestListParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });

        return {
          url: `/free-tests?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FreeTest' as const, id })),
              { type: 'FreeTest', id: 'LIST' },
            ]
          : [{ type: 'FreeTest', id: 'LIST' }],
    }),

    // Get single free test by ID
    getFreeTestById: builder.query<FreeTestResponse, string>({
      query: (id) => ({
        url: `/free-tests/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'FreeTest', id }],
    }),

    // Get free test categories
    getFreeTestCategories: builder.query<FreeTestCategoriesResponse, void>({
      query: () => ({
        url: '/free-tests/categories',
        method: 'GET',
      }),
      providesTags: ['FreeTestCategory'],
    }),

    // Get free test statistics
    getFreeTestStats: builder.query<FreeTestStatsResponse, void>({
      query: () => ({
        url: '/free-tests/stats',
        method: 'GET',
      }),
      providesTags: ['FreeTestStats'],
    }),

    // Start a free test
    startFreeTest: builder.mutation<StartTestResponse, StartTestRequest>({
      query: (body) => ({
        url: '/free-tests/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TestSession'],
    }),

    // Submit free test
    submitFreeTest: builder.mutation<SubmitTestResponse, SubmitTestRequest>({
      query: (body) => ({
        url: '/free-tests/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FreeTest', 'FreeTestStats', 'TestSession'],
    }),

    // Get user's test attempts for a specific test
    getUserTestAttempts: builder.query<{
      success: boolean;
      data: Array<{
        id: string;
        score: number;
        percentage: number;
        correct_answers: number;
        wrong_answers: number;
        unanswered: number;
        time_taken: number;
        completed_at: string;
        rank?: number;
      }>;
    }, string>({
      query: (testId) => ({
        url: `/free-tests/${testId}/attempts`,
        method: 'GET',
      }),
      providesTags: (result, error, testId) => [{ type: 'FreeTest', id: testId }],
    }),

    // Get leaderboard for a specific test
    getTestLeaderboard: builder.query<{
      success: boolean;
      data: Array<{
        rank: number;
        user_id: string;
        username: string;
        score: number;
        percentage: number;
        time_taken: number;
        completed_at: string;
        is_current_user?: boolean;
      }>;
    }, { testId: string; limit?: number }>({
      query: ({ testId, limit = 50 }) => ({
        url: `/free-tests/${testId}/leaderboard?limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result, error, { testId }) => [
        { type: 'FreeTest', id: testId },
        'FreeTestStats',
      ],
    }),
  }),
});

export const {
  useGetFreeTestsQuery,
  useLazyGetFreeTestsQuery,
  useGetFreeTestByIdQuery,
  useLazyGetFreeTestByIdQuery,
  useGetFreeTestCategoriesQuery,
  useGetFreeTestStatsQuery,
  useStartFreeTestMutation,
  useSubmitFreeTestMutation,
  useGetUserTestAttemptsQuery,
  useGetTestLeaderboardQuery,
} = freeTestsApi;