'use client';

import { Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { GroupType } from '@/types/groups/groups';
import GroupForm from './GroupForm';
import { useAction } from 'next-safe-action/hooks';
import {
  deleteGroupAction,
  leaveGroupAction,
  toggleJoinGroupAction,
} from '@/actions/groups';
import ConfirmDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  group: GroupType;
  isOwner: boolean;
};

export default function GroupSettingsTab({ group, isOwner }: Props) {
  const t = useTranslations('groups');
  const locale = useLocale();
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/groups/invite/${group.invite_token}`;

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(inviteLink);
    toast.success(t('inviteLinkCopied'));
  }
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute: toggleGroup, isExecuting: isToggling } = useAction(
    toggleJoinGroupAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: deleteGroup, isExecuting: isDeleting } = useAction(
    deleteGroupAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const { execute: leaveGroup, isExecuting: isLeaving } = useAction(
    leaveGroupAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const handleToggle = () => {
    if (group.allow_join_by_link) {
      toggleGroup({
        id: group.id,
        allow_join_by_link: false,
      });
    } else {
      toggleGroup({
        id: group.id,
        allow_join_by_link: true,
      });
    }
  };

  const handleDelete = () => {
    if (isOwner) {
      deleteGroup(group.id);
    } else {
      leaveGroup(group.id);
    }
  };

  return (
    <div className="space-y-6">
      {group.my_role !== 'member' && (
        <GroupForm group={group} type="edit" key={group?.id ?? 'new'} />
      )}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="size-4 text-muted-foreground" />
          <Label>{t('inviteLink')}</Label>
        </div>
        <div className="flex gap-2">
          <Input readOnly value={inviteLink} className="text-sm" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyInviteLink}>
            <Copy className="size-4" />
          </Button>
        </div>
      </div>

      {group.my_role !== 'member' && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">{t('openInvitations')}</p>
            <p className="text-sm text-muted-foreground">
              {t('allowInviteLink')}
            </p>
          </div>
          <Switch
            checked={group.allow_join_by_link}
            onCheckedChange={handleToggle}
            disabled={isToggling}
            aria-label={t('toggleOpenInvitations')}
          />
        </div>
      )}

      <Button
        type="button"
        variant="destructive"
        onClick={() => setConfirmOpen(true)}
        disabled={isOwner ? isDeleting : isLeaving}>
        {isOwner && isDeleting
          ? t('deleting')
          : !isOwner && isLeaving
            ? t('leaving')
            : isOwner
              ? t('deleteGroup')
              : t('leaveGroup')}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isOwner ? t('deleteGroupTitle') : t('leaveGroupTitle')}
        description={
          isOwner
            ? t('deleteGroupDesc')
            : t('leaveGroupDesc')
        }
        confirmText={isOwner ? t('deleteConfirm') : t('leaveConfirm')}
        onConfirm={handleDelete}
      />
    </div>
  );
}

