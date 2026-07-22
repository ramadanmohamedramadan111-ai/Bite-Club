'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { FriendResponseType, FriendsTabType } from '@/types/social/friends';

import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { useAction } from 'next-safe-action/hooks';
import {
  acceptFriendRequestAction,
  cancelFriendRequestAction,
  rejectFriendRequestAction,
  removeFriendRequestAction,
  sendFriendRequestAction,
} from '@/actions/friends';
import { toast } from 'sonner';

interface Props {
  user: FriendResponseType;

  tab: FriendsTabType;
}

type Action = 'removeFriend' | 'cancelRequest' | null;

export default function UserActions({ user, tab }: Props) {
  const t = useTranslations('friends');
  const [action, setAction] = useState<Action>(null);

  const actionCallbacks = {
    onSuccess: ({ data }: { data: { message: string } }) =>
      toast.success(data.message),

    onError: ({ error }: { error: any }) =>
      toast.error(error.serverError?.message),
  };

  const {
    execute: sendFriendRequest,
    isExecuting: isExecutingSendFriendRequest,
  } = useAction(sendFriendRequestAction, actionCallbacks);

  const {
    execute: cancelFriendRequest,
    isExecuting: isExecutingCancelFriendRequest,
  } = useAction(cancelFriendRequestAction, actionCallbacks);

  const {
    execute: rejectFriendRequest,
    isExecuting: isExecutingRejectFriendRequest,
  } = useAction(rejectFriendRequestAction, actionCallbacks);

  const { execute: removeFriend, isExecuting: isExecutingRemoveFriend } =
    useAction(removeFriendRequestAction, actionCallbacks);

  const {
    execute: acceptFriendRequest,
    isExecuting: isExecutingAcceptFriendRequest,
  } = useAction(acceptFriendRequestAction, actionCallbacks);

  function executeAction() {
    if (!action) return;

    switch (action) {
      case 'removeFriend':
        removeFriend(user.id);
        break;
      case 'cancelRequest':
        cancelFriendRequest(user.id);
        break;
    }

    setAction(null);
  }

  const dialogConfig = {
    removeFriend: {
      title: t('removeFriendTitle'),
      description: t('removeFriendDesc', { name: user.full_name }),
      confirmText: t('removeFriendConfirm'),
    },

    cancelRequest: {
      title: t('cancelRequestTitle'),
      description: t('cancelRequestDesc', { name: user.full_name }),
      confirmText: t('cancelRequestConfirm'),
    },

    unfollow: {
      title: t('unfollowTitle'),
      description: t('unfollowDesc', { name: user.full_name }),
      confirmText: t('unfollowConfirm'),
    },

    unblock: {
      title: t('unblockTitle'),
      description: t('unblockDesc', { name: user.full_name }),
      confirmText: t('unblockConfirm'),
    },

    block: {
      title: t('blockTitle'),
      description: t('blockDesc', { name: user.full_name }),
      confirmText: t('blockConfirm'),
    },
  };

  return (
    <>
      {tab === 'friends' && (
        <Button
          disabled={isExecutingRemoveFriend}
          variant="destructive"
          onClick={() => setAction('removeFriend')}>
          {t('removeFriend')}
        </Button>
      )}

      {tab === 'received' && (
        <div className="flex gap-2">
          <Button
            disabled={isExecutingAcceptFriendRequest}
            onClick={() => acceptFriendRequest(user.id)}>
            {t('accept')}
          </Button>

          <Button
            disabled={isExecutingRejectFriendRequest}
            variant="destructive"
            onClick={() => rejectFriendRequest(user.id)}>
            {t('reject')}
          </Button>
        </div>
      )}

      {tab === 'sent' && (
        <Button
          variant="outline"
          disabled={isExecutingCancelFriendRequest}
          onClick={() => setAction('cancelRequest')}>
          {t('cancelRequest')}
        </Button>
      )}

      {tab === 'discover' && (
        <Button
          variant="outline"
          disabled={isExecutingSendFriendRequest}
          onClick={() => sendFriendRequest(user.id)}>
          {t('addFriend')}
        </Button>
      )}

      {action && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setAction(null)}
          title={dialogConfig[action].title}
          description={dialogConfig[action].description}
          confirmText={dialogConfig[action].confirmText}
          onConfirm={executeAction}
        />
      )}
    </>
  );
}

