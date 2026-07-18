'use client';

import { useState } from 'react';
import { MoreHorizontal, ShieldCheck, ShieldAlert, UserMinus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';

import {
  removeGroupMemberAction,
  promoteGroupMemberAction,
  demoteGroupMemberAction,
} from '@/actions/groups';

import { GroupRole } from '@/types/groups/groups';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

type Props = {
  groupId: number;
  memberId: number;
  currentUserRole: GroupRole;
  targetRole: GroupRole;
};

export default function GroupMemberActions({
  groupId,
  memberId,
  currentUserRole,
  targetRole,
}: Props) {
  const [activeAction, setActiveAction] = useState<'promote' | 'demote' | 'remove' | null>(null);

  const { execute: removeMember, isExecuting: isRemoving } = useAction(
    removeGroupMemberAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: promoteMember, isExecuting: isPromoting } = useAction(
    promoteGroupMemberAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: demoteMember, isExecuting: isDemoting } = useAction(
    demoteGroupMemberAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const disabledCondition = isRemoving || isDemoting || isPromoting;

  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const isMember = currentUserRole === 'member';

  if (isMember) {
    return null;
  }

  const dialogConfig = {
    promote: {
      title: 'Promote to admin?',
      description: 'Are you sure you want to promote this member to an administrator? They will have access to manage group settings and members.',
      confirmText: 'Promote',
      onConfirm: () => promoteMember({ user_id: memberId, group_id: groupId }),
    },
    demote: {
      title: 'Demote to member?',
      description: 'Are you sure you want to demote this administrator to a regular member? They will lose administrative privileges.',
      confirmText: 'Demote',
      onConfirm: () => demoteMember({ user_id: memberId, group_id: groupId }),
    },
    remove: {
      title: 'Remove from group?',
      description: 'Are you sure you want to remove this member from the group? They will no longer be able to access the group cart or participate in group orders.',
      confirmText: 'Remove',
      onConfirm: () => removeMember({ user_id: memberId, group_id: groupId }),
    },
  };

  const actions: React.ReactNode[] = [];

  if (isOwner) {
    if (targetRole === 'member') {
      actions.push(
        <DropdownMenuItem
          key="promote"
          disabled={disabledCondition}
          onClick={() => setActiveAction('promote')}>
          <ShieldCheck />
          <span>Promote to admin</span>
        </DropdownMenuItem>,
      );

      actions.push(
        <DropdownMenuItem
          key="remove"
          disabled={disabledCondition}
          variant="destructive"
          onClick={() => setActiveAction('remove')}>
          <UserMinus />
          <span>Remove from group</span>
        </DropdownMenuItem>,
      );
    }

    if (targetRole === 'admin') {
      actions.push(
        <DropdownMenuItem
          key="demote"
          disabled={disabledCondition}
          onClick={() => setActiveAction('demote')}>
          <ShieldAlert />
          <span>Demote to member</span>
        </DropdownMenuItem>,
      );

      actions.push(
        <DropdownMenuItem
          key="remove"
          disabled={disabledCondition}
          variant="destructive"
          onClick={() => setActiveAction('remove')}>
          <UserMinus />
          <span>Remove from group</span>
        </DropdownMenuItem>,
      );
    }
  }

  if (isAdmin && targetRole === 'member') {
    actions.push(
      <DropdownMenuItem
        key="remove"
        disabled={disabledCondition}
        variant="destructive"
        onClick={() => setActiveAction('remove')}>
        <UserMinus />
        <span>Remove from group</span>
      </DropdownMenuItem>,
    );
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabledCondition}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
      </DropdownMenu>

      {activeAction && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setActiveAction(null)}
          title={dialogConfig[activeAction].title}
          description={dialogConfig[activeAction].description}
          confirmText={dialogConfig[activeAction].confirmText}
          onConfirm={dialogConfig[activeAction].onConfirm}
        />
      )}
    </>
  );
}
