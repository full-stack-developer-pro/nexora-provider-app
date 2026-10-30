import { Stack } from 'expo-router';
import { NexoraColors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: NexoraColors.canvas },
        animation: 'slide_from_right',
      }}
    />
  );
}
