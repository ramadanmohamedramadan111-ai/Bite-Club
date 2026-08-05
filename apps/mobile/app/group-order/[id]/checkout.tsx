import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { Button } from '@/components/ui/button';
import { DirectionalIcon } from '@/components/ui/directional-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ApiError } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import {
  useGroupOrderSession,
  useCheckoutGroupPreviewDelivery,
  useCheckoutGroupPreviewPickup,
  useCheckoutGroupPay,
} from '@/lib/queries';
import type { GroupOrderCartSession, CheckoutPreviewResponse } from '@/lib/types';
import { useLocationStore } from '@/stores/location';

type FulfillmentType = 'delivery' | 'pickup';
type PaymentMethod = 'full_online' | 'full_cash' | 'split_payment';

export default function GroupOrderCheckoutScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const { id: idParam } = useLocalSearchParams();
  const sessionId = Number(idParam);

  const { data: sessionCart, isLoading: isLoadingSession, error: sessionError } = useGroupOrderSession(sessionId);

  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const clearLocation = useLocationStore((s) => s.clearLocation);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('full_cash');
  const [error, setError] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreviewResponse | null>(null);

  const previewDeliveryMutation = useCheckoutGroupPreviewDelivery(sessionId);
  const previewPickupMutation = useCheckoutGroupPreviewPickup(sessionId);
  const payMutation = useCheckoutGroupPay(sessionId);

  const totalItems = useMemo(() => {
    if (!sessionCart) return 0;
    return sessionCart.members_summary.reduce((sum, m) => sum + m.items.length, 0);
  }, [sessionCart]);

  // Load preview data
  useEffect(() => {
    if (!sessionCart || totalItems === 0) return;

    setError(null);
    if (fulfillmentType === 'delivery') {
      if (location) {
        previewDeliveryMutation.mutate(
          { lat: Number(location.lat), long: Number(location.lng) },
          {
            onSuccess: (res) => {
              if (res) {
                setCheckoutPreview(res);
              } else {
                setCheckoutPreview(null);
                setError(t('checkout.selectAddressToPreview'));
              }
            },
            onError: (err) => {
              setCheckoutPreview(null);
              setError(err.message || 'Outside delivery zone');
            },
          }
        );
      } else {
        setCheckoutPreview(null);
      }
    } else {
      previewPickupMutation.mutate(undefined, {
        onSuccess: (res) => {
          if (res) {
            setCheckoutPreview(res);
          } else {
            setCheckoutPreview(null);
          }
        },
        onError: (err) => {
          setCheckoutPreview(null);
          setError(err.message);
        },
      });
    }
  }, [fulfillmentType, location, sessionId, totalItems]);

  const summary = useMemo(() => {
    if (checkoutPreview) {
      return {
        subtotal: checkoutPreview.financials.subtotal,
        deliveryFee: checkoutPreview.financials.delivery_fee,
        serviceFee: checkoutPreview.financials.service_fee,
        discountAmount: checkoutPreview.financials.discount_amount,
        pointsRedeemed: checkoutPreview.financials.points_redeemed,
        total: checkoutPreview.financials.total,
        requiresDeposit: checkoutPreview.deposit_rules.requires_deposit,
        depositAmount: checkoutPreview.deposit_rules.deposit_amount,
        remainingAmount: checkoutPreview.deposit_rules.remaining_amount,
      };
    }
    return {
      subtotal: sessionCart?.total_amount ?? 0,
      deliveryFee: 0,
      serviceFee: 0,
      discountAmount: 0,
      pointsRedeemed: 0,
      total: sessionCart?.total_amount ?? 0,
      requiresDeposit: false,
      depositAmount: 0,
      remainingAmount: 0,
    };
  }, [checkoutPreview, sessionCart?.total_amount]);

  // Adjust payment options based on deposit rules
  useEffect(() => {
    if (summary.requiresDeposit && paymentMethod === 'full_cash') {
      setPaymentMethod('split_payment');
    } else if (!summary.requiresDeposit && paymentMethod === 'split_payment') {
      setPaymentMethod('full_cash');
    }
  }, [summary.requiresDeposit, paymentMethod]);

  const isPreviewing = previewDeliveryMutation.isPending || previewPickupMutation.isPending;

  const handlePlaceOrder = () => {
    setError(null);
    if (fulfillmentType === 'delivery' && !location) {
      setError(t('checkout.noAddressForDelivery'));
      return;
    }

    payMutation.mutate(
      {
        payment_option_id: paymentMethod,
        order_type: fulfillmentType,
        lat: fulfillmentType === 'delivery' && location ? Number(location.lat) : undefined,
        long: fulfillmentType === 'delivery' && location ? Number(location.lng) : undefined,
        notes: orderNotes || undefined,
      },
      {
        onSuccess: async (res) => {
          if (res) {
            Alert.alert(t('checkout.orderPlaced'));
            if (res.payment_url) {
              await WebBrowser.openBrowserAsync(res.payment_url);
            }
            router.replace(`/group-order/${sessionId}/details`);
          } else {
            setError('Failed to place order');
          }
        },
        onError: (err) => {
          setError(err.message || 'Failed to place order');
        },
      }
    );
  };

  const getMemberTotal = (member: GroupOrderCartSession['members_summary'][number]) => {
    return member.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  if (isLoadingSession) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (sessionError || !sessionCart) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.text }]}>{t('groups.groupOrderNotFound')}</Text>
        <Button variant="outline" onPress={() => router.back()} style={styles.backBtn}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  if (totalItems === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>{t('checkout.yourCartIsEmpty')}</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
            {t('checkout.emptyCartDesc')}
          </Text>
          <Button variant="outline" onPress={() => router.back()} style={styles.backBtn}>
            {t('common.back')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const disabledCondition = isPreviewing || payMutation.isPending || !checkoutPreview || !!error;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
          <DirectionalIcon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t('checkout.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('checkout.subtitle', { restaurant: sessionCart.restaurant.name })}
        </Text>

        {/* Fulfillment options */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.deliveryOptions')}</Text>
          <View style={styles.fulfillmentRow}>
            <Pressable
              onPress={() => setFulfillmentType('pickup')}
              style={[
                styles.fulfillmentBtn,
                { borderColor: fulfillmentType === 'pickup' ? colors.primary : colors.border },
                fulfillmentType === 'pickup' && { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons
                name="bag-handle-outline"
                size={18}
                color={fulfillmentType === 'pickup' ? '#FFFFFF' : colors.text}
              />
              <Text style={[styles.fulfillmentText, { color: fulfillmentType === 'pickup' ? '#FFFFFF' : colors.text }]}>
                {t('checkout.pickup')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFulfillmentType('delivery')}
              style={[
                styles.fulfillmentBtn,
                { borderColor: fulfillmentType === 'delivery' ? colors.primary : colors.border },
                fulfillmentType === 'delivery' && { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={fulfillmentType === 'delivery' ? '#FFFFFF' : colors.text}
              />
              <Text style={[styles.fulfillmentText, { color: fulfillmentType === 'delivery' ? '#FFFFFF' : colors.text }]}>
                {t('checkout.delivery')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Address Selection */}
        {fulfillmentType === 'delivery' ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.pickupLocation')}</Text>
            {location ? (
              <View style={styles.locationBlock}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                  <Text style={[styles.locationAreaText, { color: colors.text }]}>{location.area}</Text>
                </View>
                <Text style={[styles.locationAddressText, { color: colors.textSecondary }]}>
                  {location.address}
                </Text>
                <Pressable onPress={() => setPickerOpen(true)} style={styles.changeBtn}>
                  <Text style={[styles.changeBtnText, { color: colors.primary }]}>{t('checkout.pickup')}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.noLocationBlock}>
                <Text style={[styles.noLocationText, { color: colors.textSecondary }]}>
                  Please choose a delivery address
                </Text>
                <Button variant="outline" onPress={() => setPickerOpen(true)} style={styles.chooseLocationBtn}>
                  <Ionicons name="map-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Choose Location</Text>
                </Button>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.pickupLocation')}</Text>
            <Text style={[styles.pickupLabel, { color: colors.textSecondary }]}>{t('checkout.pickupFrom')}</Text>
            <Text style={[styles.pickupVal, { color: colors.text }]}>{sessionCart.restaurant.name}</Text>
          </View>
        )}

        {/* Order Notes */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.orderNotes')}</Text>
          <TextInput
            placeholder={t('checkout.orderNotesPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
            style={[styles.textAreaInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.muted }]}
          />
        </View>

        {/* Order summary breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.groupOrderSummary')}</Text>
          {sessionCart.members_summary.map((member) => {
            const memberTotal = getMemberTotal(member);
            return (
              <View key={member.user.id} style={[styles.memberSummaryItem, { borderBottomColor: colors.border }]}>
                <View style={styles.memberHeaderRow}>
                  <Text style={[styles.memberSummaryName, { color: colors.text }]}>{member.user.name}</Text>
                  <Text style={[styles.memberSummaryTotal, { color: colors.textSecondary }]}>
                    EGP {memberTotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.memberItemsBreakdown}>
                  {member.items.map((cartItem) => (
                    <View key={cartItem.id} style={styles.breakdownItemRow}>
                      <Text style={[styles.breakdownText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {cartItem.quantity}x {cartItem.item.title}
                      </Text>
                      <Text style={[styles.breakdownVal, { color: colors.textSecondary }]}>
                        EGP {cartItem.total_price.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Payment Methods */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.paymentMethod')}</Text>

          {/* Full Cash Payment */}
          {!summary.requiresDeposit && (
            <Pressable
              onPress={() => setPaymentMethod('full_cash')}
              style={[
                styles.paymentOption,
                { borderColor: paymentMethod === 'full_cash' ? colors.primary : colors.border },
                paymentMethod === 'full_cash' && { backgroundColor: colors.primary + '05' },
              ]}
            >
              <View style={[styles.radioOutline, { borderColor: paymentMethod === 'full_cash' ? colors.primary : colors.border }]}>
                {paymentMethod === 'full_cash' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentTextCol}>
                <Text style={[styles.paymentMethodTitle, { color: colors.text }]}>
                  {t('checkout.fullCashOnDelivery')}
                </Text>
                <Text style={[styles.paymentMethodDesc, { color: colors.textSecondary }]}>
                  {t('checkout.fullCashDesc')}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Full Online Payment */}
          <Pressable
            onPress={() => setPaymentMethod('full_online')}
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'full_online' ? colors.primary : colors.border },
              paymentMethod === 'full_online' && { backgroundColor: colors.primary + '05' },
            ]}
          >
            <View style={[styles.radioOutline, { borderColor: paymentMethod === 'full_online' ? colors.primary : colors.border }]}>
              {paymentMethod === 'full_online' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
            </View>
            <View style={styles.paymentTextCol}>
              <Text style={[styles.paymentMethodTitle, { color: colors.text }]}>
                {t('checkout.payFullOnline')}
              </Text>
              <Text style={[styles.paymentMethodDesc, { color: colors.textSecondary }]}>
                Pay the full amount online now.
              </Text>
            </View>
          </Pressable>

          {/* Split Payment */}
          {summary.requiresDeposit && (
            <Pressable
              onPress={() => setPaymentMethod('split_payment')}
              style={[
                styles.paymentOption,
                { borderColor: paymentMethod === 'split_payment' ? colors.primary : colors.border },
                paymentMethod === 'split_payment' && { backgroundColor: colors.primary + '05' },
              ]}
            >
              <View style={[styles.radioOutline, { borderColor: paymentMethod === 'split_payment' ? colors.primary : colors.border }]}>
                {paymentMethod === 'split_payment' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentTextCol}>
                <Text style={[styles.paymentMethodTitle, { color: colors.text }]}>
                  {t('checkout.splitPayment')}
                </Text>
                <Text style={[styles.paymentMethodDesc, { color: colors.textSecondary }]}>
                  Pay deposit online (EGP {summary.depositAmount.toFixed(2)}) and remaining cash upon delivery.
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Totals Summary */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('checkout.groupOrderSummary')}</Text>

          {isPreviewing ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.md }} />
          ) : (
            <View style={styles.totalsList}>
              <View style={styles.totalSummaryRow}>
                <Text style={[styles.totalSummaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.totalSummaryVal, { color: colors.text }]}>
                  EGP {summary.subtotal.toFixed(2)}
                </Text>
              </View>

              {fulfillmentType === 'delivery' && (
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.totalSummaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
                  <Text style={[styles.totalSummaryVal, { color: colors.text }]}>
                    EGP {summary.deliveryFee.toFixed(2)}
                  </Text>
                </View>
              )}

              {summary.serviceFee > 0 && (
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.totalSummaryLabel, { color: colors.textSecondary }]}>Service Fee</Text>
                  <Text style={[styles.totalSummaryVal, { color: colors.text }]}>
                    EGP {summary.serviceFee.toFixed(2)}
                  </Text>
                </View>
              )}

              {summary.discountAmount > 0 && (
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.totalSummaryLabel, { color: colors.textSecondary }]}>Discount</Text>
                  <Text style={[styles.totalSummaryVal, { color: colors.success }]}>
                    -EGP {summary.discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.grandTotalDivider, { borderTopColor: colors.border }]} />

              {summary.requiresDeposit ? (
                <View style={styles.depositRowBlock}>
                  <View style={styles.totalSummaryRow}>
                    <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Required Deposit</Text>
                    <Text style={[styles.grandTotalVal, { color: colors.primary }]}>
                      EGP {summary.depositAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalSummaryRow}>
                    <Text style={[styles.totalSummaryLabel, { color: colors.textSecondary }]}>Remaining cash on delivery</Text>
                    <Text style={[styles.totalSummaryVal, { color: colors.textSecondary }]}>
                      EGP {summary.remainingAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.totalSummaryRow}>
                  <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.grandTotalVal, { color: colors.primary }]}>
                    EGP {summary.total.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {error && (
          <View style={[styles.errorBox, { borderColor: colors.destructive, backgroundColor: colors.destructive + '10' }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <Button
          variant="default"
          loading={payMutation.isPending}
          disabled={disabledCondition}
          onPress={handlePlaceOrder}
          style={styles.payBtn}
        >
          {paymentMethod === 'split_payment'
            ? `Pay Deposit · EGP ${summary.depositAmount.toFixed(2)}`
            : `Pay Now · EGP ${summary.total.toFixed(2)}`}
        </Button>
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

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backBtnWrapper: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
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
    gap: Spacing.md,
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
  locationBlock: {
    gap: Spacing.xs,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationAreaText: {
    fontSize: 14,
    fontWeight: '800',
  },
  locationAddressText: {
    fontSize: 12,
    lineHeight: 16,
  },
  changeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  noLocationBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noLocationText: {
    fontSize: 13,
  },
  chooseLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupLabel: {
    fontSize: 12,
  },
  pickupVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    height: 76,
    textAlignVertical: 'top',
    fontSize: 13,
  },

  // Member summaries in checkout
  memberSummaryItem: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberSummaryName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberSummaryTotal: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberItemsBreakdown: {
    paddingLeft: Spacing.sm,
    gap: 4,
  },
  breakdownItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownText: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  breakdownVal: {
    fontSize: 12,
  },

  // Payment Option selection style
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  radioOutline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentTextCol: {
    flex: 1,
    gap: 2,
  },
  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentMethodDesc: {
    fontSize: 11,
    lineHeight: 15,
  },

  // Totals Breakdown styles
  totalsList: {
    gap: Spacing.sm,
  },
  totalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSummaryLabel: {
    fontSize: 13,
  },
  totalSummaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  grandTotalDivider: {
    borderTopWidth: 1,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  depositRowBlock: {
    gap: Spacing.xs,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  payBtn: {
    marginTop: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  backBtn: {
    marginTop: Spacing.xl,
    minWidth: 120,
  },
});
