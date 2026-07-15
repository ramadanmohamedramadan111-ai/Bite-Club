'use client';

import { useState } from 'react';

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
      title: 'Remove friend?',
      description: `Are you sure you want to remove ${user.full_name} from your friends?`,
      confirmText: 'Remove',
    },

    cancelRequest: {
      title: 'Cancel request?',
      description: `Are you sure you want to cancel your request to ${user.full_name}?`,
      confirmText: 'Cancel Request',
    },

    unfollow: {
      title: 'Unfollow user?',
      description: `Are you sure you want to unfollow ${user.full_name}?`,
      confirmText: 'Unfollow',
    },

    unblock: {
      title: 'Unblock user?',
      description: `Are you sure you want to unblock ${user.full_name}?`,
      confirmText: 'Unblock',
    },

    block: {
      title: 'Block user?',
      description: `Are you sure you want to block ${user.full_name}?`,
      confirmText: 'Block',
    },
  };

  return (
    <>
      {tab === 'friends' && (
        <Button
          disabled={isExecutingRemoveFriend}
          variant="destructive"
          onClick={() => setAction('removeFriend')}>
          Remove Friend
        </Button>
      )}

      {tab === 'received' && (
        <div className="flex gap-2">
          <Button
            disabled={isExecutingAcceptFriendRequest}
            onClick={() => acceptFriendRequest(user.id)}>
            Accept
          </Button>

          <Button
            disabled={isExecutingRejectFriendRequest}
            variant="destructive"
            onClick={() => rejectFriendRequest(user.id)}>
            Reject
          </Button>
        </div>
      )}

      {tab === 'sent' && (
        <Button
          variant="outline"
          disabled={isExecutingCancelFriendRequest}
          onClick={() => setAction('cancelRequest')}>
          Cancel Request
        </Button>
      )}

      {tab === 'discover' && (
        <Button
          variant="outline"
          disabled={isExecutingSendFriendRequest}
          onClick={() => sendFriendRequest(user.id)}>
          Add as friend
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

