import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { CartSheet } from '@/components/cart/cart-sheet';
import { RestaurantCard } from '@/components/restaurants/restaurant-card';
import { RestaurantFilters, type RestaurantFilterValues } from '@/components/restaurants/restaurant-filters';
import { LocationAlert } from '@/components/location/location-alert';
import { Segmented } from '@/components/ui/segmented';
import { DirectionalIcon } from '@/components/ui/directional-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useCart, useRestaurantCategories, useRestaurants } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';

const PER_PAGE = 8;
const EMPTY_FILTERS: RestaurantFilterValues = {
  categories: [],
  minRating: 0,
  delivery: false,
  pickup: false,
  availableOnly: false,
};

export default function RestaurantsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { t } = useI18n();

  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'rating' | 'name'>('rating');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RestaurantFilterValues>(() => ({
    ...EMPTY_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  }));

  useEffect(() => {
    if (initialCategory) {
      setFilters((prev) => ({
        ...prev,
        categories: [initialCategory],
      }));
    }
  }, [initialCategory]);

  const [showFilters, setShowFilters] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartQuery = useCart();
  const cartCount = (cartQuery.data?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

  const { data: categoryItems = [] } = useRestaurantCategories();
  const categories = categoryItems.map((c) => c.name);

  const { data, isLoading, isError } = useRestaurants({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch || undefined,
    category: filters.categories[0],
    minRating: filters.minRating,
    delivery: filters.delivery || undefined,
    pickup: filters.pickup || undefined,
    availableOnly: filters.availableOnly || undefined,
    sort,
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  const restaurants = data?.items ?? [];
  const currentPage = data?.currentPage ?? 1;
  const lastPage = data?.lastPage ?? 1;
  const total = data?.total ?? 0;

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minRating > 0 ||
    filters.delivery ||
    filters.pickup ||
    filters.availableOnly;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <DirectionalIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('restaurants.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('restaurants.subtitle')}</Text>
        </View>
        <CartButton count={cartCount} onPress={() => setCartOpen(true)} />
      </View>

      <View style={styles.toolbar}>
        <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('restaurants.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
          />
          {search !== '' && (
            <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityRole="button">
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <Segmented
          value={sort}
          onChange={setSort}
          options={[
            { value: 'rating', label: t('restaurants.rating') },
            { value: 'name', label: t('restaurants.alphabetical') },
          ]}
        />

        <Pressable
          onPress={() => setShowFilters(true)}
          style={[
            styles.filterButton,
            { backgroundColor: colors.muted, borderColor: colors.border },
            hasActiveFilters && { borderColor: colors.primary },
          ]}
          accessibilityRole="button">
          <Ionicons name="options-outline" size={16} color={colors.primary} />
          <Text style={[styles.filterButtonText, { color: colors.primary }]}>{t('restaurants.filters')}</Text>
          {hasActiveFilters && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
        </Pressable>
      </View>

      {total > 0 && (
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {total} {t('restaurants.results')}
        </Text>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('restaurants.noResults')}</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('restaurants.adjustFilters')}</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => <LocationAlert style={{ marginHorizontal: 0 }} />}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="restaurant-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('restaurants.noResults')}</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('restaurants.adjustFilters')}</Text>
            </View>
          }
          ListFooterComponent={
            lastPage > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  accessibilityRole="button"
                  style={[
                    styles.pageButton,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                    currentPage <= 1 && styles.pageButtonDisabled,
                  ]}>
                  <DirectionalIcon name="chevron-back" size={16} color={colors.text} />
                  <Text style={[styles.pageButtonText, { color: colors.text }]}>{t('restaurants.prev')}</Text>
                </Pressable>
                <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
                  {t('restaurants.page')} {currentPage} {t('restaurants.of')} {lastPage}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  accessibilityRole="button"
                  style={[
                    styles.pageButton,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                    currentPage >= lastPage && styles.pageButtonDisabled,
                  ]}>
                  <Text style={[styles.pageButtonText, { color: colors.text }]}>{t('restaurants.next')}</Text>
                  <DirectionalIcon name="chevron-forward" size={16} color={colors.text} />
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      <RestaurantFilters
        visible={showFilters}
        categories={categories}
        value={filters}
        onApply={setFilters}
        onClose={() => setShowFilters(false)}
      />

      <CartSheet cart={cartQuery.data ?? null} visible={cartOpen} onClose={() => setCartOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  toolbar: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
activeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  resultCount: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    fontSize: 13,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
    flexGrow: 1,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
});
