import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { resolveImageUrl } from '@/lib/config';
import type { RestaurantDetail } from '@/lib/types';

type Props = {
  restaurant: RestaurantDetail;
};

export function RestaurantDetailHeader({ restaurant }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const cover = resolveImageUrl(restaurant.cover_image_url);
  const logo = resolveImageUrl(restaurant.logo_url);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.coverWrap, { backgroundColor: colors.muted }]}>
        {cover ? (
          <Image source={cover} style={styles.cover} contentFit="cover" transition={200} />
        ) : logo ? (
          <Image source={logo} style={styles.cover} contentFit="contain" />
        ) : (
          <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
        )}
        {!restaurant.is_open_now && (
          <View style={styles.closedOverlay}>
            <Text style={[styles.closedBadge, { color: colors.foreground }]}>{t('detail.closed')}</Text>
          </View>
        )}
      </View>

      <View style={[styles.body, logo ? { paddingTop: 48 } : null]}>
        {logo && (
          <View style={[styles.logoWrap, { borderColor: colors.card }]}>
            <Image source={logo} style={styles.logo} contentFit="cover" />
          </View>
        )}

        <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={[styles.rating, { color: colors.text }]}>{restaurant.average_rating.toFixed(1)}</Text>
          {restaurant.reviews_count > 0 && (
            <Text style={[styles.reviews, { color: colors.textSecondary }]}>
              {t('detail.reviewsCount', { count: restaurant.reviews_count })}
            </Text>
          )}
        </View>

        <View style={styles.meta}>
          {!!restaurant.address && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
          )}
          {restaurant.category_name && (
            <View style={[styles.categoryBadge, { borderColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.text }]}>{restaurant.category_name}</Text>
            </View>
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {restaurant.delivery_enabled && (
            <View style={styles.footerItem}>
              <Ionicons name="bicycle-outline" size={15} color={colors.primary} />
              <Text style={[styles.footerText, { color: colors.text }]}>
                {t('detail.delivery')}:{' '}
                {restaurant.delivery_fee_per_km ? `EGP ${restaurant.delivery_fee_per_km}${t('detail.perKm')}` : t('detail.free')}
              </Text>
            </View>
          )}
          {restaurant.pickup_enabled && (
            <View style={styles.footerItem}>
              <Ionicons name="bag-handle-outline" size={15} color={colors.textSecondary} />
<Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('detail.pickup')}
            </Text>
            </View>
          )}
          {restaurant.minimum_order > 0 && (
            <View style={[styles.footerItem, { marginLeft: 'auto' }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {t('detail.minimumOrder', { amount: restaurant.minimum_order })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverWrap: {
    height: 200,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.xs,
  },
  logoWrap: {
    position: 'absolute',
    top: -28,
    left: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    borderWidth: 3,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#E8E8EA',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviews: {
    fontSize: 13,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 13,
    flexShrink: 1,
  },
  categoryBadge: {
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
});