import { Ionicons } from '@expo/vector-icons';
import { Coins } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useWallet, useWalletTransactions, useStreak } from '@/lib/queries';
import { ReferralLinkSection } from '@/components/points/referral-link-section';
import { StreakProgress } from '@/components/points/streak-progress';
import type { WalletTransaction } from '@/lib/types';

const PER_PAGE = 15;

function sourceLabel(source: string): string {
  switch (source) {
    case 'referral':
      return 'points.source.referral';
    case 'redemption':
      return 'points.source.redemption';
    case 'leaderboard':
      return 'points.source.leaderboard';
    case 'weekly_streak':
      return 'points.source.weekly_streak';
    case 'point_gift':
      return 'points.source.point_gift';
    default:
      return source;
  }
}

function isEarn(tx: WalletTransaction): boolean {
  return tx.type === 'earn' || tx.type === 'gift_received';
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}

export default function PointsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const walletQuery = useWallet();
  const txQuery = useWalletTransactions(page, PER_PAGE);
  const streakQuery = useStreak();

  const wallet = walletQuery.data;
  const transactions = txQuery.data?.items ?? [];
  const lastPage = txQuery.data?.meta.last_page ?? 1;
  const streak = streakQuery.data;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {t('points.title')}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.balanceCard,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}>
          <Coins size={28} color="#FFFFFF" />
          <View style={styles.balanceBody}>
            <Text style={styles.balanceLabel}>{t('points.balance')}</Text>
            <Text style={styles.balanceValue}>{wallet?.balance ?? 0}</Text>
          </View>
        </View>

        {streak ? <StreakProgress streak={streak} /> : null}

        <ReferralLinkSection />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('points.history')}</Text>

        {txQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="sparkles-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('points.empty')}</Text>
          </View>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {transactions.map((tx) => {
              const earned = isEarn(tx);
              return (
                <View
                  key={tx.id}
                  style={[styles.txRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.txIcon, { backgroundColor: colors.muted }]}>
                    <Ionicons
                      name={earned ? 'add' : 'remove'}
                      size={16}
                      color={earned ? colors.success : colors.destructive}
                    />
                  </View>
                  <View style={styles.txBody}>
                    <Text style={[styles.txSource, { color: colors.text }]} numberOfLines={1}>
                      {t(sourceLabel(tx.source))}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                      {formatDate(tx.created_at)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txPoints,
                      { color: earned ? colors.success : colors.destructive },
                    ]}>
                    {tx.points > 0 ? `+${tx.points}` : tx.points}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || txQuery.isLoading}
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
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  balanceBody: { flex: 1 },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: Spacing.sm,
  },
  list: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txBody: { flex: 1, gap: 2 },
  txSource: { fontSize: 14, fontWeight: '700' },
  txDate: { fontSize: 11 },
  txPoints: { fontSize: 15, fontWeight: '900' },
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
