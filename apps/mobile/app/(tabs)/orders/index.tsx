import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderCard } from '@/components/orders/order-card';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useActiveOrders } from '@/lib/queries';

export default function OrdersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const activeQuery = useActiveOrders();

  const orders = activeQuery.data ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('orders.title')}</Text>
      </View>

      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'active', label: t('orders.active') },
            { value: 'past', label: t('orders.past') },
          ]}
          value="active"
          onChange={(value) => {
            if (value === 'past') router.push('/orders/past');
          }}
        />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {activeQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('orders.noActive')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('orders.noActiveDesc')}
            </Text>
            <Pressable
              onPress={() => router.replace('/')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.browseText, { color: colors.primary }]}>
                {t('orders.browseRestaurants')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {orders.length} {orders.length === 1 ? t('orders.activeOrder') : t('orders.activeOrders')}
            </Text>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
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
  browseBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  browseText: {
    fontSize: 14,
    fontWeight: '700',
  },
});