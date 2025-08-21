import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { getTheme, ThemeColors } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface OptionsListProps {
  options: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  onSelectOption?: (index: number) => void;
  disabled?: boolean;
  showCorrect?: boolean;
}

export const OptionsList: React.FC<OptionsListProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  onSelectOption,
  disabled = false,
  showCorrect = false,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = showCorrect && index === correctAnswer;
        const isIncorrect = showCorrect && isSelected && index !== correctAnswer;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              isSelected && !showCorrect && styles.selectedOption,
              isCorrect && styles.correctOption,
              isIncorrect && styles.incorrectOption,
            ]}
            onPress={() => !disabled && onSelectOption?.(index)}
            disabled={disabled}
          >
            <View style={[
              styles.optionIndicator,
              isSelected && !showCorrect && styles.selectedIndicator,
              isCorrect && styles.correctIndicator,
              isIncorrect && styles.incorrectIndicator,
            ]}>
              <Text style={[
                styles.optionLetter,
                (isSelected && !showCorrect) || isCorrect || isIncorrect
                  ? styles.optionLetterActive
                  : null,
              ]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>

            <Text style={[
              styles.optionText,
              isCorrect && styles.correctOptionText,
              isIncorrect && styles.incorrectOptionText,
            ]}>
              {option}
            </Text>

            {showCorrect && isCorrect && (
              <CheckCircle size={20} color={Colors.success} />
            )}
            {showCorrect && isIncorrect && (
              <XCircle size={20} color={Colors.danger} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.muted,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.chip,
  },
  correctOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.badgeSuccessBg,
  },
  incorrectOption: {
    borderColor: Colors.danger,
    backgroundColor: Colors.badgeDangerBg,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIndicator: {
    backgroundColor: Colors.primary,
  },
  correctIndicator: {
    backgroundColor: Colors.success,
  },
  incorrectIndicator: {
    backgroundColor: Colors.danger,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  optionLetterActive: {
    color: Colors.white,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  correctOptionText: {
    color: Colors.success,
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: Colors.danger,
  },
});