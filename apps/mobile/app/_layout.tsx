import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, StyleSheet, View, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

import { SplashScreenComponent } from '@/components/splash/splash-screen';

// Inject global default font family for consistent typography
// @ts-ignore
if (Text.defaultProps == null) {
  // @ts-ignore
  Text.defaultProps = {};
}
// @ts-ignore
Text.defaultProps.style = { fontFamily: 'Rubik' };

// @ts-ignore
if (TextInput.defaultProps == null) {
  // @ts-ignore
  TextInput.defaultProps = {};
}
// @ts-ignore
TextInput.defaultProps.style = { fontFamily: 'Rubik' };

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { applyLocale } from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { RealtimeSubscriber } from '@/components/notifications/realtime-subscriptions';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';
import { useSettingsStore } from '@/stores/settings';
import { useCartStore } from '@/stores/cart';

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
  const cartHydrate = useCartStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    'Rubik': 'https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/Rubik%5Bwght%5D.ttf',
    'ReadexPro': 'https://raw.githubusercontent.com/ThomasJockin/readexpro/master/fonts/ttf/ReadexPro-Regular.ttf',
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    hydrate();
    settingsHydrate();
    locationHydrate();
    cartHydrate();

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [hydrate, settingsHydrate, locationHydrate, cartHydrate]);

  useEffect(() => {
    if (settingsHydrated) {
      applyLocale(settingsLocale);
    }
  }, [settingsHydrated, settingsLocale]);

  useEffect(() => {
    if (hydrated && settingsHydrated && fontsLoaded) {
      SplashScreen.hideAsync().catch((err) => console.warn(err));
    }
  }, [hydrated, settingsHydrated, fontsLoaded]);

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

  if (!hydrated || !settingsHydrated || !isReady || !fontsLoaded) {
    return <SplashScreenComponent />;
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
            <Stack.Screen name="group-order/[id]/details" />
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