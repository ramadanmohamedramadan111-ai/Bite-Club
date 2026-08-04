import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useReferrals } from '@/lib/queries';
import type { ReferralItem } from '@/lib/types';
import type { Theme } from '@/constants/theme';

const PER_PAGE = 15;

function ReferralRow({ item, colors }: { item: ReferralItem; colors: Record<Theme, string> }) {
  const { t } = useI18n();
  const completed = item.status === 'completed';
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
        <Text style={[styles.avatarText, { color: colors.textSecondary }]}>
          {item.referred_user.name?.charAt(0).toUpperCase() ?? '@'}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
          {item.referred_user.name ?? `@${item.referred_user.username}`}
        </Text>
        <Text style={[styles.rowDate, { color: colors.textSecondary }]}>
          {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : '—'}
        </Text>
      </View>
      <View
        style={[
          styles.statusPill,
          { backgroundColor: completed ? colors.success : colors.textSecondary },
        ]}>
        <Ionicons name={completed ? 'checkmark' : 'time'} size={11} color="#FFFFFF" />
        <Text style={styles.statusText}>
          {t(completed ? 'points.referralCompleted' : 'points.referralPending')}
        </Text>
      </View>
    </View>
  );
}

export default function ReferralsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const referralsQuery = useReferrals(page, PER_PAGE);

  const referrals = referralsQuery.data?.items ?? [];
  const lastPage = referralsQuery.data?.meta.last_page ?? 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {t('points.referrals')}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{t('points.referredUsersDesc')}</Text>

        {referralsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : referrals.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('points.referralNoUsers')}</Text>
          </View>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {referrals.map((item) => (
              <ReferralRow key={item.id} item={item} colors={colors} />
            ))}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || referralsQuery.isLoading}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page <= 1 && styles.disabled,
              ]}>
              <Ionicons name="chevron-back" size={16} color={colors.text} />
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.prev')}</Text>
            </Pressable>
            <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
              {t('restaurants.page')} {page} {t('restaurants.of')} {lastPage}
            </Text>
            <Pressable
              onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page >= lastPage && styles.disabled,
              ]}>
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.next')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBack: { padding: Spacing.xs },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  navSpacer: { width: 30 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  desc: { fontSize: 13, fontWeight: '500', marginTop: Spacing.sm },
  list: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  rowBody: { flex: 1, gap: 2 },
  rowName: { fontSize: 14, fontWeight: '700' },
  rowDate: { fontSize: 11 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pageText: { fontSize: 13, fontWeight: '700' },
  pageIndicator: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
  },
  emptyText: { fontSize: 13, fontWeight: '600' },
});
