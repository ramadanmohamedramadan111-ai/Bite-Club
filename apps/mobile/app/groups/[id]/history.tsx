import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useGroupDetail, useGroupOrderHistory } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import type { GroupOrderHistory } from '@/lib/types';

export default function GroupHistoryScreen() {
  const { id: idParam } = useLocalSearchParams();
  const groupId = Number(idParam);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const [page, setPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});

  const { data: group, isLoading: isLoadingGroup } = useGroupDetail(groupId);
  const { data: historyData, isLoading: isLoadingHistory } = useGroupOrderHistory(groupId, page, 10);

  if (isLoadingGroup) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.text }]}>{t('groups.groupNotFound')}</Text>
        <Button variant="outline" onPress={() => router.back()} style={styles.backBtn}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const orders = historyData?.items ?? [];
  const lastPage = historyData?.meta.last_page ?? 1;

  const renderOrderCard = ({ item }: { item: GroupOrderHistory }) => {
    const restaurantLogo = resolveImageUrl(item.restaurant.image_url);
    const fallbackLetter = item.restaurant.name?.charAt(0).toUpperCase() ?? '?';
    const isCompleted = item.status === 'completed';
    const isExpanded = !!expandedOrders[item.id];
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Card Header */}
        <Pressable onPress={() => toggleExpandOrder(item.id)} style={styles.cardHeader}>
          {restaurantLogo ? (
            <Image source={restaurantLogo} style={styles.restaurantLogo} contentFit="cover" />
          ) : (
            <View style={[styles.logoFallback, { backgroundColor: colors.muted }]}>
              <Text style={[styles.fallbackLetter, { color: colors.primary }]}>{fallbackLetter}</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>{item.restaurant.name}</Text>
            <Text style={[styles.hostName, { color: colors.textSecondary }]}>
              by {item.host.name}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isCompleted ? colors.success + '15' : colors.destructive + '15' },
              ]}
            >
              <Text style={[styles.statusText, { color: isCompleted ? colors.success : colors.destructive }]}>
                {isCompleted ? 'Completed' : 'Cancelled'}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
              style={{ marginTop: 4 }}
            />
          </View>
        </Pressable>

        {/* Basic Meta Details */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{dateStr}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.members_summary.length} {item.members_summary.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {/* Collapsible Details */}
        {isExpanded && (
          <View style={[styles.collapsibleContent, { borderTopColor: colors.border }]}>
            {item.members_summary.map((member) => {
              const memberAvatar = resolveImageUrl(member.user.profile_image);
              const memberInitials = member.user.name?.charAt(0).toUpperCase() ?? '?';

              return (
                <View
                  key={member.user.id}
                  style={[styles.memberSummaryCard, { backgroundColor: colors.muted }]}
                >
                  <View style={styles.memberHeader}>
                    <View style={styles.memberUserBlock}>
                      {memberAvatar ? (
                        <Image source={memberAvatar} style={styles.memberAvatar} />
                      ) : (
                        <View style={[styles.memberAvatarFallback, { backgroundColor: colors.border }]}>
                          <Text style={[styles.memberInitialsText, { color: colors.primary }]}>
                            {memberInitials}
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.memberUserName, { color: colors.text }]}>{member.user.name}</Text>
                    </View>
                    <Text style={[styles.memberUserTotal, { color: colors.text }]}>
                      EGP {member.user_total.toFixed(2)}
                    </Text>
                  </View>

                  {/* Member ordered items */}
                  <View style={styles.itemsList}>
                    {member.items.map((subitem) => (
                      <View key={subitem.id} style={styles.itemRow}>
                        <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                          {subitem.quantity}x
                        </Text>
                        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                          {subitem.item.title}
                        </Text>
                        <Text style={[styles.itemPrice, { color: colors.text }]}>
                          EGP {subitem.total_price.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Card Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            EGP {item.total_amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const groupAvatar = resolveImageUrl(group.image_url);
  const initials = group.name.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Group Info Banner */}
      <View style={[styles.groupBanner, { borderBottomColor: colors.border }]}>
        <View style={styles.bannerContent}>
          {groupAvatar ? (
            <Image source={groupAvatar} style={styles.bannerAvatar} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.bannerAvatarFallback, { backgroundColor: colors.muted }]}>
              <Text style={[styles.bannerFallbackText, { color: colors.primary }]}>{initials}</Text>
            </View>
          )}
          <View style={styles.bannerText}>
            <Text style={[styles.bannerName, { color: colors.text }]}>{group.name}</Text>
            <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
              {group.description || t('detail.noCategories')}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs / Segmented */}
      <View style={styles.segmentedWrap}>
        <Segmented
          options={[
            { value: 'members', label: t('groups.membersTab') },
            { value: 'history', label: t('groups.historyTab') },
            { value: 'settings', label: t('groups.settingsTab') },
          ]}
          value="history"
          onChange={(value) => {
            if (value === 'members') router.replace(`/groups/${groupId}`);
            if (value === 'settings') router.replace(`/groups/${groupId}/settings`);
          }}
        />
      </View>

      {/* History List */}
      {isLoadingHistory && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('groups.orderHistoryEmpty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            lastPage > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoadingHistory}
                  style={[
                    styles.pageBtn,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                    page <= 1 && styles.disabled,
                  ]}
                >
                  <Ionicons name="chevron-back" size={16} color={colors.text} />
                  <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.prev')}</Text>
                </Pressable>
                <Text style={[styles.pageIndicator, { color: colors.textSecondary }]}>
                  {t('restaurants.page')} {page} {t('restaurants.of')} {lastPage}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage || isLoadingHistory}
                  style={[
                    styles.pageBtn,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                    page >= lastPage && styles.disabled,
                  ]}
                >
                  <Text style={[styles.pageText, { color: colors.text }]}>{t('restaurants.next')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text} />
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backBtnWrapper: {
    padding: Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  groupBanner: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bannerAvatar: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
  },
  bannerAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerFallbackText: {
    fontSize: 22,
    fontWeight: '800',
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerName: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  segmentedWrap: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  orderCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  restaurantLogo: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
  },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLetter: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  hostName: {
    fontSize: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  collapsibleContent: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  memberSummaryCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  memberUserBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  memberAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitialsText: {
    fontSize: 11,
    fontWeight: '800',
  },
  memberUserName: {
    fontSize: 13,
    fontWeight: '600',
  },
  memberUserTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemsList: {
    gap: 4,
    paddingLeft: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemQty: {
    fontSize: 12,
    width: 24,
  },
  itemTitle: {
    fontSize: 12,
    flex: 1,
    marginRight: Spacing.md,
  },
  itemPrice: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
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
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  backBtn: {
    minWidth: 100,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
