import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Alert, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartButton } from '@/components/cart/cart-button';
import { CartSheet } from '@/components/cart/cart-sheet';
import { MenuItemCustomizer } from '@/components/cart/menu-item-customizer';
import { RestaurantDetailHeader } from '@/components/restaurants/restaurant-detail-header';
import { RestaurantInfo } from '@/components/restaurants/restaurant-info';
import { RestaurantMenu } from '@/components/restaurants/restaurant-menu';
import { RestaurantReviews } from '@/components/restaurants/restaurant-reviews';
import { Segmented } from '@/components/ui/segmented';
import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import {
  useCart,
  useRestaurantDetail,
  useRestaurantMenu,
  useRestaurantReviews,
  useGroups,
  useCreateGroupOrderSession,
} from '@/lib/queries';
import { useAuthStore } from '@/stores/auth';
import type { MenuItem, GroupTypeSimplified } from '@/lib/types';

type Tab = 'menu' | 'reviews' | 'info';

export default function RestaurantDetailScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>('menu');
  const [cartOpen, setCartOpen] = useState(false);
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [sessionType, setSessionType] = useState<'anonymous' | 'fixed'>('anonymous');

  const groupsQuery = useGroups();
  const createGroupOrderMutation = useCreateGroupOrderSession();

  const userGroups = groupsQuery.data?.items ?? [];
  const filteredGroups = useMemo(() => {
    if (!groupSearch) return userGroups;
    return userGroups.filter((g: GroupTypeSimplified) => g.name.toLowerCase().includes(groupSearch.toLowerCase()));
  }, [userGroups, groupSearch]);

  const handleCreateGroupOrder = (groupId: number) => {
    createGroupOrderMutation.mutate(
      { group_id: groupId, restaurant_id: Number(id), is_anonymous: false },
      {
        onSuccess: (res) => {
          setGroupModalOpen(false);
          setGroupSearch('');
          router.push(`/group-order/${res.group_order_id}`);
        },
        onError: (err) => {
          Alert.alert(t('common.genericError'), err.message);
        },
      }
    );
  };

  const handleCreateAnonymousGroupOrder = () => {
    createGroupOrderMutation.mutate(
      { group_id: null, restaurant_id: Number(id), is_anonymous: true },
      {
        onSuccess: (res) => {
          setGroupModalOpen(false);
          setGroupSearch('');
          router.push(`/group-order/${res.group_order_id}`);
        },
        onError: (err) => {
          Alert.alert(t('common.genericError'), err.message);
        },
      }
    );
  };

  const closeGroupModal = () => {
    setGroupModalOpen(false);
    setGroupSearch('');
    setSessionType('anonymous');
  };

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const cartQuery = useCart();

  const restaurantQuery = useRestaurantDetail(id);
  const menuQuery = useRestaurantMenu(id);
  const reviewsQuery = useRestaurantReviews(id);

  const tabs = useMemo(
    () => [
      { value: 'menu' as const, label: t('detail.menu') },
      { value: 'reviews' as const, label: t('detail.reviews') },
      { value: 'info' as const, label: t('detail.info') },
    ],
    [t],
  );

  const restaurant = restaurantQuery.data;

  const cartCount = (cartQuery.data?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" style={styles.navBack}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {restaurant?.name ?? ''}
        </Text>
        <CartButton count={cartCount} onPress={() => setCartOpen(true)} />
      </View>

      {restaurantQuery.isLoading || restaurantQuery.isError || !restaurant ? (
        <View style={styles.center}>
          {restaurantQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="cloud-offline-outline" size={40} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary }}>{t('restaurants.adjustFilters')}</Text>
            </>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <RestaurantDetailHeader restaurant={restaurant} />

          {isAuthenticated && restaurant.is_open_now && (
            <Button
              variant="default"
              onPress={() => setGroupModalOpen(true)}
              style={styles.groupOrderBtn}
            >
              <Ionicons name="people" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.groupOrderBtnText}>Start Group Order</Text>
            </Button>
          )}

          <Segmented value={tab} onChange={setTab} options={tabs} />
          {tab === 'menu' && (
            <RestaurantMenu
              restaurantId={restaurant.id}
              menu={menuQuery.data ?? []}
              isLoading={menuQuery.isLoading}
              isError={menuQuery.isError}
              onCustomize={setCustomizeItem}
            />
          )}
          {tab === 'reviews' && (
            <RestaurantReviews
              restaurantId={restaurant.id}
              reviews={reviewsQuery.data ?? []}
              isLoading={reviewsQuery.isLoading}
              isError={reviewsQuery.isError}
            />
          )}
          {tab === 'info' && <RestaurantInfo restaurant={restaurant} />}
        </ScrollView>
      )}

            <CartSheet cart={cartQuery.data ?? null} visible={cartOpen} onClose={() => setCartOpen(false)} />

      <MenuItemCustomizer
        item={customizeItem}
        restaurantId={restaurant?.id ?? 0}
        restaurantName={restaurant?.name ?? ''}
        visible={customizeItem !== null}
        onClose={() => setCustomizeItem(null)}
      />

      <Modal visible={groupModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('groups.groupOrder')}</Text>
              <Pressable onPress={closeGroupModal} hitSlop={10} accessibilityRole="button">
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {t('groups.sessionType')}
            </Text>

            {/* Session type selector */}
            <View style={styles.sessionTypeRow}>
              <Pressable
                onPress={() => setSessionType('anonymous')}
                style={[
                  styles.sessionTypeBtn,
                  { borderColor: sessionType === 'anonymous' ? colors.primary : colors.border },
                  sessionType === 'anonymous' && { backgroundColor: colors.primary + '05' },
                ]}
              >
                <Text
                  style={[
                    styles.sessionTypeTitle,
                    { color: sessionType === 'anonymous' ? colors.primary : colors.text },
                  ]}
                >
                  {t('groups.anonymous')}
                </Text>
                <Text style={[styles.sessionTypeDesc, { color: colors.textSecondary }]}>
                  {t('groups.anonymousDesc')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSessionType('fixed')}
                style={[
                  styles.sessionTypeBtn,
                  { borderColor: sessionType === 'fixed' ? colors.primary : colors.border },
                  sessionType === 'fixed' && { backgroundColor: colors.primary + '05' },
                ]}
              >
                <Text
                  style={[
                    styles.sessionTypeTitle,
                    { color: sessionType === 'fixed' ? colors.primary : colors.text },
                  ]}
                >
                  {t('groups.fixedGroup')}
                </Text>
                <Text style={[styles.sessionTypeDesc, { color: colors.textSecondary }]}>
                  {t('groups.fixedGroupDesc')}
                </Text>
              </Pressable>
            </View>

            {sessionType === 'anonymous' ? (
              <Button
                variant="default"
                loading={createGroupOrderMutation.isPending}
                onPress={handleCreateAnonymousGroupOrder}
                style={styles.startBtn}
              >
                <Ionicons name="people" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.groupOrderBtnText}>Start Group Order</Text>
              </Button>
            ) : (
              <>
                <TextInput
                  placeholder={t('groups.searchGroups')}
                  placeholderTextColor={colors.textSecondary}
                  value={groupSearch}
                  onChangeText={setGroupSearch}
                  style={[styles.searchInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.muted }]}
                />

                {createGroupOrderMutation.isPending && (
                  <View style={styles.creatingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.creatingText, { color: colors.text }]}>Starting group order...</Text>
                  </View>
                )}

                {groupsQuery.isLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.xl }} />
                ) : filteredGroups.length === 0 ? (
                  <View style={styles.emptyGroups}>
                    <Text style={{ color: colors.textSecondary }}>{t('groups.noGroupsFound')}</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredGroups}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => handleCreateGroupOrder(item.id)}
                        disabled={createGroupOrderMutation.isPending}
                        style={({ pressed }) => [
                          styles.groupItem,
                          { borderColor: colors.border },
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.groupName, { color: colors.text }]}>{item.name}</Text>
                          {item.description ? (
                            <Text style={[styles.groupDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                        <View style={[styles.memberCountBadge, { backgroundColor: colors.muted }]}>
                          <Text style={[styles.memberCountText, { color: colors.primary }]}>
                            {item.members_count}
                          </Text>
                        </View>
                      </Pressable>
                    )}
                    contentContainerStyle={{ gap: Spacing.sm, paddingBottom: Spacing.xl }}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBack: {
    padding: Spacing.xs,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  groupOrderBtn: {
    height: 46,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupOrderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '80%',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sessionTypeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  sessionTypeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sessionTypeDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  startBtn: {
    height: 46,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  emptyGroups: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  memberCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  creatingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
  },
  creatingText: {
    fontSize: 14,
    fontWeight: '700',
  },
});