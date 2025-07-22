import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getTheme, ThemeColors } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onQuestionSelect: (index: number) => void;
  onClose: () => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  flaggedQuestions,
  onQuestionSelect,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const getQuestionStatus = (index: number) => {
    if (answeredQuestions.has(index)) return 'answered';
    if (flaggedQuestions.has(index)) return 'flagged';
    if (index === currentQuestion) return 'current';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return Colors.success;
      case 'flagged':
        return Colors.warning;
      case 'current':
        return Colors.primary;
      default:
        return Colors.muted;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Question Navigator</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Answered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Flagged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.muted }]} />
          <Text style={styles.legendText}>Unanswered</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {Array.from({ length: totalQuestions }, (_, index) => {
          const status = getQuestionStatus(index);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.gridItem,
                { backgroundColor: getStatusColor(status) },
              ]}
              onPress={() => onQuestionSelect(index)}
            >
              <Text style={[
                styles.gridItemText,
                status === 'unanswered' && { color: Colors.textSubtle },
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});