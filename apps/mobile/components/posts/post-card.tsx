import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PostImages } from '@/components/posts/post-images';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import { useLikePost, useUnlikePost } from '@/lib/queries';
import type { Post } from '@/lib/types';

export function PostCard({
  post,
  onPress,
  onCopyOrder,
}: {
  post: Post;
  onPress?: () => void;
  onCopyOrder?: (post: Post) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const [isLiked, setIsLiked] = useState(post.is_liked_by_user ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const isPending = post.status === 'pending';

  useEffect(() => {
    setIsLiked(post.is_liked_by_user ?? false);
    setLikeCount(post.likes_count);
  }, [post.id, post.is_liked_by_user, post.likes_count]);

  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();

  function handleLike() {
    if (isPending) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));
    if (nextLiked) {
      likeMutation.mutate(post.id);
    } else {
      unlikeMutation.mutate(post.id);
    }
  }

  const authorAvatar = resolveImageUrl(post.user.profile_image_url);
  const authorInitial = post.user.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        isPending && styles.pending,
      ]}>
      <PostImages post={post} onPress={onPress} showCounter />

      <View style={styles.body}>
        {isPending && (
          <View style={[styles.pendingBadge, { backgroundColor: colors.muted }]}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.pendingText, { color: colors.textSecondary }]}>
              {t('post.pending')}
            </Text>
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
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {post.user.name}
            </Text>
            <Text style={[styles.authorUsername, { color: colors.textSecondary }]} numberOfLines={1}>
              @{post.user.username}
            </Text>
          </View>
        </View>

        <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
          {post.caption}
        </Text>

        <Pressable onPress={onCopyOrder ? () => onCopyOrder(post) : undefined} accessibilityRole="button">
          <View style={[styles.restaurant, { backgroundColor: colors.muted }]}>
            <Text style={[styles.restaurantLabel, { color: colors.textSecondary }]}>
              {t('feed.from')}
            </Text>
            <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
              {post.restaurant.name}
            </Text>
          </View>
        </Pressable>

        {post.order?.items && post.order.items.length > 0 && (
          <View style={styles.items}>
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
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleLike}
            disabled={isPending}
            accessibilityRole="button"
            style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? colors.destructive : colors.text}
            />
            <Text style={[styles.footerText, { color: isLiked ? colors.destructive : colors.text }]}>
              {likeCount}
            </Text>
          </Pressable>
          {onCopyOrder && (
            <Pressable
              onPress={() => onCopyOrder(post)}
              disabled={isPending}
              accessibilityRole="button"
              style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="cart-outline" size={18} color={colors.primary} />
              <Text style={[styles.footerText, { color: colors.primary }]}>
                {t('post.copyOrder')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  pending: {
    opacity: 0.65,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.md,
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
    width: 36,
    height: 36,
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
    fontSize: 15,
    fontWeight: '800',
  },
  authorText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorUsername: {
    fontSize: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
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
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
