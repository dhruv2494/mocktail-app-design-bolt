import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/toastConfig';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="test" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} position="top" />
      <StatusBar style="auto" />
    </>
  );
}
