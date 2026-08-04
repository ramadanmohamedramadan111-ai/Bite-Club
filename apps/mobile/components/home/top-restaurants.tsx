import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { RestaurantCard } from '@/components/restaurants/restaurant-card';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useTopRestaurants } from '@/lib/queries';

export function TopRestaurants() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const { data: restaurants = [], isLoading, isError } = useTopRestaurants();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || restaurants.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>{t('restaurants.unavailable')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  list: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
});