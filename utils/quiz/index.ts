import { ThemeColors } from '@/types';

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getQuestionStatus = (
  questionId: number,
  selectedAnswers: { [key: number]: number },
  flaggedQuestions: number[]
): 'answered' | 'flagged' | 'unanswered' => {
  if (selectedAnswers[questionId]) {
    return 'answered';
  } else if (flaggedQuestions.includes(questionId)) {
    return 'flagged';
  }
  return 'unanswered';
};

export const getStatusColor = (
  status: 'answered' | 'flagged' | 'unanswered',
  Colors: ThemeColors
): string => {
  switch (status) {
    case 'answered':
      return '#4CAF50';
    case 'flagged':
      return '#FF9800';
    case 'unanswered':
    default:
      return Colors.textSubtle || '#999';
  }
};

export const calculateQuizProgress = (
  totalQuestions: number,
  selectedAnswers: { [key: number]: number }
): number => {
  const answeredCount = Object.keys(selectedAnswers).length;
  return totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
};

export const getQuizStatistics = (
  totalQuestions: number,
  selectedAnswers: { [key: number]: number },
  flaggedQuestions: number[]
) => {
  const answered = Object.keys(selectedAnswers).length;
  const flagged = flaggedQuestions.length;
  const unanswered = totalQuestions - answered;

  return {
    answered,
    flagged,
    unanswered,
    total: totalQuestions,
    progress: calculateQuizProgress(totalQuestions, selectedAnswers),
  };
};