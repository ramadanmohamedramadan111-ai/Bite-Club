'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Users, Trash2, Lock, XCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from '@/i18n/navigation';

import GroupCartActionButton from '@/components/cart/GroupCartActionButton';
import GroupCartItemsList from '@/components/cart/GroupCartItemsList';
import GroupCartTotals from '@/components/cart/GroupCartTotals';
import GroupOrderMenuItems from '@/components/groups/GroupOrderMenuItems';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  cancelGroupAction,
  clearMyItemsGroupOrderAction,
  unlockGroupAction,
} from '@/actions/group-order';
import type { GroupOrderCartSession } from '@/types/group-order';
import type { MenuItems } from '@/types/restaurant';

type Props = {
  sessionId: string;
  sessionCart: GroupOrderCartSession;
  sessionMenu: MenuItems[];
  currentUserId: number | null;
};

export default function GroupOrderPageView({
  sessionId,
  sessionCart,
  sessionMenu,
  currentUserId,
}: Props) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const router = useRouter();
  const restaurant = sessionCart.restaurant;
  const membersSummary = sessionCart.members_summary;
  const totalItems = membersSummary.reduce((sum, m) => sum + m.items.length, 0);
  const isHost =
    currentUserId !== null && sessionCart.host.id === currentUserId;
  const groupOrderId = sessionCart.id;

  const { execute: clearMyItems, isExecuting: isClearing } = useAction(
    clearMyItemsGroupOrderAction,
    {
      onSuccess: () => {
        toast.success(t('myItemsCleared'));
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to clear items');
      },
    },
  );

  const { execute: unlockOrder, isExecuting: isUnlocking } = useAction(
    unlockGroupAction,
    {
      onSuccess: () => {
        toast.success(t('groupOrderUnlocked'));
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError?.message ?? 'Failed to unlock group order',
        );
      },
    },
  );

  const { execute: cancelOrder, isExecuting: isCancelling } = useAction(
    cancelGroupAction,
    {
      onSuccess: () => {
        toast.success(t('groupOrderCancelled'));
        router.push('/groups');
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError?.message ?? 'Failed to cancel group order',
        );
      },
    },
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8">
      <div className="flex items-start gap-4">
        {restaurant.image_url && (
          <div className="relative size-16 overflow-hidden rounded-xl">
            <Image
              src={restaurant.image_url}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{t('groupOrder')}</h1>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                sessionCart.status === 'locked'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              )}>
              {sessionCart.status === 'locked' ? (
                <Lock className="size-3" />
              ) : (
                <CheckCircle2 className="size-3" />
              )}
              {sessionCart.status === 'locked' ? t('locked') : t('open')}
            </span>
          </div>
          <p className="mt-1 text-muted-foreground">{restaurant.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <Users className="size-3.5" />
              {t('host')}: {sessionCart.host.name}
            </span>
          </div>
        </div>
      </div>

      {membersSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('members')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {membersSummary.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">
                    {member.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {member.user.name}
                  {currentUserId !== null &&
                    member.user.id === currentUserId && (
                      <span className="ms-1 text-xs text-muted-foreground">
                        {tc('you')}
                      </span>
                    )}
                  {member.user.id === sessionCart.host.id && (
                    <span className="ms-1 text-xs text-muted-foreground">
                      {t('host')}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <GroupOrderMenuItems
            sessionId={groupOrderId}
            menuGroups={sessionMenu}
          />
        </div>

        <div className="space-y-4">
          {isHost && (
            <>
              {sessionCart.status === 'locked' && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isUnlocking}
                  onClick={() => unlockOrder(groupOrderId)}>
                  <Lock className="size-4" />
                  {t('unlockGroupOrder')}
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={isCancelling}>
                    <XCircle className="size-4" />
                    {t('cancelGroupOrder')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('cancelGroupOrderTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('cancelGroupOrderDesc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelOrder(groupOrderId)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('cancelGroupOrderConfirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <Card className="h-fit xl:sticky xl:top-20">
            <CardHeader>
              <CardTitle className="text-base">{t('groupCart')}</CardTitle>
              {totalItems > 0 && (
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={isClearing}
                    onClick={() => clearMyItems(groupOrderId)}>
                    <Trash2 className="size-3.5" />
                    {t('clearMyItems')}
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {totalItems === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('noItemsYet')}
                </p>
              ) : (
                <GroupCartItemsList
                  membersSummary={membersSummary}
                  sessionId={groupOrderId}
                  currentUserId={currentUserId}
                />
              )}

              <GroupCartTotals
                membersSummary={membersSummary}
                totalAmount={sessionCart.total_amount}
              />

              {isHost && <GroupCartActionButton sessionId={groupOrderId} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

