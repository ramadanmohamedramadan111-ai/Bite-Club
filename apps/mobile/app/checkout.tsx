import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/location/location-picker';
import { DirectionalIcon } from '@/components/ui/directional-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  useCart,
  useCheckoutPreview,
  usePlaceOrder,
  useRestaurantDetail,
  useWallet,
} from '@/lib/queries';
import type { CheckoutPreview } from '@/lib/types';
import { useAuthStore } from '@/stores/auth';
import { useLocationStore } from '@/stores/location';

type Fulfillment = 'delivery' | 'pickup';

export default function CheckoutScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartQuery = useCart();
  const cart = cartQuery.data ?? null;

  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState<number | null>(null);

  const previewMutation = useCheckoutPreview();
  const placeMutation = usePlaceOrder();
  const walletQuery = useWallet();
  const wallet = walletQuery.data;

  const restaurantQuery = useRestaurantDetail(cart?.restaurant?.id ?? 0);
  const restaurant = restaurantQuery.data;

  const canDelivery = restaurant?.delivery_enabled ?? true;
  const canPickup = restaurant?.pickup_enabled ?? true;

  useEffect(() => {
    if (!restaurant) return;
    if (restaurant.delivery_enabled) {
      setFulfillment('delivery');
    } else if (restaurant.pickup_enabled) {
      setFulfillment('pickup');
    }
  }, [restaurant]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) return;
    if (fulfillment === 'delivery' && !location) {
      setPreview(null);
      return;
    }
    previewMutation.mutate({
      order_type: fulfillment,
      ...(fulfillment === 'delivery' && location
        ? { lat: location.lat, long: location.lng }
        : {}),
      ...(appliedPoints != null ? { points: appliedPoints } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillment, location, appliedPoints, cart?.id]);

  useEffect(() => {
    if (previewMutation.isError) {
      setPreview(null);
      setError(
        previewMutation.error instanceof ApiError
          ? previewMutation.error.message
          : null,
      );
    } else if (previewMutation.isSuccess && previewMutation.data?.data) {
      setPreview(previewMutation.data.data);
      setError(null);
    }
  }, [previewMutation.isSuccess, previewMutation.isError, previewMutation.data, previewMutation.error]);

  useEffect(() => {
    const options = preview?.available_payment_options ?? [];
    if (options.length === 0) return;
    if (!paymentId || !options.some((o) => o.id === paymentId)) {
      const cash = options.find((o) => o.required_now.method === 'cash');
      setPaymentId(cash?.id ?? options[0].id);
    }
  }, [preview, paymentId]);

  const financials = useMemo(() => {
    if (preview) return preview.financials;
    return {
      subtotal: cart?.subtotal ?? 0,
      delivery_fee: 0,
      service_fee: 0,
      discount_amount: 0,
      points_redeemed: 0,
      total: cart?.subtotal ?? 0,
    };
  }, [preview, cart]);

  const selectedPayment = preview?.available_payment_options.find(
    (o) => o.id === paymentId,
  );

  const placeLabel = useMemo(() => {
    if (placeMutation.isPending) return t('checkout.placingOrder');
    if (selectedPayment) {
      const online = selectedPayment.required_now.method === 'online';
      const split = selectedPayment.remaining_upon_delivery;
      if (online && split) {
        return t('checkout.payDeposit', {
          amount: selectedPayment.required_now.amount.toFixed(2),
        });
      }
      if (online) {
        return t('checkout.payNow', { total: financials.total.toFixed(2) });
      }
      return t('checkout.placeOrder', { total: financials.total.toFixed(2) });
    }
    return t('checkout.placeOrder', { total: financials.total.toFixed(2) });
  }, [placeMutation.isPending, selectedPayment, financials.total, t]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('checkout.emptyTitle')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.navBar, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
            <DirectionalIcon name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]}>{t('checkout.title')}</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.center}>
          <Ionicons name="bag-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('checkout.emptyTitle')}</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('checkout.emptyDesc')}</Text>
          <Pressable
            onPress={() => router.replace('/restaurants')}
            accessibilityRole="button"
            style={[styles.browseBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.browseBtnText}>{t('checkout.browseRestaurants')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handlePlace = () => {
    setError(null);
    if (fulfillment === 'delivery' && !location) {
      setError(t('checkout.chooseLocationFirst'));
      return;
    }
    if (!paymentId) return;

    placeMutation.mutate(
      {
        order_type: fulfillment,
        payment_option_id: paymentId,
        ...(fulfillment === 'delivery' && location
          ? { lat: location.lat, long: location.lng }
          : {}),
        ...(appliedPoints != null ? { points: appliedPoints } : {}),
      },
      {
        onSuccess: async (env) => {
          const res = env.data;
          if (res.payment_url) {
            await WebBrowser.openBrowserAsync(res.payment_url);
            Alert.alert(t('checkout.orderPlaced'), t('checkout.paymentOpenedDesc'));
          } else {
            Alert.alert(t('checkout.orderPlaced'), t('checkout.orderPlacedDesc'));
          }
          router.replace('/');
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : t('checkout.failed'));
        },
      },
    );
  };

  const handleApplyPoints = () => {
    if (!wallet) return;
    const val = Math.floor(Number(pointsInput));
    if (val > 0 && val <= wallet.balance) {
      setAppliedPoints(val);
      setPointsInput('');
    }
  };

  const handleRemovePoints = () => {
    setAppliedPoints(null);
    setPointsInput('');
  };

  const placeDisabled =
    previewMutation.isPending ||
    placeMutation.isPending ||
    !preview ||
    !!error ||
    (fulfillment === 'delivery' && !location);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <DirectionalIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {t('checkout.title')}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('checkout.subtitle', { restaurant: cart.restaurant.name })}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.fulfillment')}</Text>
          <View style={styles.fulfillmentRow}>
            <Pressable
              onPress={() => setFulfillment('delivery')}
              disabled={!canDelivery}
              accessibilityRole="button"
              style={[
                styles.fulfillmentBtn,
                { borderColor: fulfillment === 'delivery' ? colors.primary : colors.border },
                fulfillment === 'delivery' && { backgroundColor: colors.primary },
                !canDelivery && styles.disabled,
              ]}>
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={fulfillment === 'delivery' ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.fulfillmentText,
                  { color: fulfillment === 'delivery' ? '#FFFFFF' : colors.text },
                ]}>
                {t('checkout.delivery')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFulfillment('pickup')}
              disabled={!canPickup}
              accessibilityRole="button"
              style={[
                styles.fulfillmentBtn,
                { borderColor: fulfillment === 'pickup' ? colors.primary : colors.border },
                fulfillment === 'pickup' && { backgroundColor: colors.primary },
                !canPickup && styles.disabled,
              ]}>
              <Ionicons
                name="bag-handle-outline"
                size={18}
                color={fulfillment === 'pickup' ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.fulfillmentText,
                  { color: fulfillment === 'pickup' ? '#FFFFFF' : colors.text },
                ]}>
                {t('checkout.pickup')}
              </Text>
            </Pressable>
          </View>
        </View>

        {fulfillment === 'delivery' ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.deliveryAddress')}</Text>
            {location ? (
              <>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                  <View style={styles.locationBody}>
                    <Text style={[styles.area, { color: colors.text }]} numberOfLines={1}>
                      {location.area}
                    </Text>
                    <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={2}>
                      {location.address}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => setPickerOpen(true)} accessibilityRole="button" style={styles.textBtn}>
                  <Text style={[styles.textBtnText, { color: colors.primary }]}>{t('checkout.change')}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('checkout.noLocationDesc')}</Text>
                <Pressable
                  onPress={() => setPickerOpen(true)}
                  accessibilityRole="button"
                  style={[styles.chooseBtn, { borderColor: colors.primary }]}>
                  <Ionicons name="map-outline" size={16} color={colors.primary} />
                  <Text style={[styles.chooseBtnText, { color: colors.primary }]}>
                    {t('checkout.chooseLocation')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.pickupFrom')}</Text>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {restaurant?.address || t('checkout.restaurantAddress')}
            </Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.yourOrder')}</Text>
          {cart.items.map((item) => (
            <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemBody}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                  {item.item_name} <Text style={{ color: colors.textSecondary }}>× {item.quantity}</Text>
                </Text>
                {item.notes ? (
                  <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                EGP {(item.unit_price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.financials')}</Text>
          {previewMutation.isPending ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.textSecondary }}>...</Text>
            </View>
          ) : (
            <>
              <SummaryRow label={t('checkout.subtotal')} value={financials.subtotal} colors={colors} />
              {fulfillment === 'delivery' && (
                <SummaryRow label={t('checkout.deliveryFee')} value={financials.delivery_fee} colors={colors} />
              )}
              {financials.service_fee > 0 && (
                <SummaryRow label={t('checkout.serviceFee')} value={financials.service_fee} colors={colors} />
              )}
              {financials.discount_amount > 0 && (
                <SummaryRow label={t('checkout.discount')} value={financials.discount_amount} colors={colors} negative />
              )}
              <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>{t('checkout.total')}</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>EGP {financials.total.toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {wallet && wallet.balance > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('points.redeemTitle')}</Text>
            <Text style={[styles.pointsHint, { color: colors.textSecondary }]}>
              {t('points.availableBalance', { balance: wallet.balance })}
            </Text>
            {preview?.financials.points_redeemed && preview.financials.points_redeemed > 0 ? (
              <View style={styles.pointsAppliedRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.pointsAppliedText, { color: colors.text }]}>
                  {t('points.applied', { points: preview.financials.points_redeemed })}
                </Text>
                <Pressable onPress={handleRemovePoints} hitSlop={8} accessibilityRole="button">
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.pointsInputRow}>
                <TextInput
                  value={pointsInput}
                  onChangeText={setPointsInput}
                  keyboardType="number-pad"
                  placeholder={t('points.inputPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.pointsInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.text },
                  ]}
                />
                <Pressable
                  onPress={handleApplyPoints}
                  accessibilityRole="button"
                  style={[
                    styles.pointsApplyBtn,
                    { backgroundColor: colors.primary },
                    (!pointsInput || (wallet && Number(pointsInput) > wallet.balance)) &&
                      styles.disabledBtn,
                  ]}>
                  <Text style={styles.pointsApplyText}>{t('points.apply')}</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {preview && preview.available_payment_options.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.paymentMethod')}</Text>
            {preview.available_payment_options.map((option) => {
              const selected = option.id === paymentId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setPaymentId(option.id)}
                  accessibilityRole="button"
                  style={[
                    styles.paymentOption,
                    { borderColor: selected ? colors.primary : colors.border },
                    selected && { backgroundColor: colors.muted },
                  ]}>
                  <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.border }]}>
                    {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <View style={styles.paymentBody}>
                    <Text style={[styles.paymentTitle, { color: colors.text }]}>{option.title}</Text>
                    <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {error && (
          <View
            style={[
              styles.errorBox,
              { borderColor: colors.destructive, backgroundColor: `${colors.destructive}14` },
            ]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handlePlace}
          disabled={placeDisabled}
          accessibilityRole="button"
          style={[styles.placeBtn, { backgroundColor: colors.primary }, placeDisabled && styles.placeDisabled]}>
          {placeMutation.isPending || previewMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeText}>{placeLabel}</Text>
          )}
        </Pressable>
      </ScrollView>

      <LocationPicker
        visible={pickerOpen}
        initial={location}
        onConfirm={setLocation}
        onReset={clearLocation}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  colors,
  negative,
}: {
  label: string;
  value: number;
  colors: ColorSchemeColors;
  negative?: boolean;
}) {
  const shown = `${value.toFixed(2)}`;
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>
        {negative ? '-' : ''}EGP {shown}
      </Text>
    </View>
  );
}

type ColorSchemeColors = (typeof Colors)[keyof typeof Colors];

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
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  fulfillmentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fulfillmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  fulfillmentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  locationBody: { flex: 1 },
  area: { fontSize: 14, fontWeight: '800' },
  address: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  hint: { fontSize: 12, lineHeight: 17 },
  chooseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  chooseBtnText: { fontSize: 13, fontWeight: '800' },
  textBtn: { alignSelf: 'flex-start', paddingVertical: Spacing.xs },
  textBtnText: { fontSize: 13, fontWeight: '800' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemBody: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: '700' },
  itemNote: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalValue: { fontSize: 15, fontWeight: '900' },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  radioDot: { width: 8, height: 8, borderRadius: 999 },
  paymentBody: { flex: 1, gap: 2 },
  paymentTitle: { fontSize: 13, fontWeight: '800' },
  paymentDesc: { fontSize: 12, lineHeight: 16 },
  pointsHint: { fontSize: 12, marginBottom: Spacing.md },
  pointsAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pointsAppliedText: { fontSize: 14, fontWeight: '700', flex: 1 },
  pointsInputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  pointsInput: {
    flex: 1,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  pointsApplyBtn: {
    height: 42,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsApplyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  disabledBtn: { opacity: 0.5 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: 13, fontWeight: '600' },
  placeBtn: {
    height: 50,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  placeDisabled: { opacity: 0.5 },
  placeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  browseBtn: {
    marginTop: Spacing.sm,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  browseBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
