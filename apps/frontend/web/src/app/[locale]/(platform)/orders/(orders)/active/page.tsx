import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import ActiveOrders from '@/components/orders/ActiveOrders';

export default async function ActiveOrdersPage() {
  const tc = await getTranslations('common');

  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">{tc('loadingOrders')}</div>}>
      <ActiveOrders />
    </Suspense>
  );
}
