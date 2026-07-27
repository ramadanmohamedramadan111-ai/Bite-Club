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

