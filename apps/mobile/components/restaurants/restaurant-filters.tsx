import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';

export type RestaurantFilterValues = {
  categories: string[];
  minRating: number;
  delivery: boolean;
  pickup: boolean;
  availableOnly: boolean;
};

type Props = {
  visible: boolean;
  categories: string[];
  value: RestaurantFilterValues;
  onApply: (value: RestaurantFilterValues) => void;
  onClose: () => void;
};

export function RestaurantFilters({ visible, categories, value, onApply, onClose }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const [draft, setDraft] = useState<RestaurantFilterValues>(value);

  const toggleCategory = (name: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter((c) => c !== name)
        : [...prev.categories, name],
    }));
  };

  const clear = () => {
    setDraft({ categories: [], minRating: 0, delivery: false, pickup: false, availableOnly: false });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setDraft(value)}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <SafeAreaView
          edges={['bottom']}
          style={[styles.sheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('restaurants.filters')}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('restaurants.sort')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}>
              <Pressable
                onPress={() =>
                  setDraft((prev) => ({ ...prev, categories: [] }))
                }
                style={[
                  styles.chip,
                  draft.categories.length === 0 && { backgroundColor: colors.primary },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: draft.categories.length === 0 ? colors.primaryForeground : colors.textSecondary,
                    },
                  ]}>
                  {t('restaurants.all')}
                </Text>
              </Pressable>
              {categories.map((category) => {
                const selected = draft.categories.includes(category);
                return (
                  <Pressable
                    key={category}
                    onPress={() => toggleCategory(category)}
                    style={[styles.chip, selected && { backgroundColor: colors.primary }]}>
                    <Text
                      style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.textSecondary }]}>
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('restaurants.minRating')}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((rating) => {
                const active = draft.minRating >= rating;
                return (
                  <Pressable
                    key={rating}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        minRating: prev.minRating === rating ? 0 : rating,
                      }))
                    }
                    hitSlop={6}
                    accessibilityRole="button">
                    <Ionicons
                      name={active ? 'star' : 'star-outline'}
                      size={34}
                      color={active ? '#F59E0B' : colors.border}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('restaurants.deliveryPickup')}</Text>
            <View style={styles.toggles}>
              <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('restaurant.delivery')}</Text>
                <Switch
                  value={draft.delivery}
                  onValueChange={(delivery) => setDraft((prev) => ({ ...prev, delivery }))}
                  trackColor={{ true: colors.success, false: colors.border }}
                />
              </View>
              <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('restaurant.pickup')}</Text>
                <Switch
                  value={draft.pickup}
                  onValueChange={(pickup) => setDraft((prev) => ({ ...prev, pickup }))}
                  trackColor={{ true: colors.success, false: colors.border }}
                />
              </View>
              <View style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('restaurants.availableOnly')}</Text>
                <Switch
                  value={draft.availableOnly}
                  onValueChange={(availableOnly) => setDraft((prev) => ({ ...prev, availableOnly }))}
                  trackColor={{ true: colors.success, false: colors.border }}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button variant="outline" size="sm" onPress={clear} style={styles.footerBtn}>
              {t('restaurants.clear')}
            </Button>
            <Button onPress={() => { onApply(draft); onClose(); }} style={styles.footerBtn}>
              {t('restaurants.apply')}
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderTopWidth: 1,
    maxHeight: '80%',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
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
  },
  body: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chips: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stars: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggles: {
    gap: Spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E4E7',
  },
  footerBtn: {
    flex: 1,
  },
});