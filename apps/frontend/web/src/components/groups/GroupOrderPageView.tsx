'use client';

import { useTranslations, useLocale } from 'next-intl';
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
import { useEffect } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import {
  cancelGroupAction,
  clearMyItemsGroupOrderAction,
  unlockGroupAction,
  revalidateGroupOrderSessionAction,
} from '@/actions/group-order';
import type { GroupOrderCartSession } from '@/types/group-order';
import type { MenuItems } from '@/types/restaurant';

type Props = {
  sessionId: string;
  sessionCart: GroupOrderCartSession;
  sessionMenu: MenuItems[];
  currentUserId: number | null;
  token: string | null;
};

export default function GroupOrderPageView({
  sessionId,
  sessionCart,
  sessionMenu,
  currentUserId,
  token,
}: Props) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const restaurant = sessionCart.restaurant;
  const membersSummary = sessionCart.members_summary;

  const { execute: revalidateSession } = useAction(
    revalidateGroupOrderSessionAction,
    {
      onSuccess: () => {},
    },
  );

  // Laravel Echo WebSocket Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Attach Pusher to window so Laravel Echo can find it
    (window as any).Pusher = Pusher;

    const wsHost =
      typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const reverbKey =
      process.env.NEXT_PUBLIC_REVERB_APP_KEY || '7shjlvmsslgdjgltf46x';

    const echo = new Echo({
      broadcaster: 'reverb',
      key: reverbKey,
      wsHost: wsHost,
      wsPort: 8081,
      wssPort: 8081,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: '/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      },
    });

    const channelName = `group-order.${sessionId}`;
    console.log(`[Echo] Joining presence channel: ${channelName}`);

    const channel = echo.join(channelName);

    channel.here((users: any[]) => {
      console.log('[Echo] Present users:', users);
    });

    channel.joining((user: any) => {
      console.log('[Echo] User joined:', user);
    });

    channel.leaving((user: any) => {
      console.log('[Echo] User left:', user);
    });

    channel.listen('.item.added', (data: any) => {
      revalidateSession({ sessionId });
    });
    channel.listen('.item.quantity.updated', (data: any) => {
      revalidateSession({ sessionId });
    });
    channel.listen('.item.removed', (data: any) => {
      revalidateSession({ sessionId });
    });
    channel.listen('.user.items.cleared', (data: any) => {
      revalidateSession({ sessionId });
    });
    channel.listen('.order.locked', (data: any) => {
      toast.warning(
        locale === 'ar' ? 'تم قفل الطلب الجماعي.' : 'The group order has been locked.'
      );
      revalidateSession({ sessionId });
    });
    channel.listen('.order.unlocked', (data: any) => {
      toast.success(
        locale === 'ar' ? 'تم إلغاء قفل الطلب الجماعي.' : 'The group order has been unlocked.'
      );
      revalidateSession({ sessionId });
    });
    channel.listen('.order.cancelled', (data: any) => {
      toast.error(
        locale === 'ar' ? 'تم إلغاء الطلب الجماعي.' : 'The group order has been cancelled.'
      );
      revalidateSession({ sessionId });
    });
    channel.listen('.order.placed', (data: any) => {
      toast.success(
        locale === 'ar' ? 'تم تقديم الطلب الجماعي بنجاح!' : 'The group order has been placed successfully!'
      );
      revalidateSession({ sessionId });
    });

    return () => {
      console.log(`[Echo] Leaving presence channel: ${channelName}`);
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [sessionId, revalidateSession]);

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
    <div className="container mx-auto max-w-7xl space-y-8">
      {/* Title & Info Section with bottom separator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-6">
        <div className="flex items-start gap-4">
          {restaurant.image_url && (
            <div className="relative size-16 overflow-hidden rounded-2xl border border-border/30 shadow-xs shrink-0 select-none">
              <Image
                src={restaurant.image_url}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t('groupOrder')}
              </h1>

              {/* Locked vs Open Badge style */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold shadow-xs select-none',
                  sessionCart.status === 'locked'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                )}>
                {sessionCart.status === 'locked' ? (
                  <Lock className="size-3" />
                ) : (
                  <CheckCircle2 className="size-3" />
                )}
                {sessionCart.status === 'locked' ? t('locked') : t('open')}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2.5">
              <p className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {restaurant.name}
              </p>
              <span
                className="h-0.5 w-10 shrink-0 rounded-full bg-primary/60"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Member tags & Info details */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-accent/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Users className="size-3.5 text-primary" />
            <span>
              {t('host')}: {sessionCart.host.name}
            </span>
          </span>
        </div>
      </div>

      {/* Members summary block */}
      {membersSummary.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="size-4.5 text-primary" />
              <span>{t('members')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2.5 pt-5">
            {membersSummary.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center gap-2 rounded-xl border border-border/40 bg-accent/20 px-3.5 py-1.5 text-xs font-semibold text-foreground">
                <Avatar className="size-5 rounded-full">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {member.user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {member.user.name}
                  {currentUserId !== null &&
                    member.user.id === currentUserId && (
                      <span className="ms-1 text-[10px] font-medium text-muted-foreground">
                        ({tc('you')})
                      </span>
                    )}
                  {member.user.id === sessionCart.host.id && (
                    <span className="ms-1 text-[10px] font-medium text-amber-500">
                      ({t('host')})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grid container layout */}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <GroupOrderMenuItems
            sessionId={groupOrderId}
            menuGroups={sessionMenu}
          />
        </div>

        <div className="space-y-4">
          {isHost && (
            <div className="space-y-2.5">
              {sessionCart.status === 'locked' && (
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl h-10 border-border/60 hover:bg-accent/40 cursor-pointer font-bold text-sm"
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
                    className="w-full gap-2 rounded-xl h-10 cursor-pointer font-bold text-sm"
                    disabled={isCancelling}>
                    <XCircle className="size-4" />
                    {t('cancelGroupOrder')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('cancelGroupOrderTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('cancelGroupOrderDesc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      {tc('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelOrder(groupOrderId)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                      {t('cancelGroupOrderConfirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <Card className="h-fit xl:sticky xl:top-24">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-base font-bold">
                {t('groupCart')}
              </CardTitle>
              {totalItems > 0 && (
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                    disabled={isClearing}
                    onClick={() => clearMyItems(groupOrderId)}>
                    <Trash2 className="size-3.5" />
                    {t('clearMyItems')}
                  </Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-5">
              {totalItems === 0 ? (
                <p className="text-sm text-muted-foreground italic">
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

