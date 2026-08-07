import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { ApiResponse } from '@/types/api';
import type { OrderDetails } from '@/types/order';
import OrderDetailPageView from '@/components/orders/OrderDetailPageView';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface OrderDetailPageProps {
  params: Promise<{ locale: string; orderId: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const t = await getTranslations('common');
  const { orderId } = await params;

  const response = await serverFetch<ApiResponse<OrderDetails>>(
    `/user/orders/${orderId}`,
    'GET',
    {
      next: {
        tags: [`order-details-${orderId}`],
      },
    },
  );

  const order = response.data;

  if (!order) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">{t('orderNotFound')}</p>
        <Link href="/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToOrders')}
          </Button>
        </Link>
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value || null;

  return <OrderDetailPageView order={order} token={token} />;
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string; orderId: string }> }): Promise<Metadata> {
  const { locale, orderId } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<OrderDetails>>(`/user/orders/${orderId}`);
    const order = res?.data;
    if (order) {
      return {
        title: t('orderDetail.title', { id: order.id, restaurant: order.restaurant.name }),
        description: t('orderDetail.description', { restaurant: order.restaurant.name, status: order.status, total: order.financials.total }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('orderDetail.fallbackTitle'),
  };
}
