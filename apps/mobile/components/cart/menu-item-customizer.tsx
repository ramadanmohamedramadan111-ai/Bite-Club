import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { QuantityStepper } from '@/components/cart/quantity-stepper';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import { useAddCartItem, useCart, useUpdateCartItemQuantity } from '@/lib/queries';
import type { MenuItem } from '@/lib/types';

type Props = {
  item: MenuItem | null;
  restaurantId: number;
  restaurantName: string;
  visible: boolean;
  onClose: () => void;
};

const MAX_TRANSLATE = 620;

export function MenuItemCustomizer({ item, restaurantId, restaurantName, visible, onClose }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const cartQuery = useCart();
  const addCartItem = useAddCartItem();
  const updateQuantity = useUpdateCartItemQuantity();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const translateY = useRef(new Animated.Value(MAX_TRANSLATE)).current;

  const existing = item
    ? cartQuery.data?.items.find((i) => i.item_id === item.id)
    : undefined;

  const total = useMemo(
    () => (item ? item.price * quantity : 0),
    [item, quantity],
  );

  useEffect(() => {
    if (visible && item) {
      const inCart = cartQuery.data?.items.find((i) => i.item_id === item.id);
      setQuantity(inCart?.quantity ?? 1);
      setNotes('');
      translateY.setValue(MAX_TRANSLATE);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, item, translateY, cartQuery.data]);

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

  if (!visible || !item) return null;

  const image = resolveImageUrl(item.image_url);
  const busy = addCartItem.isPending || updateQuantity.isPending;

  const handleAdd = () => {
    const trimmedNotes = notes.trim() || undefined;
    if (existing) {
      updateQuantity.mutate(
        { id: existing.id, quantity },
        { onSuccess: () => onClose() },
      );
    } else {
      addCartItem.mutate(
        {
          restaurant_id: restaurantId,
          restaurant_name: restaurantName,
          item_id: item.id,
          item_name: item.title,
          unit_price: item.price,
          quantity,
          notes: trimmedNotes,
        },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} />
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.card, transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {image && (
            <View style={[styles.imageWrap, { backgroundColor: colors.muted }]}>
              <Image source={image} style={styles.image} contentFit="cover" transition={200} />
            </View>
          )}

          <View style={styles.headRow}>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              {item.description ? (
                <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={[styles.price, { color: colors.primary }]}>EGP {item.price.toFixed(2)}</Text>

          <View style={[styles.quantityRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.quantityLabel, { color: colors.text }]}>{t('detail.quantity')}</Text>
            <QuantityStepper
              quantity={quantity}
              busy={busy}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrease={() => setQuantity((q) => q + 1)}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('detail.specialInstructions')}</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            editable={!busy}
            multiline
            placeholder={t('detail.specialInstructionsPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          />

          <Pressable
            onPress={handleAdd}
            disabled={busy || !item.is_available}
            accessibilityRole="button"
            style={[
              styles.addBtn,
              { backgroundColor: colors.primary },
              (!item.is_available || busy) && styles.addBtnDisabled,
            ]}>
            {busy ? (
              <Text style={styles.addBtnText}>{'...'}</Text>
            ) : (
              <Text style={styles.addBtnText}>
                {existing
                  ? t('detail.updateCart', { total: total.toFixed(2) })
                  : t('detail.addToCart', { total: total.toFixed(2) })}
              </Text>
            )}
          </Pressable>
        </ScrollView>
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
    maxHeight: '85%',
    paddingTop: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  imageWrap: {
    height: 170,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  input: {
    minHeight: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  addBtn: {
    marginTop: Spacing.xs,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
