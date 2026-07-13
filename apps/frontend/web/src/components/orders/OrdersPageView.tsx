'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import OrdersFilters from './OrdersFilters';
import OrderCard from './OrderCard';
import OrdersPagination from './OrdersPagination';
import { filterOrders } from '@/data/mock-orders';
import type {
  OrderFulfillmentFilter,
  OrdersTab,
  OrderTypeFilter,
} from '@/types/orders/order';

const ORDERS_PER_PAGE = 4;

export default function OrdersPageView() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'all') as OrdersTab;
  const fulfillment = (searchParams.get('fulfillment') ??
    'all') as OrderFulfillmentFilter;
  const type = (searchParams.get('type') ?? 'all') as OrderTypeFilter;
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const filteredOrders = useMemo(
    () => filterOrders({ tab, fulfillment, type }),
    [tab, fulfillment, type],
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE,
  );

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Track your past and current orders, and reorder your favorites.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-20">
            <OrdersFilters />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            {filteredOrders.length} order
            {filteredOrders.length === 1 ? '' : 's'}
          </p>

          <div className="space-y-4">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <p className="text-lg font-medium">No orders found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <OrdersPagination currentPage={safePage} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
