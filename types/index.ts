import { ThemeColors } from '@/theme';

// Question types
export interface BaseQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizQuestion extends BaseQuestion {
  timeLimit?: number;
}

export interface SolutionQuestion extends BaseQuestion {
  userAnswer?: number;
  timeSpent: number;
}

// Style function types
export type StyleFunction<T = any> = (Colors: ThemeColors) => T;

// Test/Quiz types
export interface TestInfo {
  title: string;
  canPause: boolean;
  isOneTime: boolean;
  multiLanguage: boolean;
}

// Performance metrics
export interface PerformanceMetrics {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  timeSpent: number;
  rank?: number;
}

// Navigation types
export interface QuestionNavigationState {
  currentQuestion: number;
  selectedAnswers: { [key: number]: number };
  flaggedQuestions: Set<number>;
  showGrid: boolean;
}

// Theme types (re-export for convenience)
export type { ThemeColors } from '@/theme';