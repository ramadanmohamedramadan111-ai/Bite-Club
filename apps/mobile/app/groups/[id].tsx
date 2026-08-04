import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import {
  useGroupDetail,
  useFriends,
  useAddGroupMember,
  useRemoveGroupMember,
  usePromoteGroupMember,
  useDemoteGroupMember,
} from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';
import type { GroupMember, SocialUser } from '@/lib/types';

export default function GroupDetailScreen() {
  const { id: idParam } = useLocalSearchParams();
  const groupId = Number(idParam);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const { user: currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');

  const { data: group, isLoading, error } = useGroupDetail(groupId);
  const { data: friendsData, isLoading: isLoadingFriends } = useFriends(1, 50, friendSearch);

  const addMemberMutation = useAddGroupMember(groupId);
  const removeMemberMutation = useRemoveGroupMember(groupId);
  const promoteMemberMutation = usePromoteGroupMember(groupId);
  const demoteMemberMutation = useDemoteGroupMember(groupId);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.text }]}>{t('groups.groupNotFound')}</Text>
        <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
          {t('groups.groupNotFoundDesc')}
        </Text>
        <Button variant="outline" onPress={() => router.back()} style={styles.backBtn}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  const currentMember = group.members.find((m) => m.id === currentUser?.id);
  const isOwner = currentUser?.id === group.owner.id;
  const isAdmin = currentMember?.role === 'admin';
  const hasEditRights = isOwner || isAdmin;

  // Filter members based on search
  const filteredMembers = group.members.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  // Filter friends who are not already in the group
  const nonGroupFriends = (friendsData?.items ?? []).filter(
    (friend) => !group.members.some((m) => m.id === friend.id)
  );

  const handleMemberPress = (member: GroupMember) => {
    // If pressing themselves or they don't have rights, or target is the owner, do nothing
    if (member.id === currentUser?.id || !hasEditRights || member.id === group.owner.id) {
      return;
    }

    const options = [];

    // Promote/Demote logic
    if (isOwner) {
      if (member.role === 'member') {
        options.push({
          text: t('groups.promoteToAdmin'),
          onPress: () => {
            promoteMemberMutation.mutate(member.id, {
              onSuccess: () => Alert.alert(t('createPost.success')),
              onError: (err) => Alert.alert(t('common.genericError'), err.message),
            });
          },
        });
      } else if (member.role === 'admin') {
        options.push({
          text: t('groups.demoteToMember'),
          onPress: () => {
            demoteMemberMutation.mutate(member.id, {
              onSuccess: () => Alert.alert(t('createPost.success')),
              onError: (err) => Alert.alert(t('common.genericError'), err.message),
            });
          },
        });
      }
    }

    // Remove logic
    options.push({
      text: t('groups.removeFromGroup'),
      style: 'destructive' as const,
      onPress: () => {
        Alert.alert(t('groups.removeFromGroup') + '?', '', [
          { text: t('createPost.cancel'), style: 'cancel' },
          {
            text: t('groups.removeFromGroup'),
            style: 'destructive',
            onPress: () => {
              removeMemberMutation.mutate(member.id, {
                onSuccess: () => Alert.alert(t('createPost.success')),
                onError: (err) => Alert.alert(t('common.genericError'), err.message),
              });
            },
          },
        ]);
      },
    });

    options.push({ text: t('createPost.cancel'), style: 'cancel' as const });

    Alert.alert(member.full_name, `@${member.username}`, options);
  };

  const handleAddMember = (friendId: number) => {
    addMemberMutation.mutate(friendId, {
      onSuccess: () => {
        Alert.alert(t('createPost.success'));
      },
      onError: (err) => {
        Alert.alert(t('common.genericError'), err.message);
      },
    });
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
        {hasEditRights ? (
          <Pressable onPress={() => setIsAddModalOpen(true)} style={styles.addIconBtn}>
            <Ionicons name="person-add-outline" size={22} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.addIconBtn} />
        )}
      </View>

      {/* Group Info Card */}
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
            <Text style={[styles.ownerText, { color: colors.textSecondary }]}>
              {t('groups.owner')}: <Text style={{ fontWeight: '700', color: colors.text }}>{group.owner.full_name}</Text>
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
          value="members"
          onChange={(value) => {
            if (value === 'settings') router.replace(`/groups/${groupId}/settings`);
            if (value === 'history') router.replace(`/groups/${groupId}/history`);
          }}
        />
      </View>

      {/* Search Input for Members */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder={t('common.search')}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const avatar = resolveImageUrl(item.profile_image);
          const memberInitials = item.full_name?.charAt(0).toUpperCase() ?? '?';
          const isSelf = item.id === currentUser?.id;
          const isMemberOwner = item.id === group.owner.id;

          return (
            <Pressable
              onPress={() => handleMemberPress(item)}
              style={({ pressed }) => [
                styles.memberCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && hasEditRights && !isSelf && !isMemberOwner && { opacity: 0.8 },
              ]}
            >
              <View style={styles.memberInfo}>
                {avatar ? (
                  <Image source={avatar} style={styles.memberAvatar} contentFit="cover" transition={150} />
                ) : (
                  <View style={[styles.memberAvatarFallback, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.memberFallbackText, { color: colors.primary }]}>
                      {memberInitials}
                    </Text>
                  </View>
                )}
                <View style={styles.nameBlock}>
                  <Text style={[styles.fullName, { color: colors.text }]}>
                    {item.full_name} {isSelf && `(${t('groups.you')})`}
                  </Text>
                  <Text style={[styles.username, { color: colors.textSecondary }]}>
                    @{item.username}
                  </Text>
                </View>
              </View>

              <View style={styles.badgeRow}>
                {isMemberOwner ? (
                  <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.roleText, { color: colors.primary }]}>{t('groups.owner')}</Text>
                  </View>
                ) : item.role === 'admin' ? (
                  <View style={[styles.roleBadge, { backgroundColor: colors.success + '15' }]}>
                    <Text style={[styles.roleText, { color: colors.success }]}>{t('groups.admin')}</Text>
                  </View>
                ) : null}

                {hasEditRights && !isSelf && !isMemberOwner && (
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* Add Member Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('friends.addFriend')}</Text>
              <Pressable onPress={() => setIsAddModalOpen(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.friendSearchWrap}>
              <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  placeholder={t('common.search')}
                  placeholderTextColor={colors.textSecondary}
                  value={friendSearch}
                  onChangeText={setFriendSearch}
                  style={[styles.searchInput, { color: colors.text }]}
                />
              </View>
            </View>

            {isLoadingFriends ? (
              <View style={styles.modalCenter}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : nonGroupFriends.length === 0 ? (
              <View style={styles.modalCenter}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('friends.noUsers')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={nonGroupFriends}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.friendsList}
                renderItem={({ item }) => {
                  const avatar = resolveImageUrl(item.profile_image);
                  const friendInitials = item.full_name?.charAt(0).toUpperCase() ?? '?';
                  const isAdding = addMemberMutation.isPending && addMemberMutation.variables === item.id;

                  return (
                    <View style={[styles.friendItem, { borderBottomColor: colors.border }]}>
                      <View style={styles.friendInfo}>
                        {avatar ? (
                          <Image source={avatar} style={styles.friendAvatar} />
                        ) : (
                          <View style={[styles.friendAvatarFallback, { backgroundColor: colors.muted }]}>
                            <Text style={[styles.friendFallbackText, { color: colors.primary }]}>
                              {friendInitials}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Text style={[styles.friendName, { color: colors.text }]}>{item.full_name}</Text>
                          <Text style={[styles.friendUser, { color: colors.textSecondary }]}>@{item.username}</Text>
                        </View>
                      </View>

                      <Button
                        variant="default"
                        size="sm"
                        fullWidth={false}
                        loading={isAdding}
                        onPress={() => handleAddMember(item.id)}
                      >
                        <Ionicons name="add" size={16} color={colors.primaryForeground} />
                      </Button>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
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
    marginHorizontal: Spacing.md,
  },
  addIconBtn: {
    padding: Spacing.xs,
    width: 32,
    alignItems: 'center',
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
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
  },
  bannerAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerFallbackText: {
    fontSize: 26,
    fontWeight: '800',
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerName: {
    fontSize: 18,
    fontWeight: '800',
  },
  bannerDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  ownerText: {
    fontSize: 11,
    marginTop: 2,
  },
  segmentedWrap: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  searchWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
  },
  memberAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberFallbackText: {
    fontSize: 16,
    fontWeight: '800',
  },
  nameBlock: {
    gap: 1,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '700',
  },
  username: {
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
  backBtn: {
    marginTop: Spacing.xl,
    minWidth: 120,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    height: '75%',
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
  friendSearchWrap: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  modalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendsList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
  },
  friendAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendFallbackText: {
    fontSize: 16,
    fontWeight: '800',
  },
  friendName: {
    fontSize: 14,
    fontWeight: '700',
  },
  friendUser: {
    fontSize: 11,
  },
});
