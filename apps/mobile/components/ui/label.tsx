import { Text, type TextProps, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Label({ style, ...rest }: TextProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return <Text style={[styles.label, { color: colors.text }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
