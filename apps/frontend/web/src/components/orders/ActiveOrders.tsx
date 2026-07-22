import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { buildQueryString } from '@/utils/api-helpers';
import type { ApiResponse } from '@/types/api/api-response';
import type { OrderResponse } from '@/types/orders/order';
import OrderCard from './OrderCard';

export default async function ActiveOrders() {
  const t = await getTranslations('common');

  const response = await serverFetch<ApiResponse<OrderResponse[]>>(
    '/user/orders/active',
  );

  const orders = response.data;

  if (orders.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-lg font-medium">{t('noActiveOrders')}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('noActiveOrdersDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {orders.length} {orders.length === 1 ? t('activeOrder') : t('activeOrders')}
      </p>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
