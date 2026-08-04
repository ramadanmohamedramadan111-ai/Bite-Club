import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { resolveImageUrl } from '@/lib/config';
import { useDeleteReviewMutation, useMyReview, useReviewMutation } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import type { RestaurantReview } from '@/lib/types';

type Props = {
  restaurantId: number;
  reviews: RestaurantReview[];
  isLoading: boolean;
  isError: boolean;
};

function Stars({ value, onSelect, size = 20 }: { value: number; onSelect?: (r: number) => void; size?: number }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} disabled={!onSelect} onPress={() => onSelect?.(star)} hitSlop={4}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#F59E0B' : colors.border}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function RestaurantReviews({ restaurantId, reviews, isLoading, isError }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const myReviewQuery = useMyReview(restaurantId);
  const reviewMutation = useReviewMutation();
  const deleteMutation = useDeleteReviewMutation();

  const [mode, setMode] = useState<'idle' | 'write' | 'edit'>('idle');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const myReview = myReviewQuery.data;
  const isBusy = reviewMutation.isPending || deleteMutation.isPending;

  const startWrite = () => {
    setRating(5);
    setComment('');
    setError('');
    setMode('write');
  };

  const startEdit = () => {
    setRating(myReview?.rating ?? 5);
    setComment(myReview?.comment ?? '');
    setError('');
    setMode('edit');
  };

  const cancel = () => {
    setMode('idle');
    setError('');
  };

  const submit = () => {
    if (!comment.trim()) {
      setError(t('reviews.commentRequired'));
      return;
    }
    setError('');
    reviewMutation.mutate(
      { restaurantId, rating, comment, isUpdate: mode === 'edit' },
      {
        onSuccess: () => {
          Alert.alert(t('reviews.success'));
          setMode('idle');
          setComment('');
        },
        onError: () => {
          setError(t('reviews.error'));
        },
      },
    );
  };

  const confirmDelete = () => {
    Alert.alert(t('reviews.deleteTitle'), t('reviews.deleteDesc'), [
      { text: t('reviews.cancel'), style: 'cancel' },
      {
        text: t('reviews.delete'),
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(restaurantId, {
            onSuccess: () => {
              Alert.alert(t('reviews.deleted'));
              setMode('idle');
            },
            onError: () => setError(t('reviews.error')),
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.list}>
      {isAuthenticated && (
        <View style={styles.mySection}>
          {myReview && mode === 'idle' && (
            <View style={[styles.myCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <View style={styles.myHeader}>
                <Text style={[styles.myTitle, { color: colors.text }]}>{t('reviews.myReview')}</Text>
                <View style={styles.myActions}>
                  <Pressable onPress={startEdit} hitSlop={8} accessibilityRole="button">
                    <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={confirmDelete} hitSlop={8} accessibilityRole="button">
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
              <Stars value={myReview.rating} />
              <Text style={[styles.myComment, { color: colors.text }]}>
                {myReview.comment || t('detail.beFirst')}
              </Text>
            </View>
          )}

          {mode === 'idle' && !myReview && (
            <Button variant="outline" onPress={startWrite} style={styles.writeButton}>
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>{t('reviews.write')}</Text>
            </Button>
          )}

          {(mode === 'write' || mode === 'edit') && (
            <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {mode === 'edit' ? t('reviews.edit') : t('reviews.write')}
              </Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('reviews.rating')}</Text>
              <Stars value={rating} onSelect={setRating} size={30} />
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('reviews.comment')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={comment}
                onChangeText={setComment}
                multiline
                placeholder={t('reviews.commentPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
              {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
              <View style={styles.formActions}>
                <Button variant="outline" size="sm" onPress={cancel} style={styles.formBtn}>
                  {t('reviews.cancel')}
                </Button>
                <Button size="sm" onPress={submit} loading={isBusy} style={styles.formBtn}>
                  {mode === 'edit' ? t('reviews.update') : t('reviews.submit')}
                </Button>
              </View>
            </View>
          )}
        </View>
      )}

      {isError ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>{t('detail.noReviews')}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('detail.noReviews')}</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>{t('detail.beFirst')}</Text>
        </View>
      ) : (
        reviews.map((review) => {
          const avatar = resolveImageUrl(review.user?.profile_image);
          const initials = review.user?.name?.charAt(0)?.toUpperCase() ?? 'U';
          return (
            <View key={review.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
                  {avatar ? (
                    <Image source={avatar} style={styles.avatarImage} contentFit="cover" />
                  ) : (
                    <Text style={[styles.initials, { color: colors.textSecondary }]}>{initials}</Text>
                  )}
                </View>
                <View style={styles.headerBody}>
                  <Text style={[styles.author, { color: colors.text }]}>{review.user?.name ?? 'User'}</Text>
                  <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(review.created_at)}</Text>
                </View>
                <Stars value={review.rating} size={14} />
              </View>
              {review.comment ? (
                <Text style={[styles.comment, { color: colors.textSecondary }]}>{review.comment}</Text>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  mySection: {
    gap: Spacing.md,
  },
  myCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  myHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  myActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  myComment: {
    fontSize: 13,
    lineHeight: 19,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  form: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  input: {
    minHeight: 88,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  formBtn: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerBody: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  comment: {
    fontSize: 13,
    lineHeight: 19,
  },
});