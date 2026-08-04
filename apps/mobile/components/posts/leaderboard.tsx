import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import type { LeaderboardItem } from '@/lib/types';

type Scheme = 'light' | 'dark';

const MEDAL_STYLE: Record<number, { color: string; border: string; bg: string; text: string }> = {
  1: { color: '#F59E0B', border: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
  2: { color: '#94A3B8', border: '#94A3B8', bg: '#F1F5F9', text: '#475569' },
  3: { color: '#B45309', border: '#B45309', bg: '#FFFBEB', text: '#92400E' },
};

const DARK_MEDAL_STYLE: Record<number, { color: string; border: string; bg: string; text: string }> = {
  1: { color: '#F59E0B', border: '#F59E0B', bg: '#2A1E05', text: '#FBBF24' },
  2: { color: '#64748B', border: '#64748B', bg: '#1E293B', text: '#CBD5E1' },
  3: { color: '#B45309', border: '#B45309', bg: '#271A0A', text: '#F59E0B' },
};

export function Leaderboard({ items }: { items: LeaderboardItem[] }) {
  const schemeRaw = useColorScheme();
  const scheme: Scheme = schemeRaw === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const { t } = useI18n();

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: colors.border }]}>
        <Ionicons name="trophy-outline" size={36} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('feed.noLeaderboard')}
        </Text>
      </View>
    );
  }

  const byRank = new Map(items.filter((i) => i.rank <= 3).map((i) => [i.rank, i]));
  const order = [byRank.get(2), byRank.get(1), byRank.get(3)];

  return (
    <View style={[styles.podium, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rankRow}>
        {order.map((item, idx) =>
          item ? <Podium key={item.id} item={item} scheme={scheme} /> : <View key={`e${idx}`} style={styles.rankCol} />,
        )}
      </View>
    </View>
  );
}

function Podium({ item, scheme }: { item: LeaderboardItem; scheme: Scheme }) {
  const colors = Colors[scheme];
  const { t } = useI18n();
  const medal = (scheme === 'dark' ? DARK_MEDAL_STYLE : MEDAL_STYLE)[item.rank];
  const avatar = resolveImageUrl(item.user.profile_image_url);
  const isFirst = item.rank === 1;

  return (
    <View style={[styles.rankCol, isFirst && styles.rankColFirst]}>
      <View style={styles.avatarBox}>
        <Ionicons name={isFirst ? 'star' : 'medal'} size={20} color={medal.color} style={styles.medal} />
        {avatar ? (
          <View style={[styles.avatar, { borderColor: medal.border, backgroundColor: colors.muted }]}>
            <Image source={avatar} style={styles.avatarImg} contentFit="cover" transition={150} />
          </View>
        ) : (
          <View style={[styles.avatar, { borderColor: medal.border, backgroundColor: medal.bg }]}>
            <Text style={[styles.avatarInitial, { color: medal.text }]}>
              {item.user.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </View>
        )}
        <View style={[styles.rankBadge, { backgroundColor: medal.border }]}>
          <Text style={styles.rankBadgeText}>{item.rank}</Text>
        </View>
      </View>
      <Text style={[styles.rankName, { color: colors.text }]} numberOfLines={1}>
        {item.user.name}
      </Text>
      <Text style={[styles.rankUsername, { color: colors.textSecondary }]} numberOfLines={1}>
        @{item.user.username}
      </Text>
      <View style={[styles.points, { backgroundColor: medal.bg }]}>
        <Ionicons name="flash" size={13} color={medal.color} />
        <Text style={[styles.pointsText, { color: medal.text }]}>
          {item.reward_points} {t('feed.pts')}
        </Text>
      </View>
      <Text style={[styles.copies, { color: colors.textSecondary }]}>
        {item.copies} {t('feed.copies')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 14 },
  podium: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rankCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  rankColFirst: {
    transform: [{ scaleY: 1.06 }],
  },
  avatarBox: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  medal: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    zIndex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rankBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.sm,
    maxWidth: '90%',
  },
  rankUsername: {
    fontSize: 11,
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    marginTop: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  copies: {
    fontSize: 11,
    fontWeight: '500',
  },
});