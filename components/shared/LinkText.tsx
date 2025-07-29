import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { getTheme, ThemeColors } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface LinkTextProps {
  prefix?: string;
  linkText: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const LinkText: React.FC<LinkTextProps> = ({
  prefix,
  linkText,
  onPress,
  style,
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  return (
    <View style={[styles.container, style]}>
      {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <Text style={[styles.linkText, disabled && styles.disabledText]}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  prefixText: {
    color: Colors.textSubtle,
    fontSize: 16,
    marginRight: 4,
  },
  linkText: {
    color: Colors.textLink,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: Colors.textSubtle,
    opacity: 0.5,
  },
});