import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { resolveImageUrl } from '@/lib/config';
import type { MenuItem, MenuSection } from '@/lib/types';

type Props = {
  restaurantId: number;
  menu: MenuSection[];
  isLoading: boolean;
  isError: boolean;
  onCustomize?: (item: MenuItem) => void;
};

export function RestaurantMenu({ restaurantId, menu, isLoading, isError, onCustomize }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return menu;
    return menu
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query)),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, debouncedSearch]);

  const categoryTitles = useMemo(() => filteredCategories.map((c) => c.title), [filteredCategories]);

  useEffect(() => {
    if (categoryTitles.length === 0) {
      setActiveCategory(null);
    } else if (!categoryTitles.includes(activeCategory ?? '')) {
      setActiveCategory(categoryTitles[0]);
    }
  }, [categoryTitles, activeCategory]);

  const activeSection = filteredCategories.find((c) => c.title === activeCategory) ?? filteredCategories[0];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>{t('detail.noMenuItems')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('detail.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catBarContent}>
        {categoryTitles.map((category) => {
          const selected = category === activeCategory;
          return (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[styles.catChip, selected && { backgroundColor: colors.primary }]}>
              <Text style={[styles.catChipText, { color: selected ? colors.primaryForeground : colors.textSecondary }]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {activeSection && activeSection.items.length > 0 ? (
        <View style={styles.items}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{activeSection.title}</Text>
          {activeSection.items.map((item) => {
            const image = resolveImageUrl(item.image_url);
            const canCustomize = item.is_available;
            return (
              <Pressable
                key={item.id}
                onPress={() => canCustomize && onCustomize?.(item)}
                disabled={!canCustomize}
                accessibilityRole="button"
                style={[
                  styles.itemRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  !item.is_available && styles.itemUnavailable,
                ]}>
                <View style={styles.itemBody}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.itemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={styles.priceRow}>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      EGP {item.price.toFixed(2)}
                    </Text>
                    {canCustomize && (
                      <View style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </View>
                {image && (
                  <View style={[styles.itemImageWrap, { backgroundColor: colors.muted }]}>
                    <Image source={image} style={styles.itemImage} contentFit="cover" transition={200} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.center}>
          <Ionicons name="restaurant-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('detail.noMenuItems')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.md,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  catBarContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 42,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  items: {
    gap: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  itemUnavailable: {
    opacity: 0.5,
  },
  itemBody: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: 6,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: '#D94F2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImageWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
  },
});