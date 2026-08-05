import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/button';
import { DirectionalIcon } from '@/components/ui/directional-icon';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useGroupOrderDetail } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';

const GROUP_ORDER_WEB_URL = 'https://biteclub.com';

function getStatusLabel(status: string, t: (key: string) => string): string {
  switch (status) {
    case 'completed':
      return t('groups.groupOrderCompleted');
    case 'cancelled':
      return t('groups.groupOrderCancelled');
    case 'locked':
      return t('groups.locked');
    case 'open':
      return t('groups.open');
    default:
      return status;
  }
}

function getStatusColor(status: string, colors: (typeof Colors)[keyof typeof Colors]): string {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'cancelled':
      return colors.destructive;
    case 'locked':
      return colors.primary;
    default:
      return colors.primary;
  }
}

export default function GroupOrderDetailsScreen() {
  const { id: idParam } = useLocalSearchParams();
  const sessionId = Number(idParam);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const { data: sessionCart, isLoading, error } = useGroupOrderDetail(sessionId);

  const handleCopyLink = useCallback(async () => {
    const url = `${GROUP_ORDER_WEB_URL}/en/group-order/${sessionId}`;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sessionId]);

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

  const restaurantImage = resolveImageUrl(sessionCart.restaurant.image_url);
  const statusColor = getStatusColor(sessionCart.status, colors);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
          <DirectionalIcon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {t('groups.viewOrderDetails')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Panel */}
        <View style={[styles.infoPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            {restaurantImage && <Image source={restaurantImage} style={styles.restaurantImage} contentFit="cover" />}
            <View style={styles.infoMain}>
              <View style={styles.nameRow}>
                <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
                  {sessionCart.restaurant.name}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel(sessionCart.status, t)}
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="storefront-outline" size={14} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {t('groups.host')}: {sessionCart.host.name}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {new Date(sessionCart.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <Button variant="outline" onPress={handleCopyLink} style={styles.copyBtn}>
            <Ionicons
              name={copied ? 'checkmark' : 'link-outline'}
              size={16}
              color={copied ? colors.success : colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={{ color: copied ? colors.success : colors.primary, fontWeight: '700', fontSize: 14 }}>
              {copied ? t('groups.copied') : t('groups.copyLink')}
            </Text>
          </Button>
        </View>

        {/* Members & Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groups.members')}</Text>

          {sessionCart.members_summary.length > 0 ? (
            <View style={styles.memberCards}>
              {sessionCart.members_summary.map((member) => {
                const avatar = resolveImageUrl(member.user.profile_image);
                const initials = member.user.name.charAt(0).toUpperCase();

                return (
                  <View
                    key={member.user.id}
                    style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.memberHeader, { borderBottomColor: colors.border }]}>
                      <View style={styles.memberUserBlock}>
                        {avatar ? (
                          <Image source={avatar} style={styles.memberAvatar} contentFit="cover" />
                        ) : (
                          <View style={[styles.memberAvatarFallback, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.memberInitials, { color: colors.primary }]}>{initials}</Text>
                          </View>
                        )}
                        <Text style={[styles.memberName, { color: colors.text }]}>
                          {member.user.name}
                          {member.user.is_guest ? ` (${t('groups.guest')})` : ''}
                          {member.user.id === sessionCart.host.id && !member.user.is_guest
                            ? ` (${t('groups.host')})`
                            : ''}
                        </Text>
                      </View>
                      <Text style={[styles.memberTotal, { color: colors.text }]}>
                        EGP {member.user_total.toFixed(2)}
                      </Text>
                    </View>

                    {member.items.length === 0 ? (
                      <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                        {t('groups.noItemsYet')}
                      </Text>
                    ) : (
                      <View style={styles.itemList}>
                        {member.items.map((cartItem) => (
                          <View key={cartItem.id} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                              <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                                {cartItem.item.title}
                              </Text>
                              <View style={styles.itemMetaRow}>
                                <Text style={[styles.itemQty, { color: colors.primary }]}>
                                  Qty: {cartItem.quantity}
                                </Text>
                                <Text style={[styles.itemUnitPrice, { color: colors.textSecondary }]}>
                                  Unit Price: EGP {cartItem.unit_price.toFixed(2)}
                                </Text>
                              </View>
                              {cartItem.notes ? (
                                <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>
                                  Note: {cartItem.notes}
                                </Text>
                              ) : null}
                            </View>
                            <Text style={[styles.itemTotal, { color: colors.text }]}>
                              EGP {cartItem.total_price.toFixed(2)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('groups.noItemsYet')}
            </Text>
          )}
        </View>

        {/* Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Status</Text>
            <Text style={[styles.summaryValue, { color: colors.primary, textTransform: 'uppercase' }]}>
              {sessionCart.status}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Participants</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {sessionCart.members_summary.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Items Ordered</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalItems}</Text>
          </View>
          <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.grandTotalValue, { color: colors.text }]}>
              EGP {sessionCart.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.lg,
  },
  infoPanel: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  restaurantImage: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
  },
  infoMain: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '800',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  memberCards: {
    gap: Spacing.md,
  },
  memberCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  memberUserBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  memberAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitials: {
    fontSize: 12,
    fontWeight: '800',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  memberTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  noItemsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  itemList: {
    gap: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemQty: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemUnitPrice: {
    fontSize: 11,
  },
  itemNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    backgroundColor: 'transparent',
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  summaryCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '900',
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
