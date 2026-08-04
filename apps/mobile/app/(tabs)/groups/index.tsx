import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import { useGroups, useCreateGroup, useActiveGroupOrders } from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import type { GroupTypeSimplified, FormDataImage, ActiveGroupOrderSession } from '@/lib/types';

const PER_PAGE = 15;

export default function GroupsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupImage, setGroupImage] = useState<FormDataImage | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, refetch } = useGroups(page, PER_PAGE, debouncedSearch);
  const createGroupMutation = useCreateGroup();
  const activeOrdersQuery = useActiveGroupOrders();
  const activeSessions = activeOrdersQuery.data ?? [];

  const groups = data?.items ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('createPost.chooseImages'));
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setGroupImage({
          uri: asset.uri,
          name: asset.fileName ?? `group-${Date.now()}-${asset.uri.split('/').pop() ?? 'avatar.jpg'}`,
          type: asset.mimeType ?? 'image/jpeg',
        });
      }
    } catch {
      Alert.alert(t('common.genericError'));
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert(t('validation.restaurantNameMin')); // Simple fallback validation text or similar
      return;
    }

    createGroupMutation.mutate(
      {
        name: groupName,
        description: groupDesc,
        image: groupImage,
      },
      {
        onSuccess: () => {
          Alert.alert(t('createPost.success'));
          setIsCreateModalOpen(false);
          setGroupName('');
          setGroupDesc('');
          setGroupImage(null);
          refetch();
        },
        onError: (err) => {
          Alert.alert(t('createPost.failed'), err.message || t('common.genericError'));
        },
      }
    );
  };

  const renderActiveSessions = () => {
    if (activeSessions.length === 0) return null;

    return (
      <View style={[styles.activeSessionsCard, { backgroundColor: colors.success + '05', borderColor: colors.success + '15' }]}>
        <View style={styles.activeSessionsHeader}>
          <View style={styles.pulseDotWrapper}>
            <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.activeSessionsTitle, { color: colors.success }]}>
              {t('groups.activeGroupOrder')}
            </Text>
          </View>
          <View style={[styles.activeCountBadge, { backgroundColor: colors.success + '15' }]}>
            <Text style={[styles.activeCountText, { color: colors.success }]}>
              {activeSessions.length}
            </Text>
          </View>
        </View>

        <View style={styles.activeSessionsList}>
          {activeSessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() => router.push(`/group-order/${session.id}`)}
              style={({ pressed }) => [
                styles.activeSessionItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.85 }
              ]}
            >
              <View style={[styles.activeSessionIconWrap, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="cart-outline" size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activeSessionRest, { color: colors.text }]} numberOfLines={1}>
                  {session.restaurant_name}
                </Text>
                <View style={styles.activeSessionMetaRow}>
                  <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.activeSessionGroup, { color: colors.textSecondary }]} numberOfLines={1}>
                    {session.group_name}
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderGroupItem = ({ item }: { item: GroupTypeSimplified }) => {
    const avatar = resolveImageUrl(item.image_url);
    const initials = item.name.charAt(0).toUpperCase();

    return (
      <Pressable
        onPress={() => router.push(`/groups/${item.id}`)}
        style={({ pressed }) => [
          styles.groupCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={styles.cardHeader}>
          {avatar ? (
            <Image source={avatar} style={styles.groupAvatar} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.muted }]}>
              <Text style={[styles.fallbackText, { color: colors.primary }]}>{initials}</Text>
            </View>
          )}

          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.groupDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description || t('detail.noCategories')}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {item.members_count} {item.members_count === 1 ? t('groups.member') : t('groups.members')}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('groups.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('groups.subtitle')}</Text>
        </View>
        <Pressable
          onPress={() => setIsCreateModalOpen(true)}
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder={t('restaurants.searchPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroupItem}
          ListHeaderComponent={renderActiveSessions}
          ListEmptyComponent={() => (
            <View style={styles.centerEmpty}>
              <Ionicons name="people-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('groups.noGroups')}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            lastPage > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
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
                  disabled={page >= lastPage || isLoading}
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

      {/* Create Group Modal */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('groups.createTitle')}</Text>
              <Pressable onPress={() => setIsCreateModalOpen(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                {t('groups.createDesc')}
              </Text>

              {/* Avatar Selector */}
              <View style={styles.avatarPickerWrap}>
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.avatarPicker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  {groupImage ? (
                    <Image source={groupImage.uri} style={styles.pickedAvatar} />
                  ) : (
                    <View style={styles.avatarPickerPlaceholder}>
                      <Ionicons name="camera-outline" size={28} color={colors.primary} />
                      <Text style={[styles.pickerText, { color: colors.textSecondary }]}>
                        {t('groups.imageLabel')}
                      </Text>
                    </View>
                  )}
                </Pressable>
                {groupImage && (
                  <Pressable
                    onPress={() => setGroupImage(null)}
                    style={[styles.removeImageBtn, { backgroundColor: colors.destructive }]}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.destructiveForeground} />
                  </Pressable>
                )}
              </View>

              {/* Inputs */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('groups.nameLabel')}</Text>
                <TextInput
                  placeholder={t('groups.namePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={groupName}
                  onChangeText={setGroupName}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('groups.descLabel')}</Text>
                <TextInput
                  placeholder={t('groups.descPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={groupDesc}
                  onChangeText={setGroupDesc}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                />
              </View>

              <Button
                variant="default"
                loading={createGroupMutation.isPending}
                onPress={handleCreateGroup}
                style={styles.submitBtn}
              >
                {t('groups.createTitle')}
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    maxWidth: '80%',
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  groupCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 22,
    fontWeight: '800',
  },
  groupInfo: {
    flex: 1,
    gap: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
  },
  groupDesc: {
    fontSize: 13,
    lineHeight: 17,
  },
  cardFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeModalBtn: {
    padding: Spacing.xs,
  },
  modalBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  avatarPickerWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  avatarPicker: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarPickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pickerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pickedAvatar: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formGroup: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  centerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
    gap: Spacing.md,
    marginTop: Spacing['3xl'],
  },
  activeSessionsCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  activeSessionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pulseDotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeSessionsTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activeCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  activeCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activeSessionsList: {
    gap: Spacing.sm,
  },
  activeSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  activeSessionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSessionRest: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeSessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activeSessionGroup: {
    fontSize: 11,
  },
});
