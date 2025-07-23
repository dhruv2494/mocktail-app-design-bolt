import { Stack } from 'expo-router';
import { AuthGuard } from '@/components/AuthGuard';

export default function TestLayout() {
  return (
    <AuthGuard requireEmailVerification={true}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="quiz" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="results" />
        <Stack.Screen name="solutions" />
      </Stack>
    </AuthGuard>
  );
}