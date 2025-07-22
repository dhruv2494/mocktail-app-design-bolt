import { Stack } from 'expo-router';

export default function TestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="quiz" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="results" />
      <Stack.Screen name="solutions" />
    </Stack>
  );
}