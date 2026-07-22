'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type {
  MenuItem,
  RestaurantType,
  MenuItems,
} from '@/types/restaurant/restaurant';

import RestaurantMenuClientView from './RestaurantMenuClientView';
import type { OrderingContext } from './MenuItemCustomizer';

type Props = {
  restaurant: RestaurantType;
  items: MenuItems[];
  showScannedMenu?: boolean;
  orderingContext?: OrderingContext;
};

function normalizeMenuItems(inputItems: MenuItems[]): MenuItem[] {
  return inputItems.flatMap((group) =>
    group.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      price: Number(item.price),
      is_available: item.is_available,
      image_url: item.image_url ?? '/storage/restaurants/restaurant.jpeg',
      options: [],
    })),
  );
}

export default function RestaurantMenuView({
  restaurant,
  items,
  showScannedMenu = true,
  orderingContext = 'restaurant',
}: Props) {
  const t = useTranslations('restaurants');
  const normalizedItems = normalizeMenuItems(items);
  const scannedMenu = restaurant.scanned_menu || null;

  return (
    <div className="space-y-6">
      {showScannedMenu && scannedMenu && (
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="font-medium">{t('scannedMenu')}</p>
              <p className="text-sm text-muted-foreground">
                {t('tapToViewMenu')}
              </p>
            </div>
            <a
              href={scannedMenu}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t('open')}
              <ExternalLink className="size-4" />
            </a>
          </div>
          <a
            href={scannedMenu}
            target="_blank"
            rel="noopener noreferrer"
            className="block">
            <div className="relative h-40 w-full sm:h-48">
              <Image
                src={scannedMenu}
                alt="Scanned menu"
                fill
                className="object-cover transition hover:opacity-90"
              />
            </div>
          </a>
        </div>
      )}

      <RestaurantMenuClientView
        restaurant={restaurant}
        items={normalizedItems}
        orderingContext={orderingContext}
      />
    </div>
  );
}

