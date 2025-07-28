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
import { notificationService } from '@/services/NotificationService';

function AppContent() {
  useFrameworkReady();
  const { initializeAuthState } = useAuth();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize authentication
      await initializeAuthState();
      
      // Initialize notification service
      try {
        const initialized = await notificationService.initialize();
        if (initialized) {
          console.log('✅ Notification service initialized successfully');
        } else {
          console.warn('⚠️  Notification service initialization failed');
        }
      } catch (error) {
        console.error('❌ Error initializing notification service:', error);
      }
    };

    initializeApp();
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
