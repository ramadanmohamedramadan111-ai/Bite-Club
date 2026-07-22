'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Bike, Heart, MapPin, ShoppingBag, Star } from 'lucide-react';
import type { RestaurantType } from '@/types/restaurant/restaurant';
import RestaurantGroupOrderActions from './RestaurantGroupOrderActions';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantDetailHeader({ restaurant }: Props) {
  const t = useTranslations('restaurants');
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative h-48 w-full sm:h-56">
        <Image
          src={restaurant.cover_image_url}
          alt={`${restaurant.name} cover`}
          fill
          className="object-cover"
          priority
        />
        {!restaurant.is_open_now && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
              {t('currentlyUnavailable')}
            </span>
          </div>
        )}
      </div>

      <div className="relative px-4 pb-5 pt-14 sm:px-6">
        <div className="absolute -top-10 left-4 size-20 overflow-hidden rounded-xl border-4 border-card bg-card shadow-sm sm:left-6 sm:size-24">
          <Image
            src={restaurant.logo_url}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex items-start justify-between gap-4 mt-4">
          <div className="min-w-0 space-y-2">
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <Heart
                className={`size-6 shrink-0 ${
                  false ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">
                  {restaurant.average_rating}
                </span>
                {t('reviewsCount', { count: restaurant.reviews_count })}
              </span>

              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" />
                {restaurant.address}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {restaurant.category && (
                <span
                  key={restaurant.category.id}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs">
                  {restaurant.category.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <RestaurantGroupOrderActions restaurant={restaurant} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {restaurant.delivery_enabled && (
            <span className="inline-flex items-center gap-1.5">
              <Bike className="size-4" />
              {t('delivery')}
            </span>
          )}
          {restaurant.pickup_enabled && (
            <span className="inline-flex items-center gap-1.5">
              <ShoppingBag className="size-4" />
              {t('pickup')}
            </span>
          )}
          {/* {restaurant.creditCard && (
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="size-4" />
              Credit Card
            </span>
          )} */}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {restaurant.minimum_order && (
            <span className="inline-flex items-center gap-1.5">
              {t('minimumOrder', { amount: restaurant.minimum_order.toFixed(0) })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

