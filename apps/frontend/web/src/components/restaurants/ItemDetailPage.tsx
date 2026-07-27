'use client';

import MenuItemCustomizer from './MenuItemCustomizer';
import type { ClientMenuItem, RestaurantType } from '@/types/restaurant';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type Props = {
  item: ClientMenuItem;
  restaurant: RestaurantType;
  isAuthenticated: boolean;
};

export default function ItemDetailPage({ item, restaurant, isAuthenticated }: Props) {
  const t = useTranslations('restaurants');

  return (
    <div className="container mx-auto max-w-lg px-4 py-6">
      <Link href={`/restaurants/${restaurant.id}`}>
        <Button variant="ghost" size="icon" className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      <MenuItemCustomizer
        item={item}
        variant="page"
        restaurant={restaurant}
        cartType="individual"
        orderingContext="restaurant"
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
