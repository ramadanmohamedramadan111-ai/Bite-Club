import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import {
  queryKeys,
  useGroupOrderSession,
  useRestaurantMenu,
  useRemoveGroupCartItem,
  useUpdateGroupCartItemQuantity,
  useClearMyGroupCartItems,
  useUnlockGroupOrder,
  useCancelGroupOrder,
} from '@/lib/queries';
import { useRealtimeGroupOrder } from '@/stores/notifications';
import { resolveImageUrl } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';
import { GroupMenuItemCustomizer } from '@/components/cart/group-menu-item-customizer';
import type { MenuItem } from '@/lib/types';

type Tab = 'menu' | 'cart';

export default function GroupOrderScreen() {
  const { id: idParam } = useLocalSearchParams();
  const sessionId = Number(idParam);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  if (!isAuthenticated) {
    return <Redirect href={`/login?redirect=/group-order/${sessionId}`} />;
  }

  const [tab, setTab] = useState<Tab>('menu');
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);

  const { data: sessionCart, isLoading, error } = useGroupOrderSession(sessionId);

  const restaurantId = sessionCart?.restaurant?.id ?? 0;
  const { data: menuData, isLoading: isLoadingMenu } = useRestaurantMenu(restaurantId);

  const removeCartItemMutation = useRemoveGroupCartItem(sessionId);
  const updateQuantityMutation = useUpdateGroupCartItemQuantity(sessionId);
  const clearMyItemsMutation = useClearMyGroupCartItems(sessionId);
  const unlockOrderMutation = useUnlockGroupOrder(sessionId);
  const cancelOrderMutation = useCancelGroupOrder(sessionId);

  // Laravel Echo Realtime Integration
  useRealtimeGroupOrder(sessionId, (event, data) => {
    // Invalidate session cart queries to update UI dynamically
    void queryClient.invalidateQueries({ queryKey: queryKeys.groupOrderSession(sessionId) });

    if (event === 'order.locked') {
      Alert.alert('Locked', t('groups.locked'));
    } else if (event === 'order.unlocked') {
      Alert.alert('Unlocked', t('groups.groupOrderUnlocked'));
    } else if (event === 'order.cancelled') {
      Alert.alert('Cancelled', t('groups.groupOrderCancelled'));
    }
  });

  const menu = menuData ?? [];
  const isHost = currentUser?.id === sessionCart?.host?.id;
  const isLocked = sessionCart?.status === 'locked';

  const totalItems = useMemo(() => {
    if (!sessionCart) return 0;
    return sessionCart.members_summary.reduce((sum, m) => sum + m.items.length, 0);
  }, [sessionCart]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !sessionCart) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.text }]}>{t('groups.groupOrderNotFound')}</Text>
        <Button variant="outline" onPress={() => router.back()} style={styles.backBtn}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  // Completed State View
  if (sessionCart.status === 'completed') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {t('groups.groupOrderCompleted')}
          </Text>
          <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
            {t('groups.groupOrderCompletedDesc', { restaurant: sessionCart.restaurant.name })}
          </Text>
          <Button variant="outline" onPress={() => router.replace('/groups')} style={styles.statusBtn}>
            {t('groups.backToGroups')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Cancelled State View
  if (sessionCart.status === 'cancelled') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Ionicons name="close-circle" size={80} color={colors.destructive} />
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {t('groups.groupOrderCancelled')}
          </Text>
          <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
            {t('groups.groupOrderCancelledDesc', { restaurant: sessionCart.restaurant.name })}
          </Text>
          <Button variant="outline" onPress={() => router.replace('/groups')} style={styles.statusBtn}>
            {t('groups.backToGroups')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleItemPress = (item: MenuItem) => {
    if (isLocked) {
      Alert.alert(t('groups.locked'), t('groups.locked'));
      return;
    }
    setCustomizeItem(item);
  };

  const handleUnlockOrder = () => {
    unlockOrderMutation.mutate(undefined, {
      onSuccess: () => Alert.alert(t('createPost.success')),
      onError: (err) => Alert.alert(t('common.genericError'), err.message),
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(t('groups.cancelGroupOrderTitle'), t('groups.cancelGroupOrderDesc'), [
      { text: t('createPost.cancel'), style: 'cancel' },
      {
        text: t('groups.cancelGroupOrderConfirm'),
        style: 'destructive',
        onPress: () => {
          cancelOrderMutation.mutate(undefined, {
            onSuccess: () => {
              Alert.alert(t('createPost.success'));
              router.replace('/groups');
            },
            onError: (err) => Alert.alert(t('common.genericError'), err.message),
          });
        },
      },
    ]);
  };

  const handleClearMyItems = () => {
    Alert.alert(t('groups.clearMyItems') + '?', '', [
      { text: t('createPost.cancel'), style: 'cancel' },
      {
        text: t('groups.clearMyItems'),
        style: 'destructive',
        onPress: () => {
          clearMyItemsMutation.mutate(undefined, {
            onSuccess: () => Alert.alert(t('createPost.success')),
            onError: (err) => Alert.alert(t('common.genericError'), err.message),
          });
        },
      },
    ]);
  };

  const handleRemoveItem = (itemId: number) => {
    removeCartItemMutation.mutate(itemId, {
      onError: (err) => Alert.alert(t('common.genericError'), err.message),
    });
  };

  const handleUpdateQty = (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantityMutation.mutate({ item_id: itemId, quantity: newQty });
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const itemImage = resolveImageUrl(item.image_url);

    return (
      <Pressable
        onPress={() => handleItemPress(item)}
        style={({ pressed }) => [
          styles.menuCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.menuInfo}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
          {item.description ? (
            <Text style={[styles.menuDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <Text style={[styles.menuPrice, { color: colors.primary }]}>EGP {item.price.toFixed(2)}</Text>
        </View>

        {itemImage && (
          <Image source={itemImage} style={styles.menuImage} contentFit="cover" transition={150} />
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Navbar */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.navBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.navHeaderInfo}>
          <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
            {t('groups.groupOrder')}
          </Text>
          <Text style={[styles.navSub, { color: colors.textSecondary }]} numberOfLines={1}>
            {sessionCart.restaurant.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isLocked ? colors.destructive + '15' : colors.success + '15' }]}>
          <Ionicons
            name={isLocked ? 'lock-closed' : 'checkmark-circle-outline'}
            size={12}
            color={isLocked ? colors.destructive : colors.success}
            style={{ marginRight: 2 }}
          />
          <Text style={[styles.statusText, { color: isLocked ? colors.destructive : colors.success }]}>
            {isLocked ? t('groups.locked') : t('groups.open')}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <Segmented
          options={[
            { value: 'menu', label: t('detail.menu') },
            { value: 'cart', label: `${t('groups.groupCart')} (${totalItems})` },
          ]}
          value={tab}
          onChange={(val) => setTab(val as Tab)}
        />
      </View>

      {/* Content */}
      {tab === 'menu' ? (
        isLoadingMenu ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={menu.flatMap((section) => section.items)}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.cartContent} showsVerticalScrollIndicator={false}>
          {/* Members List summary */}
          <View style={styles.membersSummaryWrap}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groups.members')}</Text>
            <View style={styles.avatarList}>
              {sessionCart.members_summary.map((member) => {
                const avatar = resolveImageUrl(member.user.profile_image);
                const initials = member.user.name.charAt(0).toUpperCase();

                return (
                  <View key={member.user.id} style={[styles.memberBadge, { backgroundColor: colors.muted }]}>
                    {avatar ? (
                      <Image source={avatar} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatarFallback, { backgroundColor: colors.border }]}>
                        <Text style={[styles.memberInitials, { color: colors.primary }]}>{initials}</Text>
                      </View>
                    )}
                    <Text style={[styles.memberNameText, { color: colors.text }]}>
                      {member.user.name} {member.user.id === sessionCart.host.id && `(${t('groups.host')})`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Cart Details */}
          <View style={styles.cartSection}>
            <View style={styles.cartHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groups.groupCart')}</Text>
              {totalItems > 0 && !isLocked && (
                <Pressable onPress={handleClearMyItems}>
                  <Text style={[styles.clearBtnText, { color: colors.destructive }]}>
                    {t('groups.clearMyItems')}
                  </Text>
                </Pressable>
              )}
            </View>

            {totalItems === 0 ? (
              <Text style={[styles.emptyCartText, { color: colors.textSecondary }]}>
                {t('groups.noItemsYet')}
              </Text>
            ) : (
              <View style={styles.cartItemsWrap}>
                {sessionCart.members_summary.map((member) => (
                  <View key={member.user.id} style={styles.memberOrderBlock}>
                    <Text style={[styles.memberHeading, { color: colors.text }]}>
                      {member.user.name}'s items
                    </Text>
                    {member.items.map((cartItem) => {
                      const isOwnItem = member.user.id === currentUser?.id;

                      return (
                        <View key={cartItem.id} style={[styles.cartItemCard, { borderColor: colors.border }]}>
                          <View style={styles.itemMain}>
                            <Text style={[styles.cartItemTitle, { color: colors.text }]}>
                              {cartItem.item.title}
                            </Text>
                            <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>
                              EGP {cartItem.total_price.toFixed(2)}
                            </Text>
                          </View>

                          {cartItem.notes ? (
                            <Text style={[styles.cartItemNotes, { color: colors.textSecondary }]}>
                              Notes: {cartItem.notes}
                            </Text>
                          ) : null}

                          {isOwnItem && !isLocked ? (
                            <View style={styles.qtyControls}>
                              <Pressable
                                onPress={() => handleUpdateQty(cartItem.item.id, cartItem.quantity - 1)}
                                style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                              >
                                <Ionicons name="remove" size={16} color={colors.text} />
                              </Pressable>
                              <Text style={[styles.qtyValText, { color: colors.text }]}>
                                {cartItem.quantity}
                              </Text>
                              <Pressable
                                onPress={() => handleUpdateQty(cartItem.item.id, cartItem.quantity + 1)}
                                style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                              >
                                <Ionicons name="add" size={16} color={colors.text} />
                              </Pressable>
                              <Pressable
                                onPress={() => handleRemoveItem(cartItem.item.id)}
                                style={[styles.deleteItemBtn, { backgroundColor: colors.destructive + '15' }]}
                              >
                                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                              </Pressable>
                            </View>
                          ) : (
                            <Text style={[styles.qtyTextRead, { color: colors.textSecondary }]}>
                              Quantity: {cartItem.quantity}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {/* Total summary */}
            <View style={[styles.totalsBox, { borderTopColor: colors.border }]}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Subtotal</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>
                  EGP {sessionCart.total_amount.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Actions for Host */}
            {isHost && (
              <View style={styles.hostActionsWrap}>
                {isLocked ? (
                  <Button variant="outline" onPress={handleUnlockOrder} style={styles.hostActionBtn}>
                    <Ionicons name="lock-open-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                      {t('groups.unlockGroupOrder')}
                    </Text>
                  </Button>
                ) : null}

                <Button variant="destructive" onPress={handleCancelOrder} style={styles.hostActionBtn}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                    {t('groups.cancelGroupOrder')}
                  </Text>
                </Button>
              </View>
            )}

            {/* Checkout / final button */}
            {isHost ? (
              <Button
                variant="default"
                disabled={totalItems === 0}
                onPress={() => router.push(`/group-order/${sessionId}/checkout`)}
                style={styles.checkoutBtn}
              >
                Proceed to Checkout
              </Button>
            ) : isLocked ? (
              <View style={[styles.waitingBanner, { backgroundColor: colors.muted }]}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.waitingText, { color: colors.textSecondary }]}>
                  Waiting for host ({sessionCart.host.name}) to finalize the order.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Item Customizer Modal */}
      <GroupMenuItemCustomizer
        item={customizeItem}
        sessionId={sessionId}
        membersSummary={sessionCart.members_summary}
        visible={customizeItem !== null}
        onClose={() => setCustomizeItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  navBack: {
    padding: Spacing.xs,
  },
  navHeaderInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  navSub: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  tabsWrap: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuInfo: {
    flex: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  menuPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  menuImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
  },

  // Cart tab styles
  cartContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  membersSummaryWrap: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatarList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xl,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  memberAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    fontSize: 10,
    fontWeight: '800',
  },
  memberNameText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cartSection: {
    gap: Spacing.md,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCartText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: Spacing.md,
  },
  cartItemsWrap: {
    gap: Spacing.lg,
  },
  memberOrderBlock: {
    gap: Spacing.sm,
  },
  memberHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cartItemCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  cartItemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  cartItemNotes: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteItemBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  qtyTextRead: {
    fontSize: 12,
    marginTop: 2,
  },
  totalsBox: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  hostActionsWrap: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  hostActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtn: {
    marginTop: Spacing.sm,
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  waitingText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },

  // Completed & Cancelled status views
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  statusDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  statusBtn: {
    marginTop: Spacing.xl,
    minWidth: 150,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  backBtn: {
    minWidth: 100,
  },
});
