import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ErrorBanner({ message }: { message?: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  if (!message) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '50' }]}>
      <Ionicons name="alert-circle" size={18} color={colors.destructive} />
      <Text style={[styles.text, { color: colors.destructive }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});