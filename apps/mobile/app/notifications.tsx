import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationCard } from '@/components/notifications/notification-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useMarkAllNotificationsAsRead, useNotifications } from '@/lib/queries';

const PER_PAGE = 15;

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const notificationsQuery = useNotifications(page, PER_PAGE);
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = notificationsQuery.data?.items ?? [];
  const lastPage = notificationsQuery.data?.meta.last_page ?? 1;
  const total = notificationsQuery.data?.meta.total ?? 0;
  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {t('notifications.title')}
        </Text>
        <Pressable
          onPress={() => markAllAsRead.mutate()}
          disabled={!hasUnread || markAllAsRead.isPending}
          hitSlop={8}
          accessibilityRole="button"
          style={[styles.markAllBtn, !hasUnread && styles.disabled]}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>{t('notifications.markAllAsRead')}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {total > 0 && (
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {total} {t('notifications.countLabel')}
          </Text>
        )}

        {notificationsQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('notifications.empty')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((n) => (
              <NotificationCard key={n.id} notification={n} />
            ))}
          </View>
        )}

        {lastPage > 1 && (
          <View style={styles.pagination}>
            <Pressable
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || notificationsQuery.isLoading}
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
              disabled={page >= lastPage}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBack: { padding: Spacing.xs },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  markAllBtn: { paddingHorizontal: Spacing.sm },
  markAllText: { fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  count: { fontSize: 13, fontWeight: '600', marginTop: Spacing.sm },
  list: { gap: Spacing.sm },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing['3xl'],
  },
  emptyText: { fontSize: 13, fontWeight: '600' },
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
});