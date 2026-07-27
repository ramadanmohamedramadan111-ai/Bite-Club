import { getTranslations } from 'next-intl/server';

import type { GroupOrderHistory } from '@/types/group-order';
import AppPagination from '../shared/AppPagination';
import GroupOrderHistoryCard from './GroupOrderHistoryCard';

type Props = {
  groupId: number;
  orders: GroupOrderHistory[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export default async function GroupHistoryTab({
  groupId,
  orders,
  meta,
}: Props) {
  const t = await getTranslations('groups');

  if (orders.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          {t('orderHistoryEmpty')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('showingOrders', { count: orders.length, total: meta.total })}
      </p>

      <div className="space-y-3">
        {orders.map((order) => (
          <GroupOrderHistoryCard key={order.id} order={order} />
        ))}
      </div>

      <AppPagination
        currentPage={meta.current_page}
        totalPages={meta.last_page}
      />
    </div>
  );
}
