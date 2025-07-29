import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface QuizTimerProps {
  timeRemaining: number;
  isPaused: boolean;
  canPause: boolean;
  isFlagged: boolean;
  onPauseResume: () => void;
  onShowGrid: () => void;
  onFlagToggle: () => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  timeRemaining,
  isPaused,
  canPause,
  isFlagged,
  onPauseResume,
  onShowGrid,
  onFlagToggle,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerSection}>
        <Ionicons name="time-outline" size={20} color={Colors.primary} />
        <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
      </View>

      <View style={styles.controlsSection}>
        {canPause && (
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={onPauseResume}
          >
            <Ionicons 
              name={isPaused ? "play" : "pause"} 
              size={20} 
              color={Colors.textPrimary} 
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={onShowGrid}
        >
          <Ionicons 
            name="grid-outline" 
            size={20} 
            color={Colors.textPrimary} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isFlagged && styles.flaggedButton]} 
          onPress={onFlagToggle}
        >
          <Ionicons 
            name={isFlagged ? "flag" : "flag-outline"} 
            size={20} 
            color={isFlagged ? Colors.primary : Colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  controlsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  flaggedButton: {
    backgroundColor: Colors.primaryLight,
  },
});