import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ 
  text, 
  variant = 'primary',
  size = 'small' 
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors, variant, size);

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

const getStyles = (Colors: any, variant: string, size: string) => {
  const variantColors = {
    primary: { bg: Colors.primaryLight, text: Colors.primary },
    secondary: { bg: Colors.secondaryLight, text: Colors.secondary },
    success: { bg: '#e6f4e6', text: '#4CAF50' },
    warning: { bg: '#fff3cd', text: '#856404' },
    danger: { bg: '#f8d7da', text: '#721c24' },
    info: { bg: '#d1ecf1', text: '#0c5460' },
  };

  const colors = variantColors[variant as keyof typeof variantColors] || variantColors.primary;
  const isSmall = size === 'small';

  return StyleSheet.create({
    badge: {
      backgroundColor: colors.bg,
      paddingHorizontal: isSmall ? 8 : 12,
      paddingVertical: isSmall ? 4 : 6,
      borderRadius: isSmall ? 12 : 16,
      alignSelf: 'flex-start',
    },
    badgeText: {
      fontSize: isSmall ? 11 : 13,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
  });
};