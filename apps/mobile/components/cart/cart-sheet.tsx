import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { QuantityStepper } from '@/components/cart/quantity-stepper';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useRemoveCartItem, useUpdateCartItemQuantity } from '@/lib/queries';
import type { Cart } from '@/lib/types';

type Props = {
  cart: Cart | null;
  visible: boolean;
  onClose: () => void;
};

const MAX_TRANSLATE = 520;

export function CartSheet({ cart, visible, onClose }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const updateQuantity = useUpdateCartItemQuantity();
  const removeItem = useRemoveCartItem();

  const translateY = useRef(new Animated.Value(MAX_TRANSLATE)).current;

  const adjust = (itemId: number, itemQty: number, delta: number) => {
    const next = itemQty + delta;
    if (next <= 0) {
      removeItem.mutate(itemId);
    } else {
      updateQuantity.mutate({ id: itemId, quantity: next });
    }
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(MAX_TRANSLATE);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            translateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 120 || gesture.vy > 0.8) {
            Animated.timing(translateY, {
              toValue: MAX_TRANSLATE,
              duration: 220,
              useNativeDriver: true,
            }).start(onClose);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
      }),
    [translateY, onClose],
  );

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.card, transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {cart?.restaurant.name ?? t('cart.viewCart')}
          </Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {cart && cart.items.length > 0 ? (
          <>
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {cart.items.map((item) => (
                <View key={item.id} style={[styles.item, { borderBottomColor: colors.border }]}>
                  <View style={styles.itemBody}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                      {item.item_name}
                    </Text>
                    {item.notes ? (
                      <View style={[styles.noteRow, { backgroundColor: colors.muted }]}>
                        <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
                          {item.notes}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                      EGP {(item.unit_price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                  <QuantityStepper
                    small
                    quantity={item.quantity}
                    busy={updateQuantity.isPending || removeItem.isPending}
                    onDecrease={() => adjust(item.id, item.quantity, -1)}
                    onIncrease={() => adjust(item.id, item.quantity, 1)}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <View style={styles.footerTop}>
                <Text style={[styles.subtotalLabel, { color: colors.text }]}>{t('cart.subtotal')}</Text>
                <Text style={[styles.subtotalValue, { color: colors.text }]}>
                  EGP {cart.subtotal.toFixed(2)}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  onClose();
                  router.push('/checkout');
                }}
                accessibilityRole="button"
                style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkoutText}>{t('cart.checkout')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="bag-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('cart.empty')}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '75%',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
    marginRight: Spacing.md,
  },
  body: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 2,
  },
  itemNote: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
    gap: Spacing.md,
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  checkoutBtn: {
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },
});