import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs } from 'expo-router';
import { Chrome as Home, BookOpen, User, FileText, Play, Bell } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';

export default function TabLayout() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);
  
  return (
    <AuthGuard requireEmailVerification={true}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.textLink,
          tabBarInactiveTintColor: Colors.textSubtle,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.muted,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.navigation.home,
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="free-tests"
          options={{
            title: t.navigation.freeTests,
            tabBarIcon: ({ size, color }) => <Play size={size} color={color} />,
            tabBarStyle: { display: 'none' }, // Hides the tab bar completely
          }}
        />
        <Tabs.Screen
          name="test-series"
          options={{
            title: t.navigation.testSeries,
            tabBarIcon: ({ size, color }) => <BookOpen size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="pdfs"
          options={{
            title: t.navigation.pdfs,
            tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t.navigation.notifications,
            tabBarIcon: ({ size, color }) => <Bell size={size} color={color} />,
            tabBarStyle: { display: 'none' }, // Hides the tab bar completely
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t.navigation.profile,
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
