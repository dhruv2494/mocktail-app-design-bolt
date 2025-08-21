import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen, Clock } from 'lucide-react-native';
import { getTheme, ThemeColors } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent?: number;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  showTimeSpent?: boolean;
  children?: React.ReactNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  showTimeSpent = false,
  children,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.meta}>
          <View style={styles.subjectBadge}>
            <BookOpen size={12} color={Colors.primary} />
            <Text style={styles.subjectText}>{question.subject}</Text>
          </View>
          <View style={[
            styles.difficultyBadge,
            {
              backgroundColor:
                question.difficulty === 'Easy'
                  ? Colors.badgeSuccessBg
                  : question.difficulty === 'Medium'
                  ? Colors.premiumBadge
                  : Colors.badgeDangerBg,
            },
          ]}>
            <Text style={[
              styles.difficultyText,
              {
                color:
                  question.difficulty === 'Easy'
                    ? Colors.success
                    : question.difficulty === 'Medium'
                    ? Colors.premiumText
                    : Colors.danger,
              },
            ]}>
              {question.difficulty}
            </Text>
          </View>
        </View>

        {children}
      </View>

      <Text style={styles.questionText}>
        {question.question}
      </Text>

      {showTimeSpent && question.timeSpent !== undefined && (
        <View style={styles.timeContainer}>
          <Clock size={14} color={Colors.textSubtle} />
          <Text style={styles.timeText}>
            Time spent:{' '}
            {question.timeSpent > 0
              ? formatTime(question.timeSpent)
              : 'Not attempted'}
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
});