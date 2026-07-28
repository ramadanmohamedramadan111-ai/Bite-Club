'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Bike, Heart, Star, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { RestaurantType } from '@/types/restaurant';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantCard({ restaurant }: Props) {
  const t = useTranslations('restaurants');

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs hover:shadow-md hover:border-border/70 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative w-full h-40 overflow-hidden bg-muted">
        <Link href={`/restaurants/${restaurant.id}`} className="block h-full w-full">
          <Image
            src={restaurant.cover_image_url || restaurant.logo_url}
            alt={restaurant.name}
            width={400}
            height={240}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Favorite Heart Button */}
        <button 
          type="button"
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-muted-foreground hover:text-red-500 transition-colors shadow-sm cursor-pointer z-10"
        >
          <Heart className="h-4.5 w-4.5" />
        </button>

        {/* Floating Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-background/90 backdrop-blur-md px-2 py-0.5 text-xs font-bold text-foreground shadow-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.average_rating.toFixed(1)}</span>
        </div>

        {/* Status Overlay if Closed */}
        {!restaurant.is_open_now && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <span className="rounded-full bg-background/95 backdrop-blur-xs px-3.5 py-1.5 text-xs font-semibold shadow-md text-foreground">
              {t('currentlyUnavailable')}
            </span>
          </div>
        )}
      </div>

      {/* Floating Logo Overlay */}
      <div className="relative px-4">
        <div className="absolute -top-7 left-4 z-10 flex size-14 items-center justify-center rounded-xl border-2 border-background bg-background shadow-md overflow-hidden">
          <Image
            src={restaurant.logo_url}
            alt={`${restaurant.name} Logo`}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col pt-9 pb-4 px-4">
        <div className="flex-1">
          <Link href={`/restaurants/${restaurant.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-base leading-tight text-foreground">{restaurant.name}</h3>
          </Link>

          {/* Description / Categories */}
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {restaurant.description || (restaurant.category ? restaurant.category.name : '')}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-2">
          {/* Minimum Order */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('minimumOrder', { amount: restaurant.minimum_order })}</span>
          </div>

          {/* Delivery & Time / Fee Details */}
          <div className="flex items-center justify-between mt-0.5">
            {/* Delivery Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
              <Bike className="h-4 w-4 text-primary" />
              <span>
                {restaurant.delivery_enabled 
                  ? (restaurant.delivery_fee_per_km && restaurant.delivery_fee_per_km > 0 
                      ? `EGP ${restaurant.delivery_fee_per_km}/km` 
                      : 'Free Delivery') 
                  : 'Pickup Only'}
              </span>
            </div>

            {/* Simulated Delivery Time badge like Talabat */}
            <div className="flex items-center gap-1 rounded-md bg-accent/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>25-35 min</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
