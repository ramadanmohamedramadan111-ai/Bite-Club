import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  busy?: boolean;
  small?: boolean;
};

export function QuantityStepper({ quantity, onDecrease, onIncrease, busy, small }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  return (
    <View style={[styles.bar, { borderColor: colors.border }]}>
      <Pressable
        onPress={onDecrease}
        disabled={busy}
        hitSlop={6}
        accessibilityRole="button"
        style={[styles.btn, { backgroundColor: colors.muted }]}>
        <Ionicons name="remove" size={small ? 14 : 16} color={colors.text} />
      </Pressable>
      <Text style={[styles.qty, { color: colors.text }, small && styles.qtySmall]}>{quantity}</Text>
      <Pressable
        onPress={onIncrease}
        disabled={busy}
        hitSlop={6}
        accessibilityRole="button"
        style={[styles.btn, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={small ? 14 : 16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  btn: {    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  qtySmall: {
    minWidth: 28,
    fontSize: 13,
  },
});