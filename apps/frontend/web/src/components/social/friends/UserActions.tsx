'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { FriendsTab, SocialUser } from '@/types/social/friends';

import ConfirmDialog from '@/components/shared/ConfirmationDialog';

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

  const relationships = user.relationships;

  function executeAction() {
    console.log('Executing:', action, 'for user:', user.id);

    // Later:
    // mutation.mutate({
    //    userId:user.id
    // })
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
          <Button>Accept</Button>

          <Button variant="destructive">Reject</Button>
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
            <Button>Add Friend</Button>
          )}

          {!relationships.isFollowing && (
            <Button variant="outline">Follow</Button>
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

