import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getApiErrorMessage, getApiMessage } from '@/lib/api';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
  useSendGift,
} from '@/lib/queries';
import type { SocialUser } from '@/lib/types';

export type FriendTab = 'friends' | 'received' | 'sent' | 'discover';

export function UserCard({ user, tab }: { user: SocialUser; tab: FriendTab }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const { t } = useI18n();

  const sendMutation = useSendFriendRequest();
  const cancelMutation = useCancelFriendRequest();
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const removeMutation = useRemoveFriend();
  const sendGiftMutation = useSendGift();
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftPoints, setGiftPoints] = useState('');
  const [giftNote, setGiftNote] = useState('');

  const avatar = resolveImageUrl(user.profile_image);
  const initials = user.full_name?.charAt(0).toUpperCase() ?? '?';

  function confirmRemove() {
    Alert.alert(t('friends.removeFriendTitle'), t('friends.removeFriendDesc', { name: user.full_name }), [
      { text: t('friends.keep'), style: 'cancel' },
      {
        text: t('friends.removeFriendConfirm'),
        style: 'destructive',
        onPress: () => {
          removeMutation.mutate(user.id, {
            onSuccess: (response) => Alert.alert(getApiMessage(response, t('friends.friendRemoved'))),
            onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.error'))),
          });
        },
      },
    ]);
  }

  function confirmCancel() {
    Alert.alert(t('friends.cancelRequestTitle'), t('friends.cancelRequestDesc', { name: user.full_name }), [
      { text: t('friends.keep'), style: 'cancel' },
      {
        text: t('friends.cancelRequestConfirm'),
        style: 'destructive',
        onPress: () => {
          cancelMutation.mutate(user.id, {
            onSuccess: (response) => Alert.alert(getApiMessage(response, t('friends.requestCancelled'))),
            onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.error'))),
          });
        },
      },
    ]);
  }

  function sendRequest() {
    sendMutation.mutate(user.id, {
      onSuccess: (response) => Alert.alert(getApiMessage(response, t('friends.sentTo', { name: user.full_name }))),
      onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.error'))),
    });
  }

  function accept() {
    acceptMutation.mutate(user.id, {
      onSuccess: (response) => Alert.alert(getApiMessage(response, t('friends.requestAccepted'))),
      onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.error'))),
    });
  }

  function reject() {
    rejectMutation.mutate(user.id, {
      onSuccess: (response) => Alert.alert(getApiMessage(response, t('friends.requestRejected'))),
      onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.error'))),
    });
  }

  function closeGift() {
    if (sendGiftMutation.isPending) return;
    setGiftOpen(false);
    setGiftPoints('');
    setGiftNote('');
  }

  function sendGift() {
    const points = Number(giftPoints);
    if (!Number.isInteger(points) || points < 10) {
      Alert.alert(t('friends.giftMinimum'));
      return;
    }

    sendGiftMutation.mutate(
      { receiver_id: user.id, points, note: giftNote.trim() || undefined },
      {
        onSuccess: (response) => {
          setGiftOpen(false);
          setGiftPoints('');
          setGiftNote('');
          Alert.alert(getApiMessage(response, t('friends.giftSent', { username: user.username })));
        },
        onError: (error) => Alert.alert(getApiErrorMessage(error, t('friends.giftFailed'))),
      },
    );
  }

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.info}>
        {avatar ? (
          <View style={[styles.avatarWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Image source={avatar} style={styles.avatar} contentFit="cover" transition={150} />
          </View>
        ) : (
          <View style={[styles.avatarWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Text style={[styles.avatarInitials, { color: colors.primary }]}>{initials}</Text>
          </View>
        )}
        <View style={styles.nameBlock}>
          <Text style={[styles.fullName, { color: colors.text }]} numberOfLines={1}>
            {user.full_name}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>
            @{user.username}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {tab === 'friends' && (
          <View style={styles.friendActions}>
            <Button variant="outline" size="sm" fullWidth={false} style={styles.friendActionButton} onPress={() => setGiftOpen(true)}>
              {t('friends.sendGift')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              fullWidth={false}
              style={styles.friendActionButton}
              loading={removeMutation.isPending}
              onPress={confirmRemove}>
              {t('friends.removeFriend')}
            </Button>
          </View>
        )}
        {tab === 'received' && (
          <View style={styles.actionRow}>
            <Button
              variant="default"
              size="sm"
              fullWidth={false}
              style={styles.requestActionButton}
              loading={acceptMutation.isPending}
              onPress={accept}>
              {t('friends.accept')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              fullWidth={false}
              style={styles.requestActionButton}
              loading={rejectMutation.isPending}
              onPress={reject}>
              {t('friends.reject')}
            </Button>
          </View>
        )}
        {tab === 'sent' && (
          <Button variant="outline" size="sm" loading={cancelMutation.isPending} onPress={confirmCancel}>
            {t('friends.cancelRequest')}
          </Button>
        )}
        {tab === 'discover' && (
          <Button variant="outline" size="sm" loading={sendMutation.isPending} onPress={sendRequest}>
            {t('friends.addFriend')}
          </Button>
        )}
        </View>
      </View>

      <Modal visible={giftOpen} transparent animationType="fade" onRequestClose={closeGift}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={[styles.giftModal, { backgroundColor: colors.card }]}>
            <View style={styles.giftHeader}>
              <View style={[styles.giftIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name="gift-outline" size={22} color={colors.primary} />
              </View>
              <Pressable onPress={closeGift} hitSlop={10} accessibilityRole="button">
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={[styles.giftTitle, { color: colors.text }]}>{t('friends.sendGift')}</Text>
            <Text style={[styles.giftDescription, { color: colors.textSecondary }]}>
              {t('friends.sendGiftDesc', { name: user.full_name, username: user.username })}
            </Text>
            <Text style={[styles.giftLabel, { color: colors.text }]}>{t('friends.giftPoints')}</Text>
            <TextInput
              value={giftPoints}
              onChangeText={setGiftPoints}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder={t('friends.giftPointsPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              editable={!sendGiftMutation.isPending}
              style={[styles.giftInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
            <Text style={[styles.giftLabel, { color: colors.text }]}>{t('friends.giftNote')}</Text>
            <TextInput
              value={giftNote}
              onChangeText={setGiftNote}
              placeholder={t('friends.giftNotePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              editable={!sendGiftMutation.isPending}
              maxLength={255}
              style={[styles.giftInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            />
            <View style={styles.giftActions}>
              <Button variant="outline" fullWidth={false} style={styles.giftActionButton} onPress={closeGift} disabled={sendGiftMutation.isPending}>
                {t('friends.keep')}
              </Button>
              <Button fullWidth={false} style={styles.giftActionButton} loading={sendGiftMutation.isPending} onPress={sendGift}>
                {t('friends.sendGift')}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
  },
  username: {
    fontSize: 12,
  },
  actions: {
    alignSelf: 'stretch',
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  friendActions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  friendActionButton: {
    flex: 1,
  },
  requestActionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  giftModal: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  giftIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  giftDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  giftLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  giftInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  giftActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  giftActionButton: {
    flex: 1,
  },
});
