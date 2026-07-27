import { notFound } from 'next/navigation';
import { serverFetch } from '@/utils/server-fetch';
import { getUserId } from '@/utils/api-helpers';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { MenuItems, MenuItem, RestaurantType, ClientMenuItem } from '@/types/restaurant';
import ItemDetailPage from '@/components/restaurants/ItemDetailPage';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ id: string; itemId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, itemId } = await params;

  try {
    const restaurantRes = await serverFetch<ApiResponse<RestaurantType>>(
      `/user/restaurants/${id}`,
    );
    const restaurant = restaurantRes.data;
    if (!restaurant) return {};

    const menuRes = await serverFetch<ApiResponse<PaginatedResponse<MenuItems>>>(
      `/user/restaurants/${id}/menu`,
    );
    const allItems = menuRes.data?.items?.flatMap((c) => c.items) ?? [];
    const menuItem = allItems.find((i) => String(i.id) === itemId);

    if (!menuItem) return {};

    return {
      title: `${menuItem.title} - ${restaurant.name}`,
      description: menuItem.description,
      openGraph: {
        title: `${menuItem.title} - ${restaurant.name}`,
        description: menuItem.description,
        images: menuItem.image_url ? [{ url: menuItem.image_url }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ItemPage({ params }: PageProps) {
  const { id, itemId } = await params;

  const [restaurantRes, menuRes] = await Promise.all([
    serverFetch<ApiResponse<RestaurantType>>(`/user/restaurants/${id}`),
    serverFetch<ApiResponse<PaginatedResponse<MenuItems>>>(
      `/user/restaurants/${id}/menu`,
    ),
  ]);

  const restaurant = restaurantRes?.data ?? null;
  const allItems = menuRes?.data?.items?.flatMap((c) => c.items) ?? [];
  const menuItem = allItems.find((i) => String(i.id) === itemId) ?? null;

  if (!restaurant || !menuItem) {
    notFound();
  }

  const categoryTitle =
    menuRes?.data?.items?.find((c) => c.items.some((i) => String(i.id) === itemId))
      ?.title ?? '';

  const clientItem: ClientMenuItem = {
    id: menuItem.id,
    name: menuItem.title,
    description: menuItem.description || '',
    price: Number(menuItem.price),
    categories: categoryTitle ? [categoryTitle] : [],
    likesCount: 0,
    preparationTime: 15,
    available: menuItem.is_available,
    image: menuItem.image_url || '',
    options: [],
    restaurantId: restaurant.id,
  };

  const userId = await getUserId();

  return <ItemDetailPage item={clientItem} restaurant={restaurant} isAuthenticated={!!userId} />;
}
