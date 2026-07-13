'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { FriendsTab, SocialUser } from '@/types/social/friends';

import ConfirmDialog from '@/components/shared/ConfirmationDialog';
import { useSocialStore } from '@/stores/social';

interface Props {
  user: SocialUser;

  tab: FriendsTab;
}

type Action =
  | 'removeFriend'
  | 'cancelRequest'
  | 'unfollow'
  | 'unblock'
  | 'block'
  | null;

export default function UserActions({ user, tab }: Props) {
  const [action, setAction] = useState<Action>(null);
  const {
    removeFriend,
    cancelFriendRequest,
    unfollowUser,
    unblockUser,
    blockUser,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    followUser,
  } = useSocialStore();

  const relationships = user.relationships;

  function executeAction() {
    if (!action) return;

    switch (action) {
      case 'removeFriend':
        removeFriend(user.id);
        break;
      case 'cancelRequest':
        cancelFriendRequest(user.id);
        break;
      case 'unfollow':
        unfollowUser(user.id);
        break;
      case 'unblock':
        unblockUser(user.id);
        break;
      case 'block':
        blockUser(user.id);
        break;
    }

    setAction(null);
  }

  const dialogConfig = {
    removeFriend: {
      title: 'Remove friend?',
      description: `Are you sure you want to remove ${user.name} from your friends?`,
      confirmText: 'Remove',
    },

    cancelRequest: {
      title: 'Cancel request?',
      description: `Are you sure you want to cancel your request to ${user.name}?`,
      confirmText: 'Cancel Request',
    },

    unfollow: {
      title: 'Unfollow user?',
      description: `Are you sure you want to unfollow ${user.name}?`,
      confirmText: 'Unfollow',
    },

    unblock: {
      title: 'Unblock user?',
      description: `Are you sure you want to unblock ${user.name}?`,
      confirmText: 'Unblock',
    },

    block: {
      title: 'Block user?',
      description: `Are you sure you want to block ${user.name}?`,
      confirmText: 'Block',
    },
  };

  return (
    <>
      {tab === 'friends' && (
        <Button variant="destructive" onClick={() => setAction('removeFriend')}>
          Remove Friend
        </Button>
      )}

      {tab === 'received' && (
        <div className="flex gap-2">
          <Button onClick={() => acceptFriendRequest(user.id)}>Accept</Button>

          <Button
            variant="destructive"
            onClick={() => rejectFriendRequest(user.id)}
          >
            Reject
          </Button>
        </div>
      )}

      {tab === 'sent' && (
        <Button variant="outline" onClick={() => setAction('cancelRequest')}>
          Cancel Request
        </Button>
      )}

      {tab === 'following' && (
        <Button variant="outline" onClick={() => setAction('unfollow')}>
          Unfollow
        </Button>
      )}

      {tab === 'blocked' && (
        <Button onClick={() => setAction('unblock')}>Unblock</Button>
      )}

      {tab === 'discover' && (
        <div className="flex gap-2">
          {!relationships.isFriend && !relationships.hasSentRequest && (
            <Button onClick={() => sendFriendRequest(user.id)}>
              Add Friend
            </Button>
          )}

          {relationships.hasSentRequest && (
            <Button variant="outline" onClick={() => setAction('cancelRequest')}>
              Cancel Request
            </Button>
          )}

          {!relationships.isFollowing && (
            <Button variant="outline" onClick={() => followUser(user.id)}>
              Follow
            </Button>
          )}

          {relationships.isFollowing && (
            <Button variant="outline" onClick={() => setAction('unfollow')}>
              Unfollow
            </Button>
          )}

          <Button variant="destructive" onClick={() => setAction('block')}>
            Block
          </Button>
        </div>
      )}

      {action && (
        <ConfirmDialog
          open={!!action}
          onOpenChange={(open) => {
            if (!open) {
              setAction(null);
            }
          }}
          title={dialogConfig[action].title}
          description={dialogConfig[action].description}
          confirmText={dialogConfig[action].confirmText}
          onConfirm={executeAction}
        />
      )}
    </>
  );
}
