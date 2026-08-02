'use client';

import { useState } from 'react';
import { BellIcon, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import NotificationCard from '@/components/notifications/NotificationCard';
import type { Notification } from '@/types/notifications';
import { useAction } from 'next-safe-action/hooks';
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  revalidateNotifications,
} from '@/actions/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  unreadCount?: number;
  recentNotifications?: Notification[];
}

export default function NotificationPopover({
  unreadCount = 0,
  recentNotifications = [],
}: Props) {
  const t = useTranslations('notifications');

  const [markingId, setMarkingId] = useState<string | null>(null);

  const { execute: executeMarkAsRead } = useAction(
    markNotificationAsReadAction,
    {
      onSuccess: () => {
        revalidateNotifications();
      },
      onSettled: () => {
        setMarkingId(null);
      },
    },
  );

  const { execute: executeMarkAllAsRead, isPending: isMarkingAll } = useAction(
    markAllNotificationsAsReadAction,
    {
      onSuccess: () => {
        revalidateNotifications();
      },
    },
  );

  const markAsRead = (id: string) => {
    setMarkingId(id);
    executeMarkAsRead(id);
  };

  const markAllAsRead = () => {
    executeMarkAllAsRead();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ltr:-right-0.5 rtl:-left-0.5 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <PopoverTitle>{t('title') || 'Notifications'}</PopoverTitle>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isMarkingAll}
              onClick={markAllAsRead}
            >
              {isMarkingAll && <Loader2 className="animate-spin" />}
              {isMarkingAll ? t('markingAllAsRead') : t('markAllAsRead')}
            </Button>
          )}
        </PopoverHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto p-2">
          {recentNotifications.length > 0 ? (
            recentNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                isMarking={markingId === notification.id}
                compact
              />
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t('noNotifications') || 'No notifications yet'}
            </p>
          )}
        </div>

        <div className="border-t p-2">
          <Button asChild variant="ghost" className="w-full" size="sm">
            <Link href="/notifications">{t('showAll')}</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

