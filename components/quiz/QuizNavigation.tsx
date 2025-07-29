import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  isSubmitting,
  canGoNext,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const isLastQuestion = currentQuestion === totalQuestions;
  const isFirstQuestion = currentQuestion === 1;

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[styles.navButton, isFirstQuestion && styles.disabledButton]}
          onPress={onPrevious}
          disabled={isFirstQuestion}
        >
          <Text style={[styles.navButtonText, isFirstQuestion && styles.disabledText]}>
            Previous
          </Text>
        </TouchableOpacity>

        {!isLastQuestion && (
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.disabledButton]}
            onPress={onNext}
            disabled={!canGoNext}
          >
            <Text style={[styles.navButtonText, !canGoNext && styles.disabledText]}>
              Next
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLastQuestion && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Submit Quiz</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    marginTop: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  disabledText: {
    color: Colors.textSubtle,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});