import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantType, TopRestaurant } from '@/types/restaurant/restaurant';
import { cookies } from 'next/headers';
import { buildQueryString } from '@/utils/api-helpers';
import RestaurantCard from '../restaurants/RestaurantCard';

export default async function TopRestaurants() {
  const t = await getTranslations('home');
  const cookieStore = await cookies();

  const lat = cookieStore.get('lat')?.value;
  const lng = cookieStore.get('lng')?.value;

  const query = buildQueryString({ latitude: lat, longitude: lng, limit: 5 });

  const data = await serverFetch<ApiResponse<TopRestaurant[]>>(
    `/user/restaurants/nearest${query}`,
  );

  const topRestaurants = data.data;

  const restaurants: RestaurantType[] = topRestaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    logo_url: restaurant.logo_url,
    cover_image_url: restaurant.cover_image_url,
    category: undefined,
    address: undefined,
    phone_number: undefined,
    average_rating: Number(restaurant.average_rating),
    reviews_count: restaurant.reviews_count,
    delivery_enabled: restaurant.settings.delivery_enabled,
    pickup_enabled: restaurant.settings.pickup_enabled,
    delivery_fee_per_km: undefined,
    is_open_now: restaurant.settings.is_open,
    opening_hours: undefined,
    latitude: Number(restaurant.settings.latitude),
    longitude: Number(restaurant.settings.longitude),
  }));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {lat && lng ? t('topRestaurantsNear') : t('topRestaurants')}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {lat && lng
              ? t('topRestaurantsNearDesc')
              : t('topRestaurantsDesc')}
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit gap-2">
          <Link href="/restaurants">
            {t('viewAll')}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
}

