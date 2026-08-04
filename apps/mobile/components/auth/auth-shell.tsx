import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AuthSettingsBar from '@/components/auth/auth-settings-controls';

export function AuthShell({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();

  return (
    <LinearGradient
      colors={
        scheme === 'dark'
          ? [colors.background, '#1D1612']
          : [colors.background, '#FBF0EA']
      }
      style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Pressable
                onPress={() => router.replace('/')}
                style={styles.brand}
                accessibilityRole="button">
                <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.brandText, { color: colors.primary }]}>BiteClub</Text>
              </Pressable>
              <View style={styles.body}>
                <View style={styles.cardWrap}>{children}</View>
              </View>
              <AuthSettingsBar />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    gap: Spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.sm,
  },
  brandText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrap: {
    alignItems: 'center',
    width: '100%',
  },
});