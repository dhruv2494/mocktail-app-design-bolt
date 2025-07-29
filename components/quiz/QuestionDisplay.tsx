import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Badge } from './shared/Badge';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Question {
  question: string;
  subject: string;
  difficulty: string;
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.badges}>
        <Badge text={question.subject} variant="primary" />
        <Badge 
          text={question.difficulty} 
          variant={getDifficultyVariant(question.difficulty)} 
        />
      </View>
      
      <ScrollView 
        style={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionNumber}>Question {questionNumber}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </ScrollView>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  questionContainer: {
    maxHeight: 200,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  questionNumber: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginBottom: 8,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
});