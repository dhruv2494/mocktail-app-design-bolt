import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface QuizHeaderProps {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  onBack: () => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  title,
  currentQuestion,
  totalQuestions,
  onBack,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.questionCount}>
          Question {currentQuestion} of {totalQuestions}
        </Text>
      </View>
      
      <View style={styles.placeholder} />
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  questionCount: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  placeholder: {
    width: 40,
  },
});