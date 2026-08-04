import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/posts/post-card';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useCart, useCopyPostOrder, usePosts } from '@/lib/queries';
import type { Post } from '@/lib/types';

const PER_PAGE = 10;

export default function FeedScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const postsQuery = usePosts(page, PER_PAGE);
  const cartQuery = useCart();
  const copyMutation = useCopyPostOrder();

  const posts = postsQuery.data?.items ?? [];
  const lastPage = postsQuery.data?.meta.last_page ?? 1;

  function doCopy(post: Post) {
    copyMutation.mutate(post.id, {
      onSuccess: () => {
        Alert.alert(t('post.copySuccess'));
        router.push('/checkout');
      },
      onError: () => Alert.alert(t('post.copyFailed')),
    });
  }

  function handleCopy(post: Post) {
    const cart = cartQuery.data;
    if (cart && cart.restaurant.id !== post.restaurant.id) {
      Alert.alert(
        t('post.cartDiffersTitle'),
        t('post.cartDiffersDesc', {
          current: cart.restaurant.name,
          new: post.restaurant.name,
        }),
        [
          { text: t('post.keepCart'), style: 'cancel' },
          { text: t('post.replaceCart'), onPress: () => doCopy(post) },
        ],
      );
      return;
    }
    doCopy(post);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{t('feed.socialFeed')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('feed.socialFeedDesc')}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/posts/create')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}>
          <Ionicons name="add" size={18} color={colors.primaryForeground} />
          <Text style={[styles.createText, { color: colors.primaryForeground }]}>
            {t('feed.createPost')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'posts', label: t('feed.postsFeed') },
            { value: 'leaderboard', label: t('feed.leaderboard') },
          ]}
          value="posts"
          onChange={(value) => {
            if (value === 'leaderboard') router.push('/posts/leaderboard');
          }}
        />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {postsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="newspaper-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('feed.noPosts')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('feed.noPostsDesc')}
            </Text>
            <Pressable
              onPress={() => router.push('/posts/create')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.browseText, { color: colors.primary }]}>
                {t('feed.createPost')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/posts/${post.id}`)}
                onCopyOrder={handleCopy}
              />
            ))}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || postsQuery.isLoading}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page <= 1 && styles.disabled,
              ]}>
              <Ionicons name="chevron-back" size={16} color={colors.text} />
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.prev')}</Text>
            </Pressable>
            <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
              {t('restaurants.page')} {page} {t('restaurants.of')} {lastPage}
            </Text>
            <Pressable
              onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage || postsQuery.isLoading}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page >= lastPage && styles.disabled,
              ]}>
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.next')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
        )}

        {posts.length > 0 && page >= lastPage && (
          <Text style={[styles.endText, { color: colors.textSecondary }]}>
            {t('feed.reachedEnd')}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  createText: {
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.lg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  browseBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  browseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pageText: { fontSize: 13, fontWeight: '700' },
  pageIndicator: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  endText: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: Spacing.md,
  },
});
