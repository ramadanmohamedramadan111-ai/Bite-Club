import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queries';
import { useRealtimeNotifications, useNotificationsStore } from '@/stores/notifications';
import type { RealtimeNotification } from '@/lib/types';

export function RealtimeSubscriber() {
  const queryClient = useQueryClient();

  const handleNotification = useCallback(
    (n: RealtimeNotification) => {
      const inner = n.data;
      const title = n.title ?? inner?.title ?? '';
      const body = n.body ?? inner?.body ?? '';

      useNotificationsStore.getState().incrementUnread(1);
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnreadCount });

      if (title) {
        NotificationHelper.show(title, body);
      }
    },
    [queryClient],
  );

  useRealtimeNotifications(handleNotification);

  return null;
}

const NotificationHelper = {
  show(_title: string, _body: string) {
    // Native push notifications would plug in here.
  },
};