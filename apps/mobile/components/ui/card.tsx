import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import type { ReactNode } from 'react';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return <Text style={[styles.title, { color: colors.text }, style]}>{children}</Text>;
}

export function CardDescription({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return <Text style={[styles.desc, { color: colors.textSecondary }, style]}>{children}</Text>;
}

export function CardContent({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    width: '100%',
  },
  header: {
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    gap: Spacing.lg,
  },
});