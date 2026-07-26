import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import PastOrders from '@/components/orders/PastOrders';

type Props = {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
  }>;
};

export default async function PastOrdersPage({ searchParams }: Props) {
  const tc = await getTranslations('common');
  const { page = '1', per_page = '15' } = await searchParams;

  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">{tc('loadingOrders')}</div>}>
      <PastOrders page={Number(page)} perPage={Number(per_page)} />
    </Suspense>
  );
}
