import GroupOrderPageView from '@/components/groups/GroupOrderPageView';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { GroupOrderCartSession } from '@/types/group-order/group-order';
import { MenuItems } from '@/types/restaurant/restaurant';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
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

  const sessionMenu = await serverFetch<
    ApiResponse<PaginatedResponse<MenuItems>>
  >(`/user/restaurants/${sessionCart.data.restaurant.id}/menu`, 'GET', {
    next: {
      tags: [`group-order-session-menu-${id}`],
    },
  });

  const currentUserId = await getUserId();

  return (
    <GroupOrderPageView
      sessionId={id}
      sessionCart={sessionCart.data}
      sessionMenu={sessionMenu.data.items}
      currentUserId={currentUserId}
    />
  );
}

