import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FriendsSearch } from '@/components/friends/friends-search';
import { UserCard } from '@/components/friends/user-card';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useFriends } from '@/lib/queries';

export default function FriendsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const friendsQuery = useFriends(1, 15, search);

  const friends = friendsQuery.data?.items ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('friends.title')}</Text>
      </View>

      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'friends', label: t('friends.friends') },
            { value: 'received', label: t('friends.received') },
            { value: 'sent', label: t('friends.sent') },
            { value: 'discover', label: t('friends.discover') },
          ]}
          value="friends"
          onChange={(value) => {
            if (value === 'received') router.push('/friends/received');
            if (value === 'sent') router.push('/friends/sent');
            if (value === 'discover') router.push('/friends/discover');
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
        {friendsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('friends.noUsers')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('friends.noUsersDesc')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {friends.map((user) => (
              <UserCard key={user.id} user={user} tab="friends" />
            ))}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
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
});
