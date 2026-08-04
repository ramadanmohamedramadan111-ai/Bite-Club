import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyLocale } from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { RealtimeSubscriber } from '@/components/notifications/realtime-subscriptions';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import { useSettingsStore } from '@/stores/settings';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { hydrated, isAuthenticated, hydrate } = useAuthStore();
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const settingsLocale = useSettingsStore((s) => s.locale);
  const settingsHydrate = useSettingsStore((s) => s.hydrate);
  const locationHydrate = useLocationStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    settingsHydrate();
    locationHydrate();
  }, [hydrate, settingsHydrate, locationHydrate]);

  useEffect(() => {
    if (settingsHydrated) {
      applyLocale(settingsLocale);
    }
  }, [settingsHydrated, settingsLocale]);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  if (!hydrated || !settingsHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          <Stack
            initialRouteName={isAuthenticated ? '(tabs)' : '(auth)'}
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="orders/past" />
            <Stack.Screen name="orders/[id]" />
            <Stack.Screen name="friends/received" />
            <Stack.Screen name="friends/sent" />
            <Stack.Screen name="friends/discover" />
            <Stack.Screen name="posts/[postId]" />
            <Stack.Screen name="posts/create" />
            <Stack.Screen name="posts/leaderboard" />
            <Stack.Screen name="groups/[id]" />
            <Stack.Screen name="groups/[id]/settings" />
            <Stack.Screen name="groups/[id]/history" />
            <Stack.Screen name="groups/invite/[token]" />
            <Stack.Screen name="group-order/[id]" />
            <Stack.Screen name="group-order/[id]/checkout" />
          </Stack>
          <RealtimeSubscriber />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});