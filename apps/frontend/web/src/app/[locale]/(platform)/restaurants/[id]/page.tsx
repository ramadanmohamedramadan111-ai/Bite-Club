import { notFound } from 'next/navigation';
import RestaurantDetailMenu from '@/components/restaurants/RestaurantDetailMenu';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { MenuItems, RestaurantType } from '@/types/restaurant/restaurant';

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

  return <RestaurantDetailMenu restaurant={restaurant} menuItems={menuItems} />;
}


