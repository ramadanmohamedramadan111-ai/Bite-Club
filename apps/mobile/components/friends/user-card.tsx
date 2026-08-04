import { Image } from 'expo-image';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveImageUrl } from '@/lib/config';
import { useI18n } from '@/lib/i18n';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
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
            onSuccess: () => Alert.alert(t('friends.friendRemoved')),
            onError: () => Alert.alert(t('friends.error')),
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
            onSuccess: () => Alert.alert(t('friends.requestCancelled')),
            onError: () => Alert.alert(t('friends.error')),
          });
        },
      },
    ]);
  }

  function sendRequest() {
    sendMutation.mutate(user.id, {
      onSuccess: () => Alert.alert(t('friends.sentTo', { name: user.full_name })),
      onError: () => Alert.alert(t('friends.error')),
    });
  }

  function accept() {
    acceptMutation.mutate(user.id, {
      onSuccess: () => Alert.alert(t('friends.requestAccepted')),
      onError: () => Alert.alert(t('friends.error')),
    });
  }

  function reject() {
    rejectMutation.mutate(user.id, {
      onSuccess: () => Alert.alert(t('friends.requestRejected')),
      onError: () => Alert.alert(t('friends.error')),
    });
  }

  return (
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
          <Button
            variant="destructive"
            size="sm"
            loading={removeMutation.isPending}
            onPress={confirmRemove}>
            {t('friends.removeFriend')}
          </Button>
        )}
        {tab === 'received' && (
          <View style={styles.actionRow}>
            <Button variant="default" size="sm" loading={acceptMutation.isPending} onPress={accept}>
              {t('friends.accept')}
            </Button>
            <Button variant="destructive" size="sm" loading={rejectMutation.isPending} onPress={reject}>
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
    alignSelf: 'flex-start',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
