import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/toastConfig';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function AppContent() {
  useFrameworkReady();
  const { initializeAuthState } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    initializeAuthState();
  }, [initializeAuthState]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="test" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} position="top" />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
