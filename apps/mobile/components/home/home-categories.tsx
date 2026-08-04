import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useHomeCategories } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';

export function HomeCategories() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const { data: categories = [], isLoading, isError } = useHomeCategories();

  if (isLoading) {
    return (
      <View style={[styles.center, styles.height]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || categories.length === 0) {
    return (
      <View style={[styles.center, styles.height]}>
        <Text style={{ color: colors.textSecondary }}>{t('categories.unavailable')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={[styles.list, styles.listHeight]}>
      {categories.map((category) => {
        const image = resolveImageUrl(category.image_url);
        return (
          <Pressable
            key={category.id}
            onPress={() => router.push(`/restaurants?category=${encodeURIComponent(category.name)}`)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}
            accessibilityRole="button"
          >
            <View style={[styles.circle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              {image ? (
                <Image source={image} style={styles.circleImage} contentFit="cover" transition={150} />
              ) : (
                <Ionicons name="restaurant-outline" size={26} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xs,
  },
  listHeight: {
    minHeight: 96,
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  height: {
    height: 100,
  },
  item: {},
  circle: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    marginTop: Spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 76,
    textAlign: 'center',
  },
});