'use client';

import { useSearchParams } from 'next/navigation';
import { getFavoriteMenuItems } from '@/data/mock-favorites';
import { getFavoriteRestaurants } from '@/data/mock-restaurants';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import FavoriteItemCard from './FavoriteItemCard';
import FavoritesTabs from './FavoritesTabs';
import type { FavoritesTab } from '@/types/favorites/favorites';

export default function FavoritesPageView() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') ?? 'restaurants') as FavoritesTab;

  const favoriteRestaurants = getFavoriteRestaurants();
  const favoriteItems = getFavoriteMenuItems();

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="mt-2 text-muted-foreground">
          Your saved restaurants and menu items.
        </p>
      </div>

      <FavoritesTabs />

      {tab === 'restaurants' && (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {favoriteRestaurants.length} saved restaurant
            {favoriteRestaurants.length === 1 ? '' : 's'}
          </p>

          {favoriteRestaurants.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No favorite restaurants yet</p>
            </div>
          )}
        </section>
      )}

      {tab === 'items' && (
        <section className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {favoriteItems.length} saved item
            {favoriteItems.length === 1 ? '' : 's'}
          </p>

          {favoriteItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteItems.map((item) => (
                <FavoriteItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No favorite items yet</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
