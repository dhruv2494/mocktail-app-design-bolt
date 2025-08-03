import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_CONFIG } from '@/config/constants';

const BASE_URL = `${API_CONFIG.BASE_URL}/api`;

export interface QuizQuestion {
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
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  explanation?: string;
  time_limit?: number; // in seconds
  order_index: number;
}

export interface QuizSession {
  id: string;
  user_id: string;
  test_id: string;
  test_type: 'free' | 'series' | 'series-free';
  series_id?: string;
  language: string;
  total_questions: number;
  duration: number; // in minutes
  marks_per_question: number;
  negative_marks: number;
  started_at: string;
  expires_at: string;
  submitted_at?: string;
  status: 'active' | 'paused' | 'submitted' | 'expired';
  time_remaining?: number; // in seconds
  can_pause: boolean;
  allow_review: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
}

export interface StartQuizRequest {
  test_id: string;
  test_type: 'free' | 'series' | 'series-free';
  series_id?: string;
  language?: string;
}

export interface StartQuizResponse {
  success: boolean;
  data: {
    session: QuizSession;
    questions: QuizQuestion[];
    test_info: {
      title: string;
      description?: string;
      instructions?: string;
      total_marks: number;
      pass_percentage: number;
      attempt_number: number;
      max_attempts: number;
    };
  };
}

export interface SaveAnswerRequest {
  session_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  time_spent: number; // in seconds
  is_flagged?: boolean;
  is_auto_save?: boolean;
}

export interface SaveAnswerResponse {
  success: boolean;
  data: {
    saved: boolean;
    time_remaining: number;
  };
}

export interface SubmitQuizRequest {
  session_id: string;
  answers: Array<{
    question_id: string;
    selected_option: 'A' | 'B' | 'C' | 'D' | null;
    time_spent: number;
    is_flagged?: boolean;
  }>;
  submitted_at: string;
  time_taken: number; // total time in seconds
  is_manual_submit: boolean;
}

export interface SubmitQuizResponse {
  success: boolean;
  data: {
    result_id: string;
    session_id: string;
    total_score: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    percentage: number;
    grade: string;
    passed: boolean;
    time_taken: number;
    rank?: number;
    total_participants?: number;
    detailed_results: Array<{
      question_id: string;
      question_text: string;
      selected_option: 'A' | 'B' | 'C' | 'D' | null;
      correct_option: 'A' | 'B' | 'C' | 'D';
      is_correct: boolean;
      marks_obtained: number;
      time_spent: number;
      subject: string;
      topic?: string;
      explanation?: string;
    }>;
  };
}

export interface PauseResumeRequest {
  session_id: string;
  action: 'pause' | 'resume';
  timestamp: string;
}

export interface PauseResumeResponse {
  success: boolean;
  data: {
    status: 'active' | 'paused';
    time_remaining: number;
    paused_at?: string;
    resumed_at?: string;
  };
}

export interface GetSessionStatusResponse {
  success: boolean;
  data: {
    session: QuizSession;
    saved_answers: Array<{
      question_id: string;
      selected_option: 'A' | 'B' | 'C' | 'D' | null;
      is_flagged: boolean;
      time_spent: number;
    }>;
    statistics: {
      answered: number;
      unanswered: number;
      flagged: number;
      time_elapsed: number;
    };
  };
}

export interface ReviewAnswersRequest {
  session_id: string;
  result_id: string;
}

export interface ReviewAnswersResponse {
  success: boolean;
  data: {
    questions: Array<QuizQuestion & {
      selected_option: 'A' | 'B' | 'C' | 'D' | null;
      correct_option: 'A' | 'B' | 'C' | 'D';
      is_correct: boolean;
      marks_obtained: number;
      time_spent: number;
      explanation?: string;
    }>;
    result_summary: {
      total_score: number;
      percentage: number;
      grade: string;
      passed: boolean;
      rank?: number;
    };
  };
}

export const quizApi = createApi({
  reducerPath: 'quizApi',
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
  tagTypes: ['QuizSession', 'QuizResult', 'SavedAnswers'],
  endpoints: (builder) => ({
    // Start a new quiz session
    startQuiz: builder.mutation<StartQuizResponse, StartQuizRequest>({
      query: (body) => ({
        url: '/quiz/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['QuizSession'],
    }),

    // Get current session status (for resuming)
    getSessionStatus: builder.query<GetSessionStatusResponse, string>({
      query: (sessionId) => ({
        url: `/quiz/session/${sessionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, sessionId) => [
        { type: 'QuizSession', id: sessionId },
        { type: 'SavedAnswers', id: sessionId },
      ],
    }),

    // Save individual answer (auto-save functionality)
    saveAnswer: builder.mutation<SaveAnswerResponse, SaveAnswerRequest>({
      query: (body) => ({
        url: '/quiz/save-answer',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { session_id }) => [
        { type: 'SavedAnswers', id: session_id },
      ],
      // Optimistic update for better UX
      onQueryStarted: async ({ session_id }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          // Could implement retry logic here
          console.warn('Failed to save answer:', error);
        }
      },
    }),

    // Pause or resume quiz session
    pauseResumeQuiz: builder.mutation<PauseResumeResponse, PauseResumeRequest>({
      query: (body) => ({
        url: '/quiz/pause-resume',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { session_id }) => [
        { type: 'QuizSession', id: session_id },
      ],
    }),

    // Submit quiz and get results
    submitQuiz: builder.mutation<SubmitQuizResponse, SubmitQuizRequest>({
      query: (body) => ({
        url: '/quiz/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { session_id }) => [
        { type: 'QuizSession', id: session_id },
        'QuizResult',
      ],
    }),

    // Get detailed review of answers (after submission)
    reviewAnswers: builder.query<ReviewAnswersResponse, ReviewAnswersRequest>({
      query: ({ session_id, result_id }) => ({
        url: `/quiz/review/${session_id}/${result_id}`,
        method: 'GET',
      }),
      providesTags: (result, error, { session_id, result_id }) => [
        { type: 'QuizResult', id: result_id },
        { type: 'QuizSession', id: session_id },
      ],
    }),

    // Get user's quiz history
    getQuizHistory: builder.query<{
      success: boolean;
      data: Array<{
        id: string;
        test_title: string;
        test_type: 'free' | 'series' | 'series-free';
        score: number;
        percentage: number;
        grade: string;
        passed: boolean;
        completed_at: string;
        time_taken: number;
        rank?: number;
        attempt_number: number;
      }>;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }, { page?: number; limit?: number; test_type?: string }>(
      {
        query: (params = {}) => {
          const searchParams = new URLSearchParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              searchParams.append(key, value.toString());
            }
          });

          return {
            url: `/quiz/history?${searchParams.toString()}`,
            method: 'GET',
          };
        },
        providesTags: ['QuizResult'],
      }
    ),

    // Get leaderboard for a specific test/quiz
    getQuizLeaderboard: builder.query<{
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
    }, { test_id: string; test_type: string; limit?: number }>(
      {
        query: ({ test_id, test_type, limit = 50 }) => ({
          url: `/quiz/leaderboard/${test_type}/${test_id}?limit=${limit}`,
          method: 'GET',
        }),
        providesTags: (result, error, { test_id, test_type }) => [
          { type: 'QuizResult', id: `${test_type}-${test_id}` },
        ],
      }
    ),

    // Validate session before starting (check eligibility)
    validateQuizSession: builder.query<{
      success: boolean;
      data: {
        can_start: boolean;
        reason?: string;
        attempts_used: number;
        max_attempts: number;
        time_until_next_attempt?: number;
        existing_session?: {
          id: string;
          status: string;
          time_remaining: number;
        };
      };
    }, { test_id: string; test_type: string; series_id?: string }>(
      {
        query: ({ test_id, test_type, series_id }) => {
          const params = new URLSearchParams({
            test_id,
            test_type,
          });
          
          if (series_id) {
            params.append('series_id', series_id);
          }

          return {
            url: `/quiz/validate?${params.toString()}`,
            method: 'GET',
          };
        },
      }
    ),
  }),
});

export const {
  useStartQuizMutation,
  useGetSessionStatusQuery,
  useLazyGetSessionStatusQuery,
  useSaveAnswerMutation,
  usePauseResumeQuizMutation,
  useSubmitQuizMutation,
  useReviewAnswersQuery,
  useLazyReviewAnswersQuery,
  useGetQuizHistoryQuery,
  useGetQuizLeaderboardQuery,
  useValidateQuizSessionQuery,
  useLazyValidateQuizSessionQuery,
} = quizApi;