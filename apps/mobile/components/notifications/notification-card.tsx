import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useMarkNotificationAsRead } from '@/lib/queries';
import type { AppNotification } from '@/lib/types';

export function NotificationCard({ notification }: { notification: AppNotification }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const markAsRead = useMarkNotificationAsRead();

  const isRead = !!notification.read_at;

  const handlePress = () => {
    if (!isRead) markAsRead.mutate(notification.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: isRead ? colors.border : colors.primary },
        !isRead && styles.unread,
      ]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: isRead ? colors.border : colors.primary }]} />
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]}>{notification.data.title}</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{notification.data.body}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatTime(notification.created_at)}
          </Text>
        </View>
        {!isRead && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              markAsRead.mutate(notification.id);
            }}
            hitSlop={8}
            accessibilityRole="button"
            style={[styles.markBtn, { borderColor: colors.border }]}>
            <Text style={[styles.markText, { color: colors.primary }]}>{t('notifications.markAsRead')}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  unread: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
  markBtn: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  markText: {
    fontSize: 11,
    fontWeight: '700',
  },
});