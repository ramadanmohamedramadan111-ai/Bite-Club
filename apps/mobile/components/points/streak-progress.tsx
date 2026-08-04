import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import type { StreakDetails } from '@/lib/types';

type Props = {
  streak: StreakDetails;
};

export function StreakProgress({ streak }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const { completed_orders_count, next_tier } = streak;

  // Safe extraction with fallback values
  const target_orders = next_tier?.target_orders ?? 1;
  const orders_needed = next_tier?.orders_needed ?? 0;
  const reward_points = next_tier?.reward_points ?? 0;

  const progress = next_tier
    ? Math.min(completed_orders_count / Math.max(target_orders, 1), 1)
    : 1;

  const isTargetReached = completed_orders_count >= target_orders;

  if (!next_tier) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('gamification.weeklyProgress')}
          </Text>
          <Text style={[styles.progressVal, { color: colors.success }]}>
            {t('gamification.complete')}
          </Text>
        </View>

        <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
          <View style={[styles.barFill, { width: '100%', backgroundColor: colors.success }]} />
        </View>

        <View style={[styles.infoRow, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
          <Ionicons name="star" size={16} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.success }]}>
            {t('gamification.allBadgesEarned')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('gamification.weeklyProgress')}
        </Text>
        <Text style={[styles.progressVal, { color: colors.text }]}>
          {completed_orders_count}
          <Text style={{ color: colors.textSecondary }}>/{target_orders}</Text>
          <Text style={[styles.ordersLabel, { color: colors.textSecondary }]}> {t('gamification.orders')}</Text>
        </Text>
      </View>

      <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>

      {!isTargetReached && orders_needed > 0 && (
        <View style={[styles.infoRow, { backgroundColor: '#FF980010', borderColor: '#FF98004D' }]}>
          <View style={styles.infoLeft}>
            <Ionicons name="gift-outline" size={16} color="#FF9800" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('gamification.ordersToEarn', { count: orders_needed })}
            </Text>
          </View>
          <Text style={[styles.pointsVal, { color: '#FF9800' }]}>
            {t('gamification.earnedPoints', { count: reward_points })}
          </Text>
        </View>
      )}

      {isTargetReached && (
        <View style={[styles.infoRow, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.success }]}>
            {t('gamification.targetReached')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  ordersLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  barBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  pointsVal: {
    fontSize: 13,
    fontWeight: '800',
  },
});
