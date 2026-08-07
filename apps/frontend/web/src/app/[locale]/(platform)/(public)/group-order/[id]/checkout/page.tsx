import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { GroupOrderCartSession } from '@/types/group-order';
import GroupOrderCheckoutView from '@/components/checkout/GroupOrderCheckoutView';
import { getTranslations } from 'next-intl/server';
import { ApiResponse } from '@/types/api';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { id } = await params;

  const sessionCart = await serverFetch<ApiResponse<GroupOrderCartSession>>(
    `/user/group-orders/${id}`,
    'GET',
    {
      next: {
        tags: [`group-order-session-${id}`],
      },
    },
  );

  const currentUserId = await getUserId();

  return (
    <GroupOrderCheckoutView
      sessionId={Number(id)}
      sessionCart={sessionCart.data}
      currentUserId={currentUserId}
    />
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<GroupOrderCartSession>>(`/user/group-orders/${id}`);
    const cart = res?.data;
    if (cart) {
      return {
        title: t('groupOrderCheckout.title', { restaurant: cart.restaurant.name }),
        description: t('groupOrderCheckout.description', { restaurant: cart.restaurant.name }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('groupOrderCheckout.fallbackTitle'),
  };
}
