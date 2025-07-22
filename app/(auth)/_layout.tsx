import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useTheme } from '@/contexts/ThemeContext';

export default function AuthLayout() {
  useFrameworkReady();
  const { isDarkMode } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="otp-verify" />
        <Stack.Screen name="update-password" />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
}
