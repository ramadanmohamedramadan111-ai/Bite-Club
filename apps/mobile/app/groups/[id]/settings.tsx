import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/lib/i18n';
import {
  useGroupDetail,
  useUpdateGroup,
  useToggleGroupInvite,
  useDeleteGroup,
  useLeaveGroup,
} from '@/lib/queries';
import { resolveImageUrl } from '@/lib/config';
import { useAuthStore } from '@/stores/auth';
import type { FormDataImage } from '@/lib/types';

export default function GroupSettingsScreen() {
  const { id: idParam } = useLocalSearchParams();
  const groupId = Number(idParam);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();
  const { user: currentUser } = useAuthStore();

  const { data: group, isLoading, error } = useGroupDetail(groupId);

  const updateGroupMutation = useUpdateGroup(groupId);
  const toggleInviteMutation = useToggleGroupInvite(groupId);
  const deleteGroupMutation = useDeleteGroup(groupId);
  const leaveGroupMutation = useLeaveGroup(groupId);

  // Edit Group Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<FormDataImage | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load defaults
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setImagePreview(resolveImageUrl(group.image_url) ?? null);
    }
  }, [group]);

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

  const handlePickImage = async () => {
    if (!hasEditRights) return;
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
        setImage({
          uri: asset.uri,
          name: asset.fileName ?? `group-${Date.now()}-${asset.uri.split('/').pop() ?? 'avatar.jpg'}`,
          type: asset.mimeType ?? 'image/jpeg',
        });
        setImagePreview(asset.uri);
      }
    } catch {
      Alert.alert(t('common.genericError'));
    }
  };

  const handleUpdate = () => {
    if (!name.trim()) {
      Alert.alert(t('validation.restaurantNameMin'));
      return;
    }

    updateGroupMutation.mutate(
      {
        name,
        description,
        image,
      },
      {
        onSuccess: () => {
          Alert.alert(t('createPost.success'));
        },
        onError: (err) => {
          Alert.alert(t('createPost.failed'), err.message || t('common.genericError'));
        },
      }
    );
  };

  const handleToggleInvite = (value: boolean) => {
    toggleInviteMutation.mutate(value, {
      onError: (err) => {
        Alert.alert(t('common.genericError'), err.message);
      },
    });
  };

  const handleCopyLink = async () => {
    const inviteLink = `https://biteclub.com/en/groups/invite/${group.invite_token}`;
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert(t('groups.inviteLinkCopied'), inviteLink);
  };

  const handleDelete = () => {
    Alert.alert(t('groups.deleteGroup') + '?', t('common.genericError'), [
      { text: t('createPost.cancel'), style: 'cancel' },
      {
        text: t('groups.deleteGroup'),
        style: 'destructive',
        onPress: () => {
          deleteGroupMutation.mutate(undefined, {
            onSuccess: () => {
              Alert.alert(t('createPost.success'));
              router.replace('/groups');
            },
            onError: (err) => {
              Alert.alert(t('common.genericError'), err.message);
            },
          });
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert(t('groups.leaveGroup') + '?', '', [
      { text: t('createPost.cancel'), style: 'cancel' },
      {
        text: t('groups.leaveGroup'),
        style: 'destructive',
        onPress: () => {
          leaveGroupMutation.mutate(undefined, {
            onSuccess: () => {
              Alert.alert(t('createPost.success'));
              router.replace('/groups');
            },
            onError: (err) => {
              Alert.alert(t('common.genericError'), err.message);
            },
          });
        },
      },
    ]);
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
          value="settings"
          onChange={(value) => {
            if (value === 'members') router.replace(`/groups/${groupId}`);
            if (value === 'history') router.replace(`/groups/${groupId}/history`);
          }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Edit form */}
          {hasEditRights && (
            <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groups.updateTitle')}</Text>

              {/* Avatar Selector */}
              <View style={styles.avatarPickerWrap}>
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.avatarPicker, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  {imagePreview ? (
                    <Image source={imagePreview} style={styles.pickedAvatar} />
                  ) : (
                    <View style={styles.avatarPickerPlaceholder}>
                      <Ionicons name="camera-outline" size={24} color={colors.primary} />
                      <Text style={[styles.pickerText, { color: colors.textSecondary }]}>
                        {t('groups.imageLabel')}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('groups.nameLabel')}</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('groups.descLabel')}</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
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
                loading={updateGroupMutation.isPending}
                onPress={handleUpdate}
                style={styles.saveBtn}
              >
                {t('restaurants.apply')}
              </Button>
            </View>
          )}

          {/* Invitation settings */}
          {hasEditRights && (
            <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('groups.inviteLink')}</Text>

              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  {t('groups.allowInviteLink')}
                </Text>
                <Switch
                  value={group.allow_join_by_link}
                  onValueChange={handleToggleInvite}
                  disabled={toggleInviteMutation.isPending}
                  thumbColor={Platform.OS === 'android' ? colors.primary : undefined}
                  trackColor={{ true: colors.primary + '80', false: colors.border }}
                />
              </View>

              {group.allow_join_by_link && (
                <Button variant="outline" onPress={handleCopyLink} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                    {t('groups.inviteLink')}
                  </Text>
                </Button>
              )}
            </View>
          )}

          {/* Danger Zone */}
          <View style={[styles.section, styles.dangerSection, { borderColor: colors.destructive + '40', backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.destructive }]}>Danger Zone</Text>

            {isOwner ? (
              <Button
                variant="destructive"
                loading={deleteGroupMutation.isPending}
                onPress={handleDelete}
              >
                {t('groups.deleteGroup')}
              </Button>
            ) : (
              <Button
                variant="destructive"
                loading={leaveGroupMutation.isPending}
                onPress={handleLeave}
              >
                {t('groups.leaveGroup')}
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  dangerSection: {
    borderWidth: 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  avatarPickerWrap: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  avatarPicker: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 10,
    fontWeight: '600',
  },
  pickedAvatar: {
    width: '100%',
    height: '100%',
  },
  formGroup: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 40,
    fontSize: 14,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    paddingVertical: Spacing.sm,
  },
  saveBtn: {
    marginTop: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    paddingRight: Spacing.md,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
