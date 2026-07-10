import { notFound } from 'next/navigation';
import {
  getMenuItemsByRestaurantId,
  getRestaurantById,
} from '@/data/restaurant-details';
import RestaurantMenuView from '@/components/restaurants/RestaurantMenuView';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RestaurantMenuPage({ params }: PageProps) {
  const { id } = await params;
  const restaurantId = Number(id);
  const restaurant = getRestaurantById(restaurantId);

  if (!restaurant) {
    notFound();
  }

  const items = getMenuItemsByRestaurantId(restaurantId);

  return <RestaurantMenuView restaurant={restaurant} items={items} />;
}
