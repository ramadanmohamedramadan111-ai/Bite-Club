import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { MenuItems, RestaurantType } from '@/types/restaurant';
import RestaurantDetailMenuClient from '@/components/restaurants/RestaurantDetailMenuClient';
import { getUserId } from '@/utils/api-helpers';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
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



export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<RestaurantType>>(`/user/restaurants/${id}`);
    const restaurant = res?.data;
    if (restaurant) {
      return {
        title: t('restaurantMenu.title', { restaurant: restaurant.name }),
        description: t('restaurantMenu.description', { restaurant: restaurant.name, description: restaurant.description || '' }),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('restaurantMenu.fallbackTitle'),
  };
}
