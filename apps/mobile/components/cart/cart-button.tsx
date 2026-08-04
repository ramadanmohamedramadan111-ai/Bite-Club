import { ShoppingCart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  count: number;
  onPress: () => void;
};

export function CartButton({ count, onPress }: Props) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={`cart, ${count} items`}
      style={styles.button}>
      <ShoppingCart size={22} color={colors.text} strokeWidth={2} />
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text
            style={[
              styles.badgeCount,
              count > 9
                ? styles.badgeCountFontSmall
                : styles.badgeCountFontLarge,
            ]}>
            {count > 9 ? '9+' : count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeCountFontSmall: {
    fontSize: 7,
  },
  badgeCountFontLarge: {
    fontSize: 10,
  },

  badgeCount: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

