import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type Size = 'default' | 'sm' | 'lg';

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children?: ReactNode;
  style?: object;
  fullWidth?: boolean;
} & Omit<ComponentProps<typeof Pressable>, 'style' | 'children'>;

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  onPress,
  children,
  style,
  fullWidth = true,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const isDisabled = disabled || loading;

  const labelColor =
    variant === 'default'
      ? colors.primaryForeground
      : variant === 'destructive'
        ? colors.destructiveForeground
        : variant === 'secondary'
          ? colors.foreground
          : colors.primary;

  const content = (
    <View style={styles.row}>
      {loading && <ActivityIndicator size="small" color={labelColor} />}
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.label,
            size === 'lg' && styles.labelLg,
            size === 'sm' && styles.labelSm,
            { color: labelColor },
          ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );

  const pressedStyle = ({ pressed }: { pressed: boolean }) => [
    styles.base,
    size === 'lg' && styles.lg,
    size === 'sm' && styles.sm,
    fullWidth && styles.fullWidth,
    pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
    isDisabled && { opacity: 0.55 },
    style,
  ];

  if (variant === 'default') {
    return (
      <Pressable {...rest} disabled={isDisabled} onPress={onPress} accessibilityRole="button" style={pressedStyle}>
        <LinearGradient
          colors={[colors.primary, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radius.xl }]}
        />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      style={[
        pressedStyle({ pressed: false }),
        variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        variant === 'secondary' && { backgroundColor: colors.muted },
        variant === 'destructive' && { backgroundColor: colors.destructive },
        variant === 'link' && { backgroundColor: 'transparent' },
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  lg: {
    height: 52,
    paddingHorizontal: Spacing.xl,
  },
  sm: {
    height: 40,
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  labelLg: {
    fontSize: 17,
  },
  labelSm: {
    fontSize: 14,
  },
});
