// theme.tsx
export interface ThemeColors {
  white: string;
  black: string;
  gray400: string;
  blue500: string;
  yellow600: string;
  primary: string;
  primaryLight: string;
  primaryExtraLight: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSubtle: string;
  textLink: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  light: string;
  chip: string;
  badgeSuccessBg: string;
  badgeDangerBg: string;
  shadow: string;
  premiumBadge: string;
  premiumText: string;
  skeletonBase: string;
  skeletonHighlight: string;
  border: string;
  error: string;
  progress: string;
}

export const LightTheme: ThemeColors = {
  white: '#FFFFFF',
  black: '#000000',
  gray400: '#9CA3AF',
  blue500: '#3B82F6',
  yellow600: '#D97706',
  primary: '#0A1F66',
  primaryLight: '#3A5DAE',
  primaryExtraLight: '#7C95D6',
  accent: '#1D8A9E',
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  textPrimary: '#111827',
  textSubtle: '#6B7280',
  textLink: '#1D8A9E',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  muted: '#E5E7EB',
  light: '#F3F4F6',
  chip: '#EEF2FF',
  badgeSuccessBg: '#D1FAE5',
  badgeDangerBg: '#FEE2E2',
  shadow: '#000',
  premiumBadge: '#FEF3C7',
  premiumText: '#D97706',
  skeletonBase: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
  border: '#E5E7EB',
  error: '#DC2626',
  progress: '#10B981',
};

export const DarkTheme: ThemeColors = {
  white: '#FFFFFF',
  black: '#000000',
  gray400: '#6B7280',
  blue500: '#60A5FA',
  yellow600: '#FBBF24',
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryExtraLight: '#60A5FA',
  accent: '#06B6D4',
  background: '#0F172A',
  cardBackground: '#1E293B',
  textPrimary: '#F1F5F9',
  textSubtle: '#94A3B8',
  textLink: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#374151',
  light: '#334155',
  chip: '#1E293B',
  badgeSuccessBg: '#064E3B',
  badgeDangerBg: '#7F1D1D',
  shadow: '#000',
  premiumBadge: '#451A03',
  premiumText: '#FBBF24',
  skeletonBase: '#374151',
  skeletonHighlight: '#4B5563',
  border: '#374151',
  error: '#EF4444',
  progress: '#10B981',
};

// Default export for backward compatibility
export const Colors = LightTheme;

export const getTheme = (isDarkMode: boolean): ThemeColors => {
  try {
    return isDarkMode ? DarkTheme : LightTheme;
  } catch (error) {
    console.warn('Theme initialization error, using fallback:', error);
    return LightTheme;
  }
};
