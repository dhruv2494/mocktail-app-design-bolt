import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// =====================
// INTERFACES
// =====================

export interface DynamicCategory {
  id: number;
  uuid: string;
  test_series_id: number;
  parent_category_id?: number;
  name: string;
  name_gujarati?: string;
  description?: string;
  description_gujarati?: string;
  hierarchy_level: number;
  node_type: 'container' | 'question_holder' | 'unset';
  has_questions: boolean;
  has_subcategories: boolean;
  questions_count: number;
  subcategories_count: number;
  total_questions_count: number;
  display_order: number;
  is_active: boolean;
  
  // Test configuration
  duration_minutes?: number;
  total_marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  negative_marking_enabled: boolean;
  negative_marks_per_wrong: number;
  instructions?: string;
  instructions_gujarati?: string;
  
  // Relations
  parentCategory?: DynamicCategory;
  subcategories?: DynamicCategory[];
  questions?: DynamicQuestion[];
  
  created_at: string;
  updated_at: string;
}

export interface DynamicQuestion {
  id: number;
  uuid: string;
  category_id: number;
  question_text: string;
  question_text_gujarati?: string;
  
  // Options
  option_a: string;
  option_a_gujarati?: string;
  option_b: string;
  option_b_gujarati?: string;
  option_c: string;
  option_c_gujarati?: string;
  option_d: string;
  option_d_gujarati?: string;
  
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanation_gujarati?: string;
  marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  subject?: string;
  topic?: string;
  display_order: number;
  is_active: boolean;
  
  // For formatted responses
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  
  created_at: string;
  updated_at: string;
}

export interface HierarchyNode extends DynamicCategory {
  children?: HierarchyNode[];
  path: string[];
  depth: number;
}

export interface AvailableActions {
  canAddSubcategory: boolean;
  canAddQuestions: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
}

export interface HierarchyStatistics {
  totalCategories: number;
  containerCategories: number;
  questionHolderCategories: number;
  unsetCategories: number;
  totalQuestions: number;
}

export interface Breadcrumb {
  id: number;
  uuid: string;
  name: string;
  hierarchy_level: number;
}

// =====================
// API SLICE
// =====================

export const dynamicTestApi = createApi({
  reducerPath: 'dynamicTestApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DynamicCategory', 'DynamicQuestion', 'Hierarchy'],
  
  endpoints: (builder) => ({
    
    // =====================
    // HIERARCHY OVERVIEW
    // =====================
    
    getTestSeriesHierarchy: builder.query<{
      testSeries: any;
      hierarchy: DynamicCategory[];
      statistics: HierarchyStatistics;
    }, {
      testSeriesId: number;
      includeQuestions?: boolean;
    }>({
      query: ({ testSeriesId, includeQuestions = false }) => 
        `/admin/dynamic-test/series/${testSeriesId}/hierarchy?includeQuestions=${includeQuestions}`,
      providesTags: (result, error, { testSeriesId }) => [
        { type: 'Hierarchy', id: testSeriesId },
        { type: 'DynamicCategory', id: 'LIST' }
      ],
    }),

    // =====================
    // CATEGORY MANAGEMENT
    // =====================
    
    createCategory: builder.mutation<DynamicCategory, {
      testSeriesId: number;
      parentCategoryId?: number;
      name: string;
      name_gujarati?: string;
      description?: string;
      description_gujarati?: string;
      duration_minutes?: number;
      difficulty_level?: string;
      negative_marking_enabled?: boolean;
      negative_marks_per_wrong?: number;
      instructions?: string;
      instructions_gujarati?: string;
    }>({
      query: (categoryData) => ({
        url: `/admin/dynamic-test/categories`,
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: (result, error, { testSeriesId, parentCategoryId }) => [
        { type: 'Hierarchy', id: testSeriesId },
        { type: 'DynamicCategory', id: 'LIST' },
        ...(parentCategoryId ? [{ type: 'DynamicCategory', id: parentCategoryId }] : [])
      ],
    }),

    getCategoryDetails: builder.query<{
      category: DynamicCategory;
      breadcrumb: Breadcrumb[];
      availableActions: AvailableActions;
    }, {
      categoryId: number;
      includeChildren?: boolean;
    }>({
      query: ({ categoryId, includeChildren = true }) => 
        `/admin/dynamic-test/categories/${categoryId}?includeChildren=${includeChildren}`,
      providesTags: (result, error, { categoryId }) => [
        { type: 'DynamicCategory', id: categoryId }
      ],
    }),

    updateCategory: builder.mutation<DynamicCategory, {
      categoryId: number;
      data: Partial<DynamicCategory>;
    }>({
      query: ({ categoryId, data }) => ({
        url: `/admin/dynamic-test/categories/${categoryId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'DynamicCategory', id: categoryId },
        { type: 'DynamicCategory', id: 'LIST' }
      ],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (categoryId) => ({
        url: `/admin/dynamic-test/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, categoryId) => [
        { type: 'DynamicCategory', id: categoryId },
        { type: 'DynamicCategory', id: 'LIST' },
        { type: 'Hierarchy', id: 'LIST' }
      ],
    }),

    // =====================
    // QUESTION MANAGEMENT
    // =====================
    
    addQuestion: builder.mutation<DynamicQuestion, {
      categoryId: number;
      questionData: Partial<DynamicQuestion>;
    }>({
      query: ({ categoryId, questionData }) => ({
        url: `/admin/dynamic-test/categories/${categoryId}/questions`,
        method: 'POST',
        body: questionData,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'DynamicCategory', id: categoryId },
        { type: 'DynamicQuestion', id: 'LIST' }
      ],
    }),

    getQuestions: builder.query<{
      category: DynamicCategory;
      questions: DynamicQuestion[];
    }, {
      categoryId: number;
      language?: string;
    }>({
      query: ({ categoryId, language = 'english' }) => 
        `/admin/dynamic-test/categories/${categoryId}/questions?language=${language}`,
      providesTags: (result, error, { categoryId }) => [
        { type: 'DynamicQuestion', id: 'LIST' },
        { type: 'DynamicCategory', id: categoryId }
      ],
    }),

    updateQuestion: builder.mutation<DynamicQuestion, {
      questionId: number;
      data: Partial<DynamicQuestion>;
    }>({
      query: ({ questionId, data }) => ({
        url: `/admin/dynamic-test/questions/${questionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'DynamicQuestion', id: questionId },
        { type: 'DynamicQuestion', id: 'LIST' }
      ],
    }),

    deleteQuestion: builder.mutation<void, number>({
      query: (questionId) => ({
        url: `/admin/dynamic-test/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, questionId) => [
        { type: 'DynamicQuestion', id: questionId },
        { type: 'DynamicQuestion', id: 'LIST' }
      ],
    }),

    // =====================
    // UTILITY ENDPOINTS
    // =====================
    
    getAvailableActions: builder.query<{
      categoryId: number;
      nodeType: string;
      availableActions: AvailableActions;
    }, number>({
      query: (categoryId) => `/admin/dynamic-test/categories/${categoryId}/available-actions`,
    }),

    bulkCreateQuestions: builder.mutation<DynamicQuestion[], {
      categoryId: number;
      questions: Partial<DynamicQuestion>[];
    }>({
      query: ({ categoryId, questions }) => ({
        url: `/admin/dynamic-test/categories/${categoryId}/questions/bulk`,
        method: 'POST',
        body: { questions },
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'DynamicCategory', id: categoryId },
        { type: 'DynamicQuestion', id: 'LIST' }
      ],
    }),

    moveCategory: builder.mutation<DynamicCategory, {
      categoryId: number;
      newParentId?: number;
    }>({
      query: ({ categoryId, newParentId }) => ({
        url: `/admin/dynamic-test/categories/${categoryId}/move`,
        method: 'POST',
        body: { newParentId },
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'DynamicCategory', id: categoryId },
        { type: 'DynamicCategory', id: 'LIST' },
        { type: 'Hierarchy', id: 'LIST' }
      ],
    }),

  }),
});

// Export hooks
export const {
  useGetTestSeriesHierarchyQuery,
  useCreateCategoryMutation,
  useGetCategoryDetailsQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddQuestionMutation,
  useGetQuestionsQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetAvailableActionsQuery,
  useBulkCreateQuestionsMutation,
  useMoveCategoryMutation,
} = dynamicTestApi;