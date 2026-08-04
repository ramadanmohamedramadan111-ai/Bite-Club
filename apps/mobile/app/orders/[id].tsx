import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useCancelOrder, useOrderDetails } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { useRealtimeOrder } from '@/stores/notifications';

export default function OrderDetailScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, isError, refetch } = useOrderDetails(orderId);
  const cancelMutation = useCancelOrder();

  useRealtimeOrder(orderId, () => refetch());

  if (isLoading || !order) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Header onBack={() => router.back()} title={t('orders.orderNumber', { id })} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  const loadedOrder = order;

  const logo = resolveImageUrl(loadedOrder.restaurant.logo_url);
  const initials = loadedOrder.restaurant.name?.charAt(0).toUpperCase() ?? '?';
  const isPending = loadedOrder.status === 'pending';
  const hasFullCashPayment = loadedOrder.payments?.some((p) => p.payment_method === 'cash');
  const showCancel = isPending && hasFullCashPayment;
  const tracking = loadedOrder.tracking;

  function onCancel() {
    Alert.alert(t('orders.cancelTitle'), t('orders.cancelDesc'), [
      { text: t('orders.goBack'), style: 'cancel' },
      {
        text: t('orders.cancelAction'),
        style: 'destructive',
        onPress: () => {
          cancelMutation.mutate(loadedOrder.id, {
            onSuccess: () => {
              Alert.alert(t('orders.cancelled'));
              refetch();
            },
          });
        },
      },
    ]);
  }

  function paymentLabel(method: string) {
    return method === 'visa' ? t('orders.visa') : t('orders.cash');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        onBack={() => router.back()}
        title={t('orders.orderNumber', { id: loadedOrder.id })}
      />

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {isError && (
          <View style={styles.errorBar}>
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {t('orders.loadError')}
            </Text>
          </View>
        )}

        <View style={styles.headRow}>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {loadedOrder.time_ago || loadedOrder.created_at}
          </Text>
          <OrderStatusBadge status={loadedOrder.status} />
        </View>

        {tracking && tracking.steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.tracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.timeline}>
                {tracking.steps.map((step, index) => {
                  const isLast = index === tracking.steps.length - 1;
                  const done = tracking.is_cancelled
                    ? false
                    : step.state === 'completed' || step.state === 'active';
                  return (
                    <View key={step.status} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: done ? colors.success : colors.border,
                              borderColor: done ? colors.success : colors.border,
                            },
                          ]}
                        />
                        {!isLast && (
                          <View style={[styles.line, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          {
                            color: done ? colors.text : colors.textSecondary,
                            fontWeight: done ? '700' : '500',
                          },
                        ]}>
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.restaurant')}</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.restaurantRow}>
              {logo ? (
                <View style={[styles.restaurantLogo, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Image source={logo} style={styles.restaurantLogoImg} contentFit="cover" transition={150} />
                </View>
              ) : (
                <View style={[styles.restaurantLogo, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Text style={[styles.restaurantInitials, { color: colors.primary }]}>{initials}</Text>
                </View>
              )}
              <View style={styles.restaurantText}>
                <Text style={[styles.restaurantName, { color: colors.text }]}>{loadedOrder.restaurant.name}</Text>
                <Text style={[styles.orderType, { color: colors.textSecondary }]}>
                  {loadedOrder.order_type === 'delivery' ? t('orders.delivery') : t('orders.pickup')}
                </Text>
                {loadedOrder.restaurant.address ? (
                  <Text style={[styles.restaurantAddress, { color: colors.textSecondary }]}>
                    {loadedOrder.restaurant.address}
                  </Text>
                ) : null}
              </View>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('orders.orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.itemsList}>
              {loadedOrder.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.quantity}x {item.item_name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {t('orders.egp', { amount: (item.price * item.quantity).toLocaleString() })}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.financeRows}>
              <View style={styles.financeRow}>
                <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>{t('orders.subtotal')}</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {t('orders.egp', { amount: loadedOrder.financials.subtotal.toLocaleString() })}
                </Text>
              </View>
              <View style={styles.financeRow}>
                <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>{t('orders.deliveryFee')}</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {t('orders.egp', { amount: loadedOrder.financials.delivery_fee.toLocaleString() })}
                </Text>
              </View>
              <View style={styles.financeRow}>
                <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>{t('orders.serviceFee')}</Text>
                <Text style={[styles.financeValue, { color: colors.text }]}>
                  {t('orders.egp', { amount: loadedOrder.financials.service_fee.toLocaleString() })}
                </Text>
              </View>
            </View>

            <View style={[styles.totalBar, { backgroundColor: colors.muted }]}>
              <Text style={[styles.totalLabel, { color: colors.primary }]}>{t('orders.total')}</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {t('orders.egp', { amount: loadedOrder.financials.total.toLocaleString() })}
              </Text>
            </View>
          </CardContent>
        </Card>

        {loadedOrder.payments && loadedOrder.payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.payment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.paymentRow}>
                <View style={[styles.paymentIcon, { backgroundColor: colors.muted }]}>
                  <Ionicons
                    name={loadedOrder.payments[0].payment_method === 'visa' ? 'card-outline' : 'cash-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={[styles.paymentLabel, { color: colors.text }]}>
                  {paymentLabel(loadedOrder.payments[0].payment_method ?? 'cash')}
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {showCancel && (
          <Pressable
            onPress={onCancel}
            disabled={cancelMutation.isPending}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelBtn,
              { backgroundColor: colors.destructive },
              (pressed || cancelMutation.isPending) && { opacity: 0.7 },
            ]}>
            {cancelMutation.isPending && (
              <ActivityIndicator size="small" color={colors.destructiveForeground} />
            )}
            <Ionicons name="close-circle-outline" size={18} color={colors.destructiveForeground} />
            <Text style={[styles.cancelText, { color: colors.destructiveForeground }]}>
              {t('orders.cancelOrder')}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  back: { padding: Spacing.xs },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  errorBar: {
    paddingVertical: Spacing.sm,
  },
  errorText: { fontSize: 13, fontWeight: '600' },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  timeAgo: {
    flex: 1,
    fontSize: 13,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    minHeight: 40,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 2,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 2,
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    paddingTop: 1,
    paddingBottom: Spacing.md,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  restaurantLogo: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  restaurantLogoWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  restaurantLogoImg: { width: '100%', height: '100%' },
  restaurantInitials: { fontSize: 20, fontWeight: '800' },
  restaurantText: { flex: 1, gap: 2 },
  restaurantName: { fontSize: 16, fontWeight: '700' },
  orderType: { fontSize: 12, textTransform: 'capitalize' },
  restaurantAddress: { fontSize: 12 },
  itemsList: { gap: Spacing.sm },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  itemName: { flex: 1, fontSize: 14 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#9999',
    marginVertical: Spacing.sm,
  },
  financeRows: { gap: Spacing.sm },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  financeLabel: { fontSize: 14 },
  financeValue: { fontSize: 14, fontWeight: '600' },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '800' },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLabel: { fontSize: 14, fontWeight: '600' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
  },
  cancelText: { fontSize: 16, fontWeight: '700' },
});