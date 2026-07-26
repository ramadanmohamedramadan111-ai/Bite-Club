import { getTranslations } from 'next-intl/server';
import OrdersTabs from '@/components/orders/OrdersTabs';

export default async function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('orders');

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <OrdersTabs />

      {children}
    </div>
  );
}
