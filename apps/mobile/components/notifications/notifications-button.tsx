import { Bell } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotificationsStore } from '@/stores/notifications';

type Props = {
  onPress: () => void;
};

export function NotificationsButton({ onPress }: Props) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? Colors.dark : Colors.light;
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`notifications, ${unreadCount} unread`}
      style={styles.button}>
      <Bell size={20} color={colors.text} strokeWidth={2} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text
            style={[
              styles.badgeCount,
              unreadCount > 9
                ? styles.badgeCountFontSmall
                : styles.badgeCountFontLarge,
            ]}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeCountFontSmall: {
    fontSize: 7,
  },
  badgeCountFontLarge: {
    fontSize: 10,
  },
  badgeCount: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

