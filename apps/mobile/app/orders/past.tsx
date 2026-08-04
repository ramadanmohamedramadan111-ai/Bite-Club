import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/orders/order-card';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { usePastOrders } from '@/lib/queries';

const PER_PAGE = 15;

export default function PastOrdersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const pastQuery = usePastOrders(page, PER_PAGE);

  const orders = pastQuery.data?.items ?? [];
  const lastPage = pastQuery.data?.meta.last_page ?? 1;
  const total = pastQuery.data?.meta.total ?? 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t('orders.pastTitle')}
        </Text>
      </View>

      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'active', label: t('orders.active') },
            { value: 'past', label: t('orders.past') },
          ]}
          value="past"
          onChange={(value) => {
            if (value === 'active') router.replace('/orders');
          }}
        />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {pastQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="time-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('orders.noPast')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('orders.noPastDesc')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {total > 0 && (
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {total} {total === 1 ? t('orders.pastOrder') : t('orders.pastOrders')}
              </Text>
            )}
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || pastQuery.isLoading}
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
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  back: { padding: Spacing.xs },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: Spacing.xl,
  },
  segmentedWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.sm,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
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
});