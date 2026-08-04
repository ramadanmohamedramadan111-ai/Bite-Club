import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendsSearch } from '@/components/friends/friends-search';
import { DirectionalIcon } from '@/components/ui/directional-icon';
import { UserCard } from '@/components/friends/user-card';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useFriendRequests } from '@/lib/queries';

const PER_PAGE = 15;

export default function ReceivedRequestsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const query = useFriendRequests(page, PER_PAGE, search);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const users = query.data?.items ?? [];
  const lastPage = query.data?.meta.last_page ?? 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.back}>
          <DirectionalIcon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t('friends.receivedRequests')}
        </Text>
      </View>

      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'friends', label: t('friends.friends') },
            { value: 'received', label: t('friends.received') },
            { value: 'sent', label: t('friends.sent') },
            { value: 'discover', label: t('friends.discover') },
          ]}
          value="received"
          onChange={(value) => {
            if (value === 'friends') router.replace('/friends');
            if (value === 'sent') router.replace('/friends/sent');
            if (value === 'discover') router.replace('/friends/discover');
          }}
        />
      </View>

      <View style={styles.searchWrap}>
        <FriendsSearch onSearch={setSearch} />
      </View>

      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {query.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="mail-unread-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('friends.noRequests')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('friends.noRequestsDesc')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {users.map((user) => (
              <UserCard key={user.id} user={user} tab="received" />
            ))}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || query.isLoading}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page <= 1 && styles.disabled,
              ]}>
              <DirectionalIcon name="chevron-back" size={16} color={colors.text} />
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.prev')}</Text>
            </Pressable>
            <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
              {t('restaurants.page')} {page} {t('restaurants.of')} {lastPage}
            </Text>
            <Pressable
              onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page >= lastPage}
              accessibilityRole="button"
              style={[
                styles.pageBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
                page >= lastPage && styles.disabled,
              ]}>
              <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.next')}</Text>
              <DirectionalIcon name="chevron-forward" size={16} color={colors.text} />
            </Pressable>
          </View>
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
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  back: { padding: Spacing.xs },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: Spacing.xl,
  },
  segmentedWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
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
});
