import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostImages } from '@/components/posts/post-images';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import { useCart, useCopyPostOrder, useLikePost, usePostDetail, useUnlikePost } from '@/lib/queries';

function Header({ onBack, title, right }: { onBack: () => void; title: string; right?: React.ReactNode }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const id = Number(postId);
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const postQuery = usePostDetail(id);
  const cartQuery = useCart();
  const copyMutation = useCopyPostOrder();
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const post = postQuery.data;

  useEffect(() => {
    setIsLiked(post?.is_liked_by_user ?? false);
    setLikeCount(post?.likes_count ?? 0);
  }, [post?.id, post?.is_liked_by_user, post?.likes_count]);

  function toggleLike() {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    const onError = () => {
      setIsLiked(!next);
      setLikeCount((c) => c - (next ? 1 : -1));
    };
    if (next) {
      likeMutation.mutate(id, { onError });
    } else {
      unlikeMutation.mutate(id, { onError });
    }
  }

  function doCopy() {
    copyMutation.mutate(id, {
      onSuccess: () => {
        Alert.alert(t('post.copySuccess'));
        router.push('/checkout');
      },
      onError: () => Alert.alert(t('post.copyFailed')),
    });
  }

  function handleCopy() {
    const cart = cartQuery.data;
    if (cart && post && cart.restaurant.id !== post.restaurant.id) {
      Alert.alert(
        t('post.cartDiffersTitle'),
        t('post.cartDiffersDesc', {
          current: cart.restaurant.name,
          new: post.restaurant.name,
        }),
        [
          { text: t('post.keepCart'), style: 'cancel' },
          { text: t('post.replaceCart'), onPress: doCopy },
        ],
      );
      return;
    }
    doCopy();
  }

  if (postQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Header onBack={() => router.back()} title={t('post.review', { username: '' })} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Header onBack={() => router.back()} title={t('feed.socialFeed')} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('post.loadFailed')}</Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.backBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}>
            <Text style={[styles.backText, { color: colors.primaryForeground }]}>{t('common.back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = post.status === 'pending';
  const authorAvatar = resolveImageUrl(post.user.profile_image_url);
  const authorInitial = post.user.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        onBack={() => router.back()}
        title={t('post.review', { username: post.user.name ?? '' })}
        right={
          <View style={styles.likeBtnRow}>
            <Text style={[styles.likeCount, { color: colors.textSecondary }]}>{likeCount}</Text>
            <Pressable
              onPress={toggleLike}
              accessibilityRole="button"
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? colors.destructive : colors.text} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <PostImages post={post} showCounter />

        <View style={[styles.body, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {isPending && (
            <View style={[styles.pendingBadge, { backgroundColor: colors.muted }]}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.pendingText, { color: colors.textSecondary }]}>{t('post.pending')}</Text>
            </View>
          )}

          <View style={styles.author}>
            {authorAvatar ? (
              <View style={[styles.avatarWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <Image source={authorAvatar} style={styles.avatar} contentFit="cover" transition={150} />
              </View>
            ) : (
              <View style={[styles.avatarWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                <Text style={[styles.avatarInitials, { color: colors.primary }]}>{authorInitial}</Text>
              </View>
            )}
            <View style={styles.authorText}>
              <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>{post.user.name}</Text>
              <Text style={[styles.authorUsername, { color: colors.textSecondary }]} numberOfLines={1}>
                @{post.user.username}
              </Text>
            </View>
          </View>

          {post.caption ? (
            <Text style={[styles.caption, { color: colors.text }]}>{post.caption}</Text>
          ) : null}

          <View style={[styles.restaurant, { backgroundColor: colors.muted }]}>
            <Text style={[styles.restaurantLabel, { color: colors.textSecondary }]}>{t('feed.from')}</Text>
            <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
              {post.restaurant.name}
            </Text>
          </View>

          {post.order?.items && post.order.items.length > 0 && (
            <View style={styles.items}>
              <Text style={[styles.itemsTitle, { color: colors.text }]}>{t('post.orderSummary')}</Text>
              {post.order.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.item_name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {item.quantity}x {item.price} EGP
                  </Text>
                </View>
              ))}
              <View style={[styles.itemRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>{t('post.total')}</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>{post.order.total} EGP</Text>
              </View>
            </View>
          )}

          <Pressable
            onPress={handleCopy}
            disabled={isPending}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.copyBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
              isPending && styles.disabled,
            ]}>
            <Ionicons name="cart-outline" size={18} color={colors.primaryForeground} />
            <Text style={[styles.copyText, { color: colors.primaryForeground }]}>{t('post.copyOrder')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  root: { flex: 1 },
  headerBtn: {
    padding: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  back: { padding: Spacing.xs },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  likeBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  body: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
  },
  authorText: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorUsername: {
    fontSize: 13,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
  },
  restaurant: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
  restaurantLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
  },
  items: {
    gap: 6,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xs,
  },
  copyText: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
