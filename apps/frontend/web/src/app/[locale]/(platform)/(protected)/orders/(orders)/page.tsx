import type { Metadata } from 'next';
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


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('ordersActive.title'),
    description: t('ordersActive.description'),
  };
}
