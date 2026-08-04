import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { resolveImageUrl } from '@/lib/config';
import type { Restaurant } from '@/lib/types';

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const logo = resolveImageUrl(restaurant.logo_url);
  const cover = resolveImageUrl(restaurant.cover_image_url);

  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.coverWrap, { backgroundColor: colors.muted }]}>
        {cover ? (
          <Image source={cover} style={styles.cover} contentFit="cover" transition={200} />
        ) : logo ? (
          <Image source={logo} style={styles.cover} contentFit="contain" transition={200} />
        ) : (
          <Ionicons name="image-outline" size={36} color={colors.textSecondary} />
        )}
        {!restaurant.is_open_now && (
          <View style={styles.closedOverlay}>
            <Text style={[styles.closedBadge, { color: colors.foreground }]}>
              {t('restaurant.closed')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          {logo && (
            <View style={[styles.logoWrap, { borderColor: colors.border }]}>
              <Image source={logo} style={styles.logo} contentFit="cover" />
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
        </View>

        {restaurant.average_rating > 0 ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.text }]}>
              {restaurant.average_rating.toFixed(1)}
            </Text>
            {restaurant.reviews_count > 0 ? (
              <Text style={[styles.reviews, { color: colors.textSecondary }]}>
                ({restaurant.reviews_count})
              </Text>
            ) : null}
          </View>
        ) : null}

        {restaurant.description ? (
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {restaurant.description}
          </Text>
        ) : null}

        {(restaurant.delivery_enabled || restaurant.pickup_enabled) && (
          <View style={styles.badges}>
            {restaurant.delivery_enabled && (
              <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{t('restaurant.delivery')}</Text>
              </View>
            )}
            {restaurant.pickup_enabled && (
              <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{t('restaurant.pickup')}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverWrap: {
    height: 120,
    overflow: 'hidden',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8EA',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviews: {
    fontSize: 12,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});