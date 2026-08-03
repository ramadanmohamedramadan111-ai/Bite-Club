'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationCard from './NotificationCard';
import type { Notification } from '@/types/notifications';
import { useAction } from 'next-safe-action/hooks';
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  revalidateNotifications,
} from '@/actions/notifications';
import { PaginatedResponse } from '@/types/api';
import AppPagination from '../shared/AppPagination';
import { toast } from 'sonner';

interface Props {
  initialData: PaginatedResponse<Notification>;
  currentPage: number;
}

export default function NotificationsPageView({
  initialData,
  currentPage,
}: Props) {
  const t = useTranslations('notifications');
  const tc = useTranslations('common');

  const [markingId, setMarkingId] = useState<string | null>(null);

  const { execute: executeMarkAsRead } = useAction(
    markNotificationAsReadAction,
    {
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await revalidateNotifications();
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
      onSettled: () => {
        setMarkingId(null);
      },
    },
  );

  const { execute: executeMarkAllAsRead, isPending: isMarkingAll } = useAction(
    markAllNotificationsAsReadAction,
    {
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await revalidateNotifications();
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const notifications = initialData.items ?? [];
  const meta = initialData.meta;
  const totalItems = meta?.total ?? 0;
  const totalPages = meta?.last_page ?? 1;

  const hasUnread = notifications.some((notification) => !notification.read_at);

  const markAsRead = (id: string) => {
    setMarkingId(id);
    executeMarkAsRead(id);
  };

  const markAllAsRead = () => {
    executeMarkAllAsRead();
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>

        {hasUnread && (
          <Button
            variant="outline"
            disabled={isMarkingAll}
            onClick={markAllAsRead}
          >
            {isMarkingAll && <Loader2 className="animate-spin" />}
            {isMarkingAll ? t('markingAllAsRead') : t('markAllAsRead')}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {totalItems}{' '}
        {totalItems === 1 ? tc('notification') : tc('notifications')}
      </p>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              isMarking={markingId === notification.id}
            />
          ))
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">{t('noNotifications')}</p>
          </div>
        )}
      </div>

      <AppPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

