import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import OrdersTabs from '@/components/orders/OrdersTabs';
import ActiveOrders from '@/components/orders/ActiveOrders';
import PastOrders from '@/components/orders/PastOrders';

interface OrdersPageProps {
  searchParams: Promise<{ tab?: string; page?: string; per_page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations('orders');
  const tc = await getTranslations('common');
  const { tab = 'active', page = '1', per_page = '15' } = await searchParams;
  const currentTab = tab === 'past' ? 'past' : 'active';

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <OrdersTabs currentTab={currentTab} />

      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">{tc('loadingOrders')}</div>}>
        {currentTab === 'active' ? (
          <ActiveOrders />
        ) : (
          <PastOrders page={Number(page)} perPage={Number(per_page)} />
        )}
      </Suspense>
    </div>
  );
}
