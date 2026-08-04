import { Ionicons } from '@expo/vector-icons';
import { Logs, Newspaper, Users } from 'lucide-react-native';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useActiveGroupOrders, useFriendRequests } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: activeSessions } = useActiveGroupOrders();
  const activeCount = activeSessions?.length ?? 0;

  const { data: requestsData } = useFriendRequests();
  const requestsCount = requestsData?.meta?.total ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          display: isAuthenticated ? 'flex' : 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, size }) => <Logs size={size} color={color} />,
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="posts/index"
        options={{
          title: t('tabs.posts'),
          tabBarIcon: ({ color, size }) => <Newspaper size={size} color={color} />,
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="groups/index"
        options={{
          title: t('tabs.groups'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="friends/index"
        options={{
          title: t('tabs.friends'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          tabBarBadge: requestsCount > 0 ? requestsCount : undefined,
          href: isAuthenticated ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}