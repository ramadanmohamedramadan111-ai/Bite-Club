import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { buildQueryString } from '@/utils/api-helpers';
import type { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import type { OrderResponse } from '@/types/orders/order';
import OrderCard from './OrderCard';
import AppPagination from '@/components/shared/AppPagination';

interface PastOrdersProps {
  page: number;
  perPage: number;
}

export default async function PastOrders({ page, perPage }: PastOrdersProps) {
  const t = await getTranslations('common');

  const query = buildQueryString({ page, per_page: perPage });

  const response = await serverFetch<
    ApiResponse<PaginatedResponse<OrderResponse>>
  >(`/user/orders/past${query}`);

  const { items: orders, meta } = response.data;

  if (orders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-lg font-medium">{t('noPastOrders')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('noPastOrdersDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {meta.total} {meta.total === 1 ? t('pastOrder') : t('pastOrders')}
      </p>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
      <AppPagination currentPage={meta.current_page} totalPages={meta.last_page} />
    </div>
  );
}
