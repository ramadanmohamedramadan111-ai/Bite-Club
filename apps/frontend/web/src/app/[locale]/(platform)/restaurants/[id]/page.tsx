import { notFound } from 'next/navigation';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { MenuItems, RestaurantType } from '@/types/restaurant/restaurant';
import RestaurantDetailMenuClient from '@/components/restaurants/RestaurantDetailMenuClient';
import { getUserId } from '@/utils/api-helpers';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { id } = await params;

  const data = await serverFetch<ApiResponse<RestaurantType>>(
    `/user/restaurants/${id}`,
  );

  const restaurant = data.data;

  if (!restaurant) {
    notFound();
  }

  const menuItemsData = await serverFetch<
    ApiResponse<PaginatedResponse<MenuItems>>
  >(`/user/restaurants/${id}/menu`);

  const menuItems = menuItemsData.data.items || [];

  const userId = await getUserId();

  return (
    <div className="space-y-6">
      <RestaurantDetailMenuClient
        restaurant={restaurant}
        menuItems={menuItems}
        orderingContext={'restaurant'}
        isAuthenticated={!!userId}
      />
    </div>
  );
}

