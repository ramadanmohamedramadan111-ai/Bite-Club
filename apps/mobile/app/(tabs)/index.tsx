import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { CartSheet } from '@/components/cart/cart-sheet';
import { HeroCard } from '@/components/home/hero-card';
import { HomeCategories } from '@/components/home/home-categories';
import { SectionHeader } from '@/components/home/section-header';
import { TopRestaurants } from '@/components/home/top-restaurants';
import { LocationAlert } from '@/components/location/location-alert';
import { LocationButton } from '@/components/location/location-button';
import { NotificationsButton } from '@/components/notifications/notifications-button';
import { PointsButton } from '@/components/points/points-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useCart, useUnreadNotificationsCount } from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartQuery = useCart();
  useUnreadNotificationsCount();
  const cartCount = (cartQuery.data?.items ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.topBar, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => router.replace('/')}
          accessibilityRole="button"
          style={styles.brand}>
          <View style={[styles.logoWrap, { borderColor: colors.border }]}>
            <Image
              source={require('@/assets/images/brand-logo.png')}
              style={styles.logoImg}
              contentFit="cover"
            />
          </View>
          <Text style={[styles.brandText, { color: colors.text }]}>
            BiteClub
          </Text>
        </Pressable>
        <View style={styles.topBarSpacer} />
        <View style={styles.actions}>
          {isAuthenticated && (
            <NotificationsButton
              onPress={() => router.push('/notifications')}
            />
          )}
          <CartButton count={cartCount} onPress={() => setCartOpen(true)} />
          {isAuthenticated && (
            <Pressable
              onPress={() => router.push('/profile')}
              hitSlop={8}
              accessibilityRole="button"
              style={[
                styles.actionBtn,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}>
              <Ionicons name="person-outline" size={18} color={colors.text} />
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityRole="button"
            style={[
              styles.actionBtn,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}>
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <View
        style={[
          styles.secondBar,
          { backgroundColor: colors.muted, borderTopColor: colors.border },
        ]}>
        <LocationButton />
        {isAuthenticated ? (
          <PointsButton />
        ) : (
          <Pressable
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            style={[
              styles.loginBarBtn,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
            <Ionicons name="log-in-outline" size={14} color="#FFFFFF" />
            <Text style={[styles.loginBarText, { color: '#FFFFFF' }]}>
              {t('common.signIn')}
            </Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        style={[styles.root, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <HeroCard />
        <LocationAlert style={{ marginTop: 0, marginBottom: Spacing.md }} />
        <SectionHeader title={t('section.categories')} />
        <HomeCategories />
        <SectionHeader
          title={t('section.topRestaurants')}
          actionLabel={t('common.showAll')}
          onActionPress={() => router.push('/restaurants')}
        />
        <TopRestaurants />
      </ScrollView>

      <CartSheet
        cart={cartQuery.data ?? null}
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  secondBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  topBarSpacer: {
    flex: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 34,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: 4,
  },
  loginBarText: {
    fontSize: 12,
    fontWeight: '800',
  },
});

