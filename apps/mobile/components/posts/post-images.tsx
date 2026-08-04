import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import type { Post } from '@/lib/types';

export function PostImages({
  post,
  onPress,
  aspectRatio = 1,
  showCounter = true,
}: {
  post: Post;
  onPress?: () => void;
  aspectRatio?: number;
  showCounter?: boolean;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const [containerWidth, setContainerWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const images = (post.images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => resolveImageUrl(img.image_url))
    .filter((url): url is string => !!url);

  useEffect(() => {
    setIndex(0);
  }, [post.id]);

  if (images.length === 0) {
    const fallbackHeight = containerWidth > 0 ? containerWidth * 0.56 : 200;
    return (
      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        style={[styles.empty, { backgroundColor: colors.muted, height: fallbackHeight }]}
      >
        <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('post.noImages')}</Text>
      </View>
    );
  }

  const renderHeight = containerWidth > 0 ? containerWidth * 0.56 : 200;

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const page = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
              setIndex(Math.max(0, Math.min(page, images.length - 1)));
            }}
            scrollEventThrottle={16}
          >
            {images.map((url, i) => (
              <Pressable key={url} onPress={onPress} accessibilityRole="button">
                <Image
                  source={url}
                  style={{ width: containerWidth, height: renderHeight, borderRadius: onPress ? Radius.lg : 0 }}
                  contentFit="cover"
                  transition={150}
                />
              </Pressable>
            ))}
          </ScrollView>

          {images.length > 1 && showCounter && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {index + 1}/{images.length}
              </Text>
            </View>
          )}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  counter: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
});