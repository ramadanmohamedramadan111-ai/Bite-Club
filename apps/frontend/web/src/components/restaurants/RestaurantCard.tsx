'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Star, Store } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { RestaurantType } from '@/types/restaurant';

type Props = {
  restaurant: RestaurantType;
};

export default function RestaurantCard({ restaurant }: Props) {
  const t = useTranslations('restaurants');
  const locale = useLocale();

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs hover:shadow-md hover:border-border/70 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative w-full h-40 overflow-hidden bg-muted">
        <Link href={`/restaurants/${restaurant.id}`} className="block h-full w-full">
          {restaurant.cover_image_url || restaurant.logo_url ? (
            <Image
              src={restaurant.cover_image_url || restaurant.logo_url}
              alt={restaurant.name}
              width={400}
              height={240}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Store className="size-10 text-muted-foreground/40" />
            </div>
          )}
        </Link>



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
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={`${restaurant.name} Logo`}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Store className="size-6 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col pt-9 pb-4 px-4">
        <div className="flex-1">
          <Link href={`/restaurants/${restaurant.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-base leading-tight text-foreground">{restaurant.name}</h3>
          </Link>

          {restaurant.category_name && (
            <div className="mt-1.5 mb-1.5 flex items-center">
              <span className="inline-flex items-center rounded-md bg-muted/65 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/80">
                {restaurant.category_name}
              </span>
            </div>
          )}

          {/* Description */}
          {restaurant.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {restaurant.description}
            </p>
          )}
        </div>

        {(restaurant.delivery_enabled || restaurant.pickup_enabled) && (
          <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-1.5 items-center">
            {restaurant.delivery_enabled && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/5 px-2 py-0.5 text-xs font-semibold text-emerald-700/90 dark:text-emerald-400 border border-emerald-500/15">
                {locale === 'ar' ? 'توصيل متاح' : 'Delivery'}
              </span>
            )}
            {restaurant.pickup_enabled && (
              <span className="inline-flex items-center rounded-md bg-slate-500/5 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-500/15">
                {locale === 'ar' ? 'استلام متاح' : 'Pickup'}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
