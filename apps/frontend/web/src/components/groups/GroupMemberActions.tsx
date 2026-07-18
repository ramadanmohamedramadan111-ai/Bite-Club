'use client';

import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const actions: React.ReactNode[] = [];

  if (isOwner) {
    if (targetRole === 'member') {
      actions.push(
        <DropdownMenuItem
          key="promote"
          disabled={disabledCondition}
          onClick={() =>
            promoteMember({ user_id: memberId, group_id: groupId })
          }>
          Promote to admin
        </DropdownMenuItem>,
      );

      actions.push(
        <DropdownMenuItem
          key="remove"
          disabled={disabledCondition}
          className="text-destructive focus:text-destructive"
          onClick={() =>
            removeMember({ user_id: memberId, group_id: groupId })
          }>
          Remove from group
        </DropdownMenuItem>,
      );
    }

    if (targetRole === 'admin') {
      actions.push(
        <DropdownMenuItem
          key="demote"
          disabled={disabledCondition}
          onClick={() =>
            demoteMember({ user_id: memberId, group_id: groupId })
          }>
          Demote to member
        </DropdownMenuItem>,
      );

      actions.push(
        <DropdownMenuItem
          key="remove"
          disabled={disabledCondition}
          className="text-destructive focus:text-destructive"
          onClick={() =>
            removeMember({ user_id: memberId, group_id: groupId })
          }>
          Remove from group
        </DropdownMenuItem>,
      );
    }
  }

  if (isAdmin && targetRole === 'member') {
    actions.push(
      <DropdownMenuItem
        key="remove"
        disabled={disabledCondition}
        className="text-destructive focus:text-destructive"
        onClick={() => removeMember({ user_id: memberId, group_id: groupId })}>
        Remove from group
      </DropdownMenuItem>,
    );
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabledCondition}>
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
    </DropdownMenu>
  );
}
