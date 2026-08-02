'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Bike, MapPin, ShoppingBag, Star } from 'lucide-react';
import type { RestaurantType } from '@/types/restaurant';
import RestaurantGroupOrderActions from './RestaurantGroupOrderActions';
import { Separator } from '@/components/ui/separator';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantDetailHeader({ restaurant }: Props) {
  const t = useTranslations('restaurants');
  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300">
      {/* Cover Image */}
      <div className="relative h-48 w-full sm:h-64 md:h-72 bg-muted">
        <Image
          src={restaurant.cover_image_url || restaurant.logo_url}
          alt={`${restaurant.name} cover`}
          fill
          className="object-cover"
          priority
        />
        {!restaurant.is_open_now && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="rounded-full bg-background/95 backdrop-blur-xs px-4 py-2 text-sm font-semibold shadow-md text-foreground">
              {t('currentlyUnavailable')}
            </span>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="relative px-4 pb-6 pt-16 sm:px-6 md:px-8">
        {/* Floating Logo Badge */}
        <div className="absolute -top-12 left-4 size-24 overflow-hidden rounded-2xl border-4 border-card bg-background shadow-lg sm:left-6 sm:-top-16 sm:size-28 z-20">
          <Image
            src={restaurant.logo_url}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Header Header Action Details */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{restaurant.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground">
              {/* Star Rating */}
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/90">
                <Star className="size-4.5 fill-amber-400 text-amber-400" />
                <span>{restaurant.average_rating.toFixed(1)}</span>
                <span className="font-normal text-muted-foreground">
                  {t('reviewsCount', { count: restaurant.reviews_count })}
                </span>
              </span>

              {/* Location Address */}
              {restaurant.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4.5 text-muted-foreground" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{restaurant.address}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {restaurant.category && (
                <span
                  key={restaurant.category.id}
                  className="rounded-full bg-muted border border-border/30 px-3 py-1 text-xs font-medium text-foreground/80"
                >
                  {restaurant.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Group order actions button aligned properly */}
          <div className="flex items-center shrink-0 pt-2 md:pt-0">
            <RestaurantGroupOrderActions restaurant={restaurant} />
          </div>
        </div>

        <Separator className="my-5 border-border/30" />

        {/* Badges footer row containing delivery fee details */}
        <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm">
          {restaurant.delivery_enabled && (
            <div className="flex items-center gap-2 text-foreground/80 font-medium">
              <Bike className="size-4.5 text-primary" />
              <span>
                {restaurant.delivery_fee_per_km && restaurant.delivery_fee_per_km > 0 
                  ? `${t('delivery')}: EGP ${restaurant.delivery_fee_per_km}/km` 
                  : `${t('delivery')}: Free`}
              </span>
            </div>
          )}
          {restaurant.pickup_enabled && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="size-4.5" />
              <span>{t('pickup')} Available</span>
            </div>
          )}
          {restaurant.minimum_order && (
            <div className="flex items-center gap-1.5 text-muted-foreground border-l border-border/40 pl-6">
              <span>{t('minimumOrder', { amount: restaurant.minimum_order.toFixed(0) })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
