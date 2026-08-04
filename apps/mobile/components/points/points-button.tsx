import { Coins } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWallet, useStreak } from '@/lib/queries';

export function PointsButton() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const { data: wallet } = useWallet();
  const balance = wallet?.balance ?? 0;

  const { data: streak } = useStreak();

  return (
    <Pressable
      onPress={() => router.push('/points')}
      accessibilityRole="button"
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.pointsWrap}>
        <Coins size={14} color="#F5A623" />
        <Text style={[styles.text, { color: colors.text }]}>{balance}</Text>
      </View>

      {streak && (
        <View style={[styles.streakContainer, { borderLeftColor: colors.border }]}>
          <Ionicons name="flame" size={14} color="#FF5722" />
          <Text style={[styles.text, { color: colors.text }]}>
            {streak.completed_orders_count}
            {streak.next_tier ? `/${streak.next_tier.target_orders}` : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  pointsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderLeftWidth: 1,
    paddingLeft: 8,
    marginLeft: 6,
  },
});