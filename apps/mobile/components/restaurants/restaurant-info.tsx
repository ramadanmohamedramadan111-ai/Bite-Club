import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { RestaurantLocationMap } from '@/components/restaurants/restaurant-location-map';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import type { RestaurantDetail } from '@/lib/types';

type Props = {
  restaurant: RestaurantDetail;
};

const DAY_KEYS = ['detail.day0', 'detail.day1', 'detail.day2', 'detail.day3', 'detail.day4', 'detail.day5', 'detail.day6'] as const;

export function RestaurantInfo({ restaurant }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const hours = restaurant.opening_hours ?? [];

  return (
    <View style={styles.list}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('detail.about')}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {restaurant.description || ''}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {!!restaurant.address && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={17} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{restaurant.address}</Text>
          </View>
        )}
        {!!restaurant.phone_number && (
          <View style={styles.row}>
            <Ionicons name="call-outline" size={17} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{restaurant.phone_number}</Text>
          </View>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('detail.openingHours')}</Text>
        {DAY_KEYS.map((key, index) => {
          const day = hours.find((h) => h.day_of_week === index);
          const closed = !day || day.is_closed;
          return (
            <View key={key} style={styles.hoursRow}>
              <Text style={[styles.day, { color: colors.text }]}>{t(key)}</Text>
              <Text style={[styles.hours, { color: closed ? colors.textSecondary : colors.text }]}>
                {closed ? t('detail.closed') : `${day.opens_at} - ${day.closes_at}`}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('map.location')}</Text>
        {!!restaurant.address && (
          <Text style={[styles.body, { color: colors.textSecondary }]}>{restaurant.address}</Text>
        )}
        <RestaurantLocationMap lat={restaurant.latitude} lng={restaurant.longitude} name={restaurant.name} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowText: {
    fontSize: 13,
    flexShrink: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  day: {
    fontSize: 13,
    fontWeight: '600',
  },
  hours: {
    fontSize: 13,
  },
})