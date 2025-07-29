import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Option {
  id: number;
  option_text: string;
}

interface AnswerOptionsProps {
  options: Option[];
  selectedAnswer: number | null;
  questionId: number;
  onAnswerSelect: (optionId: number) => void;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  selectedAnswer,
  questionId,
  onAnswerSelect,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.optionButton,
            selectedAnswer === option.id && styles.selectedOption,
          ]}
          onPress={() => onAnswerSelect(option.id)}
        >
          <View style={[
            styles.optionLabel,
            selectedAnswer === option.id && styles.selectedLabel,
          ]}>
            <Text style={[
              styles.optionLabelText,
              selectedAnswer === option.id && styles.selectedLabelText,
            ]}>
              {getOptionLabel(index)}
            </Text>
          </View>
          <Text style={[
            styles.optionText,
            selectedAnswer === option.id && styles.selectedText,
          ]}>
            {option.option_text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedLabel: {
    backgroundColor: Colors.primary,
  },
  optionLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedLabelText: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});