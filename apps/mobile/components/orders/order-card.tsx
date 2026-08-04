import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { queryKeys } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { api } from '@/lib/api';
import type { UserOrder } from '@/lib/types';

function formatItemsInline(order: UserOrder) {
  return order.items.map((item) => `${item.quantity}x ${item.item_name}`).join(' · ');
}

export function OrderCard({ order }: { order: UserOrder }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logo = resolveImageUrl(order.restaurant.logo_url);
  const initials = order.restaurant.name?.charAt(0).toUpperCase() ?? '?';

  const isPending = order.status === 'pending';
  const hasFullCashPayment = order.payments?.some((p) => p.payment_method === 'cash');
  const showCancel = isPending && hasFullCashPayment;

  function onCancel() {
    Alert.alert(t('orders.cancelTitle'), t('orders.cancelDesc'), [
      { text: t('orders.goBack'), style: 'cancel' },
      {
        text: t('orders.cancelAction'),
        style: 'destructive',
        onPress: () => {
          api
            .post(`/user/orders/${order.id}/cancel`)
            .then(() => {
              void queryClient.invalidateQueries({ queryKey: queryKeys.activeOrders });
              void queryClient.invalidateQueries({
                queryKey: queryKeys.orderDetails(order.id),
              });
              Alert.alert(t('orders.cancelled'));
            })
            .catch(() => Alert.alert(t('common.genericError')));
        },
      },
    ]);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.head}>
        {logo ? (
          <View style={[styles.logoWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Image source={logo} style={styles.logo} contentFit="cover" transition={150} />
          </View>
        ) : (
          <View style={[styles.logoWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Text style={[styles.logoInitials, { color: colors.primary }]}>{initials}</Text>
          </View>
        )}
        <View style={styles.headText}>
          <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
            {order.restaurant.name}
          </Text>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {order.time_ago || order.created_at}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.chip, { backgroundColor: colors.muted }]}>
          <Ionicons name="bag-handle-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>
            {order.order_type}
          </Text>
        </View>
        <Text style={[styles.total, { color: colors.primary }]}>
          {t('orders.egp', { amount: order.financials.total.toLocaleString() })}
        </Text>
      </View>

      <Text style={[styles.items, { color: colors.text }]} numberOfLines={2}>
        {formatItemsInline(order)}
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/orders/${order.id}`)}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.actionBtn,
            { borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}>
          <Ionicons name="eye-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>{t('orders.viewDetails')}</Text>
        </Pressable>
        {showCancel && (
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.destructive },
              pressed && { opacity: 0.7 },
            ]}>
            <Ionicons name="close-circle-outline" size={16} color={colors.destructiveForeground} />
            <Text style={[styles.actionText, { color: colors.destructiveForeground }]}>
              {t('orders.cancelOrder')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  total: {
    fontSize: 13,
    fontWeight: '700',
  },
  items: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});