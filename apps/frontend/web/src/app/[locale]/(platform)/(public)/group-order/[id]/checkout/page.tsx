import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { GroupOrderCartSession } from '@/types/group-order';
import GroupOrderCheckoutView from '@/components/checkout/GroupOrderCheckoutView';
import { ApiResponse } from '@/types/api';

type PageProps = {
  params: Promise<{ id: string }>;
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



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<GroupOrderCartSession>>(`/user/group-orders/${id}`);
    const cart = res?.data;
    if (cart) {
      return {
        title: `Checkout Group Order - ${cart.restaurant.name} | Bite Club`,
        description: `Complete checkout for group order from ${cart.restaurant.name}.`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Group Order Checkout | Bite Club",
  };
}
